import React, { useState, memo, useEffect } from "react";
import { useTreeContext } from "./TreeContext";
import clsx from "clsx";

function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

const TypeBadge = ({ v }: { v: any }) => {
  const type = v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
  return (
    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800">
      {type}
    </span>
  );
};

export default memo(function TreeNode({ keyName, value, path, depth }: any) {
  const { expandSignal, collapseSignal } = useTreeContext();
  const [open, setOpen] = useState(depth < 1);
  const leaf = value === null || typeof value !== "object";

  // React to global expand/collapse
  useEffect(() => {
    if (!leaf) setOpen(true);
  }, [expandSignal]);

  useEffect(() => {
    if (!leaf) setOpen(false);
  }, [collapseSignal]);

  function preview() {
    if (leaf) return String(value);
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (isObject(value)) return `Object(${Object.keys(value).length})`;
    return String(value);
  }

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 select-none">
        {!leaf && (
          <button aria-label="toggle" onClick={() => setOpen((o) => !o)} className="w-5 h-5">
            {open ? "▾" : "▸"}
          </button>
        )}
        <div className="flex-1 code-font">
          <span className="font-mono text-blue-500">{keyName}:</span>
          <span className="ml-2 truncate max-w-[60vw]">{preview()}</span>
          <TypeBadge v={value} />
        </div>
      </div>

      {/* Always render children, but hide when closed (so expandAll works deeply) */}
      {!leaf && (
        <div
          className={clsx(
            "pl-4 border-l border-gray-300 dark:border-gray-600",
            !open && "hidden"
          )}
        >
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
