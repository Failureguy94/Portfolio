import { useRef } from 'react'

/**
 * Tilts its child toward the pointer with a light sheen, like a print held to a lamp.
 * `rest` is the resting rotation. Touch and reduced-motion users get the still print.
 */
export function Tilt({ rest = '0deg', className = '', children }) {
  const ref = useRef(null)
  const frame = useRef(0)

  function onMove(e) {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const tx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ty = ((e.clientY - r.top) / r.height) * 2 - 1
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--tx', tx.toFixed(3))
      el.style.setProperty('--ty', ty.toFixed(3))
      el.style.setProperty('--sheen', '1')
    })
  }
  function onLeave() {
    const el = ref.current
    cancelAnimationFrame(frame.current)
    el.style.setProperty('--tx', '0')
    el.style.setProperty('--ty', '0')
    el.style.setProperty('--sheen', '0')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt relative ${className}`}
      style={{ '--rest': rest }}
    >
      {children}
      <div className="tilt-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  )
}
