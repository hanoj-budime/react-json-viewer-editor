// src/components/TreeNode.tsx
import React, { useEffect, useRef, useState, memo } from "react";
import clsx from "clsx";

function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

const TypeBadge = ({ v }: { v: any }) => {
  const type = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  return (
    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
      {type}
    </span>
  );
};

function renderColoredValue(value: any) {
  if (value === null) return <span className="text-gray-500 italic font-mono">null</span>;
  if (Array.isArray(value)) return <span className="text-gray-700 dark:text-gray-300 font-mono">Array({value.length})</span>;
  if (isObject(value)) return <span className="text-gray-700 dark:text-gray-300 font-mono">Object({Object.keys(value).length})</span>;

  switch (typeof value) {
    case "string":
      return <span className="text-green-600 font-mono">"{String(value)}"</span>;
    case "number":
      return <span className="text-purple-500 font-mono">{String(value)}</span>;
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
  selectedPath,
}: any) {
  const [open, setOpen] = useState(depth < 1);
  const leaf = value === null || typeof value !== "object";
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // if the currently selected path is inside this subtree, ensure we open to reveal it
  useEffect(() => {
    if (!selectedPath) return;
    if (selectedPath === path) {
      setOpen(true);
      nodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (selectedPath.startsWith(path + ".") || selectedPath.startsWith(path + "[")) {
      // selected path is a descendant -> open
      setOpen(true);
    }
  }, [selectedPath, path]);

  const isSelected = selectedPath === path;

  function preview() {
    if (leaf) return String(value);
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (isObject(value)) return `Object(${Object.keys(value).length})`;
    return String(value);
  }

  return (
    <div className="pl-2" ref={nodeRef}>
      <div className={clsx("flex items-center gap-2 select-none p-1 rounded", isSelected ? "bg-yellow-100 dark:bg-yellow-700" : "")}>
        {!leaf && (
          <button aria-label="toggle" onClick={() => setOpen((o) => !o)} className="w-5 h-5">
            {open ? "▾" : "▸"}
          </button>
        )}
        <div className="flex-1 code-font flex items-center gap-2">
          <span className="text-blue-500 font-mono">"{keyName}"</span>
          <span className="text-gray-500 font-mono">:</span>
          <span className="ml-1 truncate max-w-[60vw]">
            {renderColoredValue(value)}
          </span>
          <TypeBadge v={value} />
        </div>
      </div>

      {/* Render children always so expand-to-path works; hide visually when closed */}
      {!leaf && (
        <div className={clsx("pl-4 border-l border-gray-300 dark:border-gray-600", !open && "hidden")}>
          {Array.isArray(value)
            ? value.map((v: any, i: number) => (
                <TreeNode key={i} keyName={`${i}`} value={v} depth={depth + 1} path={`${path}[${i}]`} selectedPath={selectedPath} />
              ))
            : Object.entries(value).map(([k, v]) => (
                <TreeNode key={k} keyName={k} value={v} depth={depth + 1} path={`${path}.${k}`} selectedPath={selectedPath} />
              ))}
        </div>
      )}
    </div>
  );
});
