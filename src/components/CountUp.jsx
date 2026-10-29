import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export function CountUp({ value, duration = 1200, format = (v) => v, className = '' }) {
  const shouldReduce = useReducedMotion()
  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
  const [displayValue, setDisplayValue] = useState(0)
  const nodeRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (shouldReduce) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()
          const startVal = 0

          const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(1, elapsed / duration)
            // ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(startVal + (numValue - startVal) * ease)
            setDisplayValue(current)

            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setDisplayValue(numValue)
            }
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.1 },
    )

    const el = nodeRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [numValue, duration, shouldReduce])

  if (shouldReduce) {
    return <span className={className}>{format(numValue)}</span>
  }

  return (
    <span ref={nodeRef} className={className}>
      {format(displayValue)}
    </span>
  )
}
