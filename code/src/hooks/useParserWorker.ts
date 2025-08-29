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