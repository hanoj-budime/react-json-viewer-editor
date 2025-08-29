# Modern JSON Viewer — Full Codebase (key files)

This document contains the key files for the React + TypeScript Vite project described in the prompt. Use it as the single-file preview for the project. Files are shown as fenced code blocks and include comments to explain implementation details.

---

## File tree

```
modern-json-viewer/
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ index.html
├─ tailwind.config.cjs
├─ postcss.config.cjs
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ styles/index.css
│  ├─ hooks/useParserWorker.ts
│  ├─ workers/parser.worker.ts
│  ├─ components/
│  │  ├─ Editor.tsx
│  │  ├─ TreeViewer.tsx
│  │  ├─ TreeNode.tsx
│  │  ├─ SearchBar.tsx
│  │  ├─ Toolbar.tsx
│  │  └─ HelpModal.tsx
│  ├─ utils/jsonUtils.ts
│  └─ types.d.ts
├─ public/demo-data/
│  ├─ small.json
│  ├─ medium.json
│  └─ large.json
├─ tests/
│  ├─ parser.spec.ts
│  └─ treeviewer.spec.tsx
└─ README.md
```

---

## package.json

```json
{
  "name": "modern-json-viewer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-window": "^1.8.6",
    "clsx": "^1.2.1",
    "@tanstack/react-query": "^4.30.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.20",
    "autoprefixer": "^10.4.13",
    "eslint": "^8.31.0",
    "prettier": "^2.8.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

---

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020'
  }
})
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "ES2020"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

---

## index.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Modern JSON Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## tailwind.config.cjs

```js
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

---

## postcss.config.cjs

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## src/styles/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }

.code-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Segoe UI Mono', monospace; }
```

---

## src/types.d.ts

```ts
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
export interface JsonObject { [k: string]: JsonValue }
```

---

## src/utils/jsonUtils.ts

```ts
// Helpful helpers: safeParse with position, pretty/minify
export function safeParse(text: string) {
  try {
    // Use a deterministic parse - JSON.parse doesn't give line/col; we give an approximation
    const parsed = JSON.parse(text)
    return { parsed, error: null }
  } catch (e: any) {
    // naive line/col detection
    const msg = e.message || 'Invalid JSON'
    const m = /at position (\d+)/.exec(msg)
    let pos = null
    if (m) pos = parseInt(m[1], 10)
    return { parsed: null, error: { message: msg, position: pos } }
  }
}

export function pretty(json: unknown, spaces = 2) {
  return JSON.stringify(json, null, spaces)
}

export function minify(json: unknown) {
  return JSON.stringify(json)
}
```

---

## src/workers/parser.worker.ts

```ts
// simple web worker to parse JSON off-main-thread
self.addEventListener('message', (ev: MessageEvent) => {
  const { id, text } = ev.data
  try {
    const parsed = JSON.parse(text)
    // Post result
    ;(self as any).postMessage({ id, parsed })
  } catch (err: any) {
    ;(self as any).postMessage({ id, error: err.message })
  }
})
```

---

## src/hooks/useParserWorker.ts

```ts
import { useEffect, useRef } from 'react'

export function useParserWorker(onResult: (id: string, result: any) => void) {
  const workerRef = useRef<Worker | null>(null)
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), { type: 'module' })
    const w = workerRef.current
    w.onmessage = (ev) => {
      onResult(ev.data.id, ev.data)
    }
    return () => { w.terminate() }
  }, [onResult])

  function parse(id: string, text: string) {
    workerRef.current?.postMessage({ id, text })
  }

  return { parse }
}
```

---

## src/main.tsx

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## src/App.tsx

```tsx
import React, { useState, useMemo, useCallback } from 'react'
import Editor from './components/Editor'
import TreeViewer from './components/TreeViewer'
import Toolbar from './components/Toolbar'
import SearchBar from './components/SearchBar'

