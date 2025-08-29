import React from "react";
import { TreeProvider, useTreeContext } from "./TreeContext";
import TreeNode from "./TreeNode";

const Controls = () => {
  const { triggerExpand, triggerCollapse } = useTreeContext();
  return (
    <div className="flex gap-2 mb-2">
      <button onClick={triggerExpand} className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">
        Expand All
      </button>
      <button onClick={triggerCollapse} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
        Collapse All
      </button>
    </div>
  );
};

export default function TreeViewer({ data, error }: { data: any; error: any }) {
  return (
    <>
      {error && <div className="card p-4 text-red-500">{String(error)}</div>}
      {data === null && <div className="card p-4 text-gray-500">Paste JSON or load a file to begin</div>}
      {data && (
        <TreeProvider>
          <Controls />
          <TreeNode keyName="root" value={data} path="root" depth={0} />
        </TreeProvider>
      )}
    </>
  );
}