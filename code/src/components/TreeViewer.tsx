import React, { useMemo, useState } from 'react'
import TreeNode from './TreeNode'

export default function TreeViewer({ data, error }: any) {
  if (error) return <div className="card p-4 text-red-500">{String(error)}</div>
  if (data === null) return <div className="card p-4 text-gray-500">Paste JSON or load a file to begin</div>

  return (
    <div className="card p-2">
      <div className="mb-2 text-sm text-gray-600">Root</div>
      <div className="overflow-auto max-h-[70vh]">
        <TreeNode keyName="root" value={data} path="$" depth={0} />
      </div>
    </div>
  )
}