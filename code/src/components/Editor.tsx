import React, { useState, useEffect } from 'react'
import { safeParse } from '../utils/jsonUtils'

export default function Editor({ raw, setRaw, onParse, onError }: any) {
  const [local, setLocal] = useState(raw)

  useEffect(() => setLocal(raw), [raw])

  useEffect(() => {
    const id = setTimeout(() => {
      const r = safeParse(local ?? '')
      if (r.error) onError(r.error.message)
      else onParse(r.parsed)
    }, 400)
    return () => clearTimeout(id)
  }, [local, onParse, onError])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { const t = String(reader.result); setLocal(t); setRaw(t) }
    reader.readAsText(f)
  }

  return (
    <div className="card p-2">
      <label className="block text-sm font-medium mb-1">Paste / Load JSON</label>
      <textarea className="w-full h-64 p-2 code-font bg-white dark:bg-gray-800 rounded border" value={local ?? ''} onChange={e => { setLocal(e.target.value); setRaw(e.target.value) }} aria-label="JSON input" />
      <div className="flex gap-2 mt-2">
        <input type="file" accept="application/json" onChange={onFile} />
      </div>
    </div>
  )
}