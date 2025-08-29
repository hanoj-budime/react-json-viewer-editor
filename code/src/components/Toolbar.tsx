import React from 'react'
import { pretty, minify } from '../utils/jsonUtils'

export default function Toolbar({ raw, setRaw, setData, setError }: any) {
  function onPretty() {
    try {
      const p = JSON.stringify(JSON.parse(raw), null, 2)
      setRaw(p)
      setData(JSON.parse(p))
      setError(null)
    } catch (e: any) { setError(e.message) }
  }
  function onMinify() {
    try {
      const m = JSON.stringify(JSON.parse(raw))
      setRaw(m)
      setData(JSON.parse(m))
      setError(null)
    } catch (e: any) { setError(e.message) }
  }
  function onDownload() {
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="sticky top-0 bg-transparent z-10">
      <div className="flex gap-2">
        <button className="btn" onClick={onPretty}>Pretty</button>
        <button className="btn" onClick={onMinify}>Minify</button>
        <button className="btn" onClick={onDownload}>Download</button>
      </div>
    </div>
  )
}