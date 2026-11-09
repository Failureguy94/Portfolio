import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTrailMask } from '../hooks/useTrailMask'
import { loadAfterFirstPaint } from '../lib/loadArt'

const SRC = ['/art/cast-scene.png'] // used exactly as supplied: never cropped or stretched
const NUDGE = 48 // px the image sits to the right of its slot, where there is room
const GAP = 24 // px kept clear around the heading and the cards
const MIN_STRIP = 180 // narrower than this, the left strip is not worth using

/**
 * Where the scene sits, in the section's coordinates. In order of preference:
 * 1. the empty strip left of the cards (wide screens), from below the heading to the last card;
 * 2. the empty grid cell after the last card (when the last row is not full);
 * 3. everything below the heading, behind the cards (phones).
 * Layout offsets are used, so the cards' entrance and hover transforms never move it.
 */
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

// the image's own shape fitted inside `area` (whole image visible), then nudged right
function fitImage(area, image, maxRight) {
  if (!area || !image) return area
  const a = (image.naturalWidth || image.width) / (image.naturalHeight || image.height)
  let w = area.w
  let h = w / a
  if (h > area.h) {
    h = area.h
    w = h * a
  }
  const x = Math.min(area.x + (area.w - w) / 2 + NUDGE, maxRight - w)
  return { x: Math.max(area.x, x), y: area.y + (area.h - h) / 2, w, h }
}

function sceneRect(host, header, grid) {
  if (!host || !header || !grid) return null
  const cards = [...grid.children].map((c) => within(c, host))
  if (!cards.length) return null
  const head = within(header, host)
  const top = head.y + head.h + GAP
  const cardsLeft = Math.min(...cards.map((c) => c.x))
  const cardsBottom = Math.max(...cards.map((c) => c.y + c.h))

  const stripW = cardsLeft - GAP
  if (stripW >= MIN_STRIP) return { area: { x: 0, y: top, w: stripW, h: cardsBottom - top }, maxRight: cardsLeft - 8 }

  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
  if (cols > 1 && cards.length % cols !== 0) {
    const last = cards.at(-1)
    const step = cards[1].x - cards[0].x
    return { area: { x: last.x + step, y: last.y, w: last.w, h: last.h }, maxRight: host.clientWidth - 8 }
  }
  return { area: { x: 0, y: top, w: host.clientWidth, h: Math.max(0, host.clientHeight - top) }, maxRight: host.clientWidth }
}

/**
 * The Cast & Crew night scene, hidden in the empty space beside the skill cards and wiped into
 * view by the pointer. Never behind the heading or intro text. Decorative.
 */
export function CastReveal({ hostRef, headerRef, gridRef }) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)

  useEffect(() => loadAfterFirstPaint(SRC, setImage), [])

  const getRect = useCallback(() => {
    const slot = sceneRect(hostRef.current, headerRef.current, gridRef.current)
    return slot && fitImage(slot.area, image, slot.maxRight)
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
