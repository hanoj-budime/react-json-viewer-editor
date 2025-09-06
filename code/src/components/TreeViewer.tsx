// src/components/TreeViewer.tsx
import React from "react";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/solid";
import { TreeProvider, useTreeContext } from "../context/TreeContext";
import TreeNode from "./TreeNode";

const Controls = () => {
  const { triggerExpand, triggerCollapse } = useTreeContext();
  return (
    <div className="flex gap-2 mb-2">
      <button
        onClick={triggerExpand}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        title="Expand All"
      >
        <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        onClick={triggerCollapse}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        title="Collapse All"
      >
        <ArrowsPointingInIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

interface Props {
  data: any;
  error?: string | null;
  highlightPath?: string | null;
}

export default function TreeViewer({ data, error, highlightPath = null }: Props) {
  if (error) return <div className="card p-4 text-red-500">{String(error)}</div>;
  if (data === null) return <div className="card p-4 text-gray-500">Enter or paste JSON data here, or load a file</div>;

  return (
    <TreeProvider>
      <div className="card p-2">
        <div className="flex items-center justify-between">
          <div className="block text-sm font-medium mb-1">Root</div>
          <Controls />
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <TreeNode keyName="root" value={data} path="$" depth={0} selectedPath={highlightPath} />
        </div>
      </div>
    </TreeProvider>
  );
}