export default function App() {
  const [raw, setRaw] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light')

  const onParse = useCallback((parsed: any) => {
    setData(parsed)
    setError(null)
  }, [])

  const onError = useCallback((err: string) => {
    setData(null)
    setError(err)
  }, [])

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto p-4">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Modern JSON Viewer</h1>
            <div className="flex gap-2 items-center">
              <SearchBar data={data} />
              <button className="btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>Theme</button>
            </div>
          </header>

          <Toolbar raw={raw} setRaw={setRaw} setData={setData} setError={setError} />

          <main className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <section className="md:col-span-1">
              <Editor raw={raw} setRaw={setRaw} onParse={onParse} onError={onError} />
            </section>
            <section className="md:col-span-2">
              <TreeViewer data={data} error={error} />
            </section>
          </main>

        </div>
      </div>
    </div>
  )
}
```

---

## src/components/Editor.tsx

```tsx
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
```

---

## src/components/TreeViewer.tsx

```tsx
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
```

---

## src/components/TreeNode.tsx

```tsx
import React, { useState, memo } from 'react'
import clsx from 'clsx'

function isObject(v: any) { return v && typeof v === 'object' && !Array.isArray(v) }

const TypeBadge = ({ v }: { v: any }) => {
  const type = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v
  return <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800">{type}</span>
}

export default memo(function TreeNode({ keyName, value, path, depth }: any) {
  const [open, setOpen] = useState(depth < 1)
  const leaf = value === null || typeof value !== 'object'

  function preview() {
    if (leaf) return String(value)
    if (Array.isArray(value)) return `Array(${value.length})`
    if (isObject(value)) return `Object(${Object.keys(value).length})`
    return String(value)
  }

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 select-none">
        {!leaf && (
          <button aria-label="toggle" onClick={() => setOpen(o => !o)} className="w-5 h-5">{open ? '▾' : '▸'}</button>
        )}
        <div className="flex-1 code-font">
          <span className="font-mono">{keyName}:</span>
          <span className="ml-2 truncate max-w-[60vw]">{preview()}</span>
          <TypeBadge v={value} />
        </div>
      </div>
      {open && !leaf && (
        <div className="pl-4 border-l">{
          Array.isArray(value) ? (
            value.map((v: any, i: number) => (
              <TreeNode key={i} keyName={`${i}`} value={v} depth={depth+1} path={`${path}[${i}]`} />
            ))
          ) : (
            Object.entries(value).map(([k, v]) => (
              <TreeNode key={k} keyName={k} value={v} depth={depth+1} path={`${path}.${k}`} />
            ))
          )
        }</div>
      )}
    </div>
  )
})
```

---

## src/components/SearchBar.tsx

```tsx
import React from 'react'

export default function SearchBar({ data }: any) {
  // placeholder UI - full search implementation in advanced iterations
  return (
    <div className="p-2">
      <input className="rounded p-1" placeholder="Search (key/value)" aria-label="Search" />
    </div>
  )
}
```

---

## src/components/Toolbar.tsx

```tsx
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
```

---

## src/components/HelpModal.tsx

```tsx
import React from 'react'

export default function HelpModal() {
  return null // left as exercise; included for completeness
}
```

---

## tests/parser.spec.ts

```ts
import { describe, it, expect } from 'vitest'
import { safeParse } from '../src/utils/jsonUtils'

describe('safeParse', () => {
  it('parses valid json', () => {
    const { parsed, error } = safeParse('{"a":1}')
    expect(error).toBeNull()
    expect(parsed).toEqual({ a: 1 })
  })
  it('returns error on invalid json', () => {
    const { parsed, error } = safeParse('{a:1}')
    expect(parsed).toBeNull()
    expect(error).not.toBeNull()
  })
})
```

---

## README.md (short)

```md
# Modern JSON Viewer

## Run

1. npm install
2. npm run dev

## Build

npm run build

## Tests

npm run test

```

---


*Notes*: This codebase is intentionally compact and focused on demonstrating core features and architecture. For a production-ready app you'd add more polished styling, ARIA attributes, keyboard handling, virtualization for extremely deep trees, full search with highlighting, inline editing flows, permalinks, and an advanced worker-based streaming parser for very large files.

