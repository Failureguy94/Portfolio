import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTrailMask } from '../hooks/useTrailMask'
import { ART, ART_SRC } from '../lib/bloodArt'
import { loadAfterFirstPaint } from '../lib/loadArt'

const SWEEP_KEY = 'portfolio_blood_sweep'
const EDGE = 8 // px the slide keeps from the hero's edges

/**
 * Where the artwork sits in the hero, in the coordinates of the name's container. The art is drawn
 * against the hero name at a 1900px-wide hero, so it is anchored to the name's first line and scaled
 * with it. On narrow or short heroes it shrinks so the slide and the figure stay inside; the pool may
 * bleed off the left edge.
 */
function artRect(host, name) {
  if (!host || !name?.firstElementChild) return null
  const W = host.clientWidth
  const lineH = parseFloat(getComputedStyle(name).fontSize) * 0.86
  const nameX = name.offsetLeft + name.firstElementChild.offsetLeft
  const nameTop = name.offsetTop

  let s = lineH / ART.refLineHeight
  s = Math.min(s, (W - EDGE * 2) / (ART.maxX - ART.fitMinX), (nameTop - EDGE) / (ART.nameTop - ART.minY))
  let x = nameX - ART.nameX * s
  const y = nameTop - ART.nameTop * s
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
export function BloodReveal({ hostRef, nameRef, inkRef, ready }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  // first visit this session? read once, so the sweep plays at most once
  const [firstVisit] = useState(sweepNotSeen)
  const sweep = ready && !reduced && firstVisit

  useEffect(() => loadAfterFirstPaint([ART_SRC.webp, ART_SRC.png], setImage), [])

  const getRect = useCallback(() => artRect(hostRef.current, nameRef.current), [hostRef, nameRef])
  const onSweepStart = useCallback(() => {
    try {
      sessionStorage.setItem(SWEEP_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  useTrailMask({ hostRef, canvasRef, nameRef, inkRef, image, getRect, reduced, sweep, onSweepStart })

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
