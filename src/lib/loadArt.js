// Decorative artwork is fetched only after the page has loaded and the browser is idle,
// so it never competes with first paint. Failures are silent: the page works without it.

function afterFirstPaint(fn) {
  let id = 0
  let cancelled = false
  const idle = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window) id = window.requestIdleCallback(fn, { timeout: 2500 })
    else id = window.setTimeout(fn, 200)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener('load', idle)
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
    window.clearTimeout(id)
  }
}

function loadFirst(srcs) {
  const load = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      img.decode().then(() => resolve(img), reject)
    })
  return srcs.slice(1).reduce((p, src) => p.catch(() => load(src)), load(srcs[0]))
}

/** Loads the first of `srcs` that decodes, after first paint, and passes it to `onLoad`. Returns a cleanup. */
export function loadAfterFirstPaint(srcs, onLoad) {
  let alive = true
  const cancel = afterFirstPaint(() => {
    loadFirst(srcs)
      .then((img) => alive && onLoad(img))
      .catch(() => {})
  })
  return () => {
    alive = false
    cancel()
  }
}
