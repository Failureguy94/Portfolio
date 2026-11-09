import { useInView } from '../hooks/useInView'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Digits roll up to their value once, when the number first enters view.
 * Screen readers get the plain value.
 */
export function RollingNumber({ value, suffix = '', className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.5 })
  if (value == null) {
    return (
      <span ref={ref} className={`font-sans text-[0.5em] text-dim ${className}`}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">not applicable</span>
      </span>
    )
  }
  const text = String(value)
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {text}
        {suffix}
      </span>
      <span className="roll" aria-hidden="true">
        {text.split('').map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="roll-slot">
              {/* the target digit sets the slot width, so narrow digits like 1 don't leave gaps */}
              <span className="invisible">{ch}</span>
              <span
                className="roll-col"
                style={{
                  transform: `translateY(${inView ? -Number(ch) : 0}em)`,
                  '--roll-delay': `${i * 90}ms`,
                }}
              >
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
        {suffix ? <span>{suffix}</span> : null}
      </span>
    </span>
  )
}
