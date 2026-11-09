import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTrailMask } from '../hooks/useTrailMask'
import { loadAfterFirstPaint } from '../lib/loadArt'

const SRC = ['/art/cast-night.webp']
// keep the cinema and the seated figure in frame when the portrait image is cropped to a wide section
const FOCUS = [0.5, 0.66]
const GAP = 24 // px between the heading block and the top of the reveal

/**
 * The Cast & Crew night scene, hidden behind the skill cards and wiped into view by the pointer.
 * It covers everything below the heading (where the pointer spends most of its time) and never
 * sits behind the heading or intro text. Decorative.
 */
export function CastReveal({ hostRef, headerRef }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)

  useEffect(() => loadAfterFirstPaint(SRC, setImage), [])

  const getRect = useCallback(() => {
    const host = hostRef.current
    const header = headerRef.current
    if (!host || !header) return null
    const top = header.getBoundingClientRect().bottom - host.getBoundingClientRect().top + GAP
    return { x: 0, y: top, w: host.clientWidth, h: Math.max(0, host.clientHeight - top) }
  }, [hostRef, headerRef])

  useTrailMask({ hostRef, canvasRef, image, getRect, reduced, cover: FOCUS })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-cast-reveal=""
      data-running="false"
      className="pointer-events-none absolute left-0 top-0 h-0 w-0"
    />
  )
}
