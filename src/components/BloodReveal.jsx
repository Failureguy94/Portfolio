import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTrailMask } from '../hooks/useTrailMask'
import { ART, ART_SRC } from '../lib/bloodArt'

const SWEEP_KEY = 'portfolio_blood_sweep'
const EDGE = 8 // px the slide keeps from the hero's edges

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

function loadArt() {
  const load = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      img.decode().then(() => resolve(img), reject)
    })
  return load(ART_SRC.webp).catch(() => load(ART_SRC.png))
}

/**
 * Where the artwork sits in the hero, in the coordinates of the name's container:
 * pool behind the first half of the first name line, slide up and to the right.
 * Scales with the name, but shrinks to keep the slide inside the hero on narrow screens.
 */
function artRect(host, name) {
  if (!host || !name?.firstElementChild) return null
  const first = name.firstElementChild
  const W = host.clientWidth
  const lineH = parseFloat(getComputedStyle(name).fontSize) * 0.86
  const nameX = name.offsetLeft + first.offsetLeft
  const poolX = nameX + first.offsetWidth * 0.42
  const poolY = name.offsetTop + lineH * 0.42

  let s = lineH / ART.refLineHeight
  s = Math.min(s, (W - EDGE * 2) / (ART.maxX - ART.minX), (poolY - EDGE) / (ART.poolCy - ART.minY))
  let x = poolX - ART.poolCx * s
  const y = poolY - ART.poolCy * s
  const right = x + ART.maxX * s
  if (right > W - EDGE) x -= right - (W - EDGE)
  return { x, y, w: ART.width * s, h: ART.height * s }
}

function sweepNotSeen() {
  try {
    return sessionStorage.getItem(SWEEP_KEY) !== '1'
  } catch {
    return false
  }
}

/** The blood-slide artwork, hidden in the hero and wiped into view by the pointer. Decorative. */
export function BloodReveal({ hostRef, nameRef, ready }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  // first visit this session? read once, so the sweep plays at most once
  const [firstVisit] = useState(sweepNotSeen)
  const sweep = ready && !reduced && firstVisit

  useEffect(() => {
    let alive = true
    const cancel = afterFirstPaint(() => {
      loadArt()
        .then((img) => alive && setImage(img))
        .catch(() => {})
    })
    return () => {
      alive = false
      cancel()
    }
  }, [])

  const getRect = useCallback(() => artRect(hostRef.current, nameRef.current), [hostRef, nameRef])
  const onSweepStart = useCallback(() => {
    try {
      sessionStorage.setItem(SWEEP_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  useTrailMask({ hostRef, canvasRef, image, getRect, reduced, sweep, onSweepStart })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-blood-reveal=""
      data-running="false"
      className="pointer-events-none absolute left-0 top-0 h-0 w-0"
    />
  )
}
