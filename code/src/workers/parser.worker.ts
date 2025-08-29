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