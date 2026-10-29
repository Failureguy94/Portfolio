import { useCallback, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export function Magnetic({ children, maxDistance = 6, className = '' }) {
  const shouldReduce = useReducedMotion()
  const isDesktop =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const ref = useRef(null)
  const [style, setStyle] = useState({})

  const onMouseMove = useCallback(
    (e) => {
      if (shouldReduce || !isDesktop || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const moveX = Math.max(-maxDistance, Math.min(maxDistance, dx * 0.2))
      const moveY = Math.max(-maxDistance, Math.min(maxDistance, dy * 0.2))
      setStyle({
        transform: `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`,
        transition: 'transform 80ms ease-out',
      })
    },
    [shouldReduce, isDesktop, maxDistance],
  )

  const onMouseLeave = useCallback(() => {
    if (shouldReduce || !isDesktop) return
    setStyle({
      transform: 'translate(0px, 0px)',
      transition: 'transform 200ms ease-out',
    })
  }, [shouldReduce, isDesktop])

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  )
}
