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