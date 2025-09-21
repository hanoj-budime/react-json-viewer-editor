// src/components/TreeNode.tsx
import React, { useEffect, useRef, useState, memo } from "react";
import { useTreeContext } from "../context/TreeContext";
import clsx from "clsx";
import { AiOutlinePlusSquare, AiOutlineMinusSquare } from "react-icons/ai";

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
  if (Array.isArray(value))
    return <span className="text-gray-700 dark:text-gray-300 font-mono">Array({value.length})</span>;
  if (isObject(value))
    return <span className="text-gray-700 dark:text-gray-300 font-mono">Object({Object.keys(value).length})</span>;

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

// High-contrast Bracket Pair Colors
const BRACKET_COLORS = [
  "text-red-500 dark:text-red-400",      // Level 1 → Strong warm
  "text-emerald-500 dark:text-emerald-400", // Level 2 → Vivid green
  "text-blue-500 dark:text-blue-400",    // Level 3 → Clean cool
  "text-orange-500 dark:text-orange-400",// Level 4 → Warm accent
  "text-fuchsia-500 dark:text-fuchsia-400", // Level 5 → Bright magenta
  "text-cyan-500 dark:text-cyan-400",    // Level 6 → Aqua contrast
  "text-yellow-500 dark:text-yellow-400" // Level 7 → Bright highlight
];

function getBracketColor(depth: number) {
  return BRACKET_COLORS[depth % BRACKET_COLORS.length];
}

export default memo(function TreeNode({ keyName, value, path, depth, selectedPath }: any) {
  const { expandSignal, collapseSignal } = useTreeContext();
  const [open, setOpen] = useState(depth < 1);
  const leaf = value === null || typeof value !== "object";
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // global expand/collapse signals
  useEffect(() => {
    if (!leaf) setOpen(true);
  }, [expandSignal]);

  useEffect(() => {
    if (!leaf) setOpen(false);
  }, [collapseSignal]);

  // ensure visibility of selected path
  useEffect(() => {
    if (!selectedPath) return;
    if (selectedPath === path) {
      setOpen(true);
      nodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (selectedPath.startsWith(path + ".") || selectedPath.startsWith(path + "[")) {
      setOpen(true);
    }
  }, [selectedPath, path]);

  const isSelected = selectedPath === path;
  const isArray = Array.isArray(value);
  const isObj = isObject(value);

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const bracketColor = getBracketColor(depth);

  return (
    <div className="pl-2" ref={nodeRef}>
      <div
        className={clsx(
          "flex items-center gap-2 select-none p-1 rounded",
          isSelected ? "bg-yellow-100 dark:bg-yellow-700" : ""
        )}
      >
        {/* Expand/Collapse control */}
        <div className="w-5 h-5 flex items-center justify-center">
          {!leaf ? (
            <button
              aria-label="toggle"
              onClick={() => setOpen((o) => !o)}
              className="w-5 h-5 flex items-center justify-center"
            >
              {open ? (
                <AiOutlineMinusSquare className="text-gray-700 dark:text-gray-300" />
              ) : (
                <AiOutlinePlusSquare className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          ) : (
            <span className="inline-block w-4 h-4" />
          )}
        </div>

        {/* Key + value or bracket placeholder */}
        <div className="flex-1 code-font flex items-center gap-2">
          <span className="text-blue-500 font-mono">"{keyName}"</span>
          <span className="text-gray-500 font-mono">:</span>

          {leaf ? (
            <span className="ml-1 truncate max-w-[60vw]">{renderColoredValue(value)}</span>
          ) : (
            <span className={`${bracketColor} font-mono ml-1`}>
              {open ? openBracket : isArray ? "[]" : "{}"}
            </span>
          )}

          <TypeBadge v={value} />
        </div>
      </div>

      {/* Child nodes */}
      {!leaf && (
        <div className={clsx("pl-4 border-l border-gray-300 dark:border-gray-600", !open && "hidden")}>
          {Array.isArray(value)
            ? value.map((v: any, i: number) => (
                <TreeNode
                  key={i}
                  keyName={`${i}`}
                  value={v}
                  depth={depth + 1}
                  path={`${path}[${i}]`}
                  selectedPath={selectedPath}
                />
              ))
            : Object.entries(value).map(([k, v]) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  depth={depth + 1}
                  path={`${path}.${k}`}
                  selectedPath={selectedPath}
                />
              ))}

          {/* Closing bracket */}
          {open && (
            <div className={`pl-6 font-mono ${bracketColor}`}>
              {closeBracket}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
