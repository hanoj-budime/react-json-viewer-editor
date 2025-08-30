// src/components/TreeViewer.tsx
import React from "react";
import TreeNode from "./TreeNode";

interface Props {
  data: any;
  error?: string | null;
  highlightPath?: string | null;
}

export default function TreeViewer({ data, error, highlightPath = null }: Props) {
  console.log("data :>> ", data);
  console.log("error :>> ", error);
  if (error) return <div className="card p-4 text-red-500">{String(error)}</div>;
  if (data === null) return <div className="card p-4 text-gray-500">Enter or paste JSON data here, or load a file</div>;

  return (
    <div className="card p-2">
      <div className="mb-2 text-sm text-gray-800 dark:text-gray-200">Root</div>
      <div className="overflow-auto max-h-[70vh]">
        <TreeNode keyName="root" value={data} path="$" depth={0} selectedPath={highlightPath} />
      </div>
    </div>
  );
}
