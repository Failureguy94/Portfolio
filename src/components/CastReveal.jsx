import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTrailMask } from '../hooks/useTrailMask'
import { loadAfterFirstPaint } from '../lib/loadArt'

const SRC = ['/art/cast-scene.png'] // used exactly as supplied: never cropped or stretched
const GAP = 24 // px kept clear below the heading

// layout position of `el` inside `host` (ignores transforms)
function within(el, host) {
  let x = 0
  let y = 0
  for (let n = el; n && n !== host; n = n.offsetParent) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

// the image's own shape fitted inside `area` (whole image visible, never stretched)
function fitImage(area, image) {
  if (!area || !image) return area
  const a = (image.naturalWidth || image.width) / (image.naturalHeight || image.height)
  let w = area.w
  let h = w / a
  if (h > area.h) {
    h = area.h
    w = h * a
  }
  return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h }
}

/**
 * The area the scene covers, in the section's coordinates: from the section's left edge across
 * the first two card columns, from the top of the cards to the bottom (one column on phones).
 * Never behind the heading. Layout offsets are used, so card transforms never move it.
 */
function sceneArea(host, header, grid) {
  if (!host || !header || !grid) return null
  const cards = [...grid.children].map((c) => within(c, host))
  if (!cards.length) return null
  const head = within(header, host)
  const xs = [...new Set(cards.map((c) => c.x))].sort((m, n) => m - n)
  const col2 = cards.filter((c) => c.x === xs[Math.min(1, xs.length - 1)])
  const right = Math.max(...col2.map((c) => c.x + c.w))
  const top = Math.max(head.y + head.h + GAP, Math.min(...cards.map((c) => c.y)))
  const bottom = Math.max(...cards.map((c) => c.y + c.h))
  return { x: 0, y: top, w: right, h: bottom - top }
}

/**
 * The Cast & Crew image, hidden across the left of the section and wiped into view by the
 * pointer. Never behind the heading or intro text. Decorative.
 */
export function CastReveal({ hostRef, headerRef, gridRef }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)

  useEffect(() => loadAfterFirstPaint(SRC, setImage), [])

  const getRect = useCallback(() => {
    return fitImage(sceneArea(hostRef.current, headerRef.current, gridRef.current), image)
  }, [hostRef, headerRef, gridRef, image])

  useTrailMask({ hostRef, canvasRef, image, getRect, reduced })

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
