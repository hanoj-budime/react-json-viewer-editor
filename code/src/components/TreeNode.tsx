import React, { useState, memo } from "react";

// Helper to check if value is plain object
function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

// Small badge showing the type
const TypeBadge = ({ v }: { v: any }) => {
  const type = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  return (
    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
      {type}
    </span>
  );
};

// Apply colors based on value type
function renderColoredPreview(value: any): JSX.Element {
  if (value === null)
    return <span className="text-gray-500 italic font-mono">null</span>;
  if (Array.isArray(value))
    return (
      <span className="text-gray-700 dark:text-gray-300 font-mono">
        Array({value.length})
      </span>
    );
  if (isObject(value))
    return (
      <span className="text-gray-700 dark:text-gray-300 font-mono">
        Object({Object.keys(value).length})
      </span>
    );

  switch (typeof value) {
    case "string":
      return <span className="text-green-600 font-mono">"{value}"</span>;
    case "number":
      return <span className="text-purple-500 font-mono">{value}</span>;
    case "boolean":
      return <span className="text-yellow-600 font-mono">{String(value)}</span>;
    default:
      return <span className="font-mono">{String(value)}</span>;
  }
}

export default memo(function TreeNode({
  keyName,
  value,
  path,
  depth,
}: {
  keyName: string;
  value: any;
  path: string;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const leaf = value === null || typeof value !== "object";

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 select-none">
        {!leaf && (
          <button
            aria-label="toggle"
            onClick={() => setOpen((o) => !o)}
            className="w-5 h-5"
          >
            {open ? "▾" : "▸"}
          </button>
        )}
        <div className="flex-1 code-font">
          <span className="text-blue-500 font-mono">"{keyName}"</span>
          <span className="text-gray-500 font-mono">: </span>
          <span className="ml-1 truncate max-w-[60vw]">
            {renderColoredPreview(value)}
          </span>
          <TypeBadge v={value} />
        </div>
      </div>
      {open && !leaf && (
        <div className="pl-4 border-l border-gray-300 dark:border-gray-600">
          {Array.isArray(value)
            ? value.map((v: any, i: number) => (
                <TreeNode
                  key={i}
                  keyName={`${i}`}
                  value={v}
                  depth={depth + 1}
                  path={`${path}[${i}]`}
                />
              ))
            : Object.entries(value).map(([k, v]) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  depth={depth + 1}
                  path={`${path}.${k}`}
                />
              ))}
        </div>
      )}
    </div>
  );
});
