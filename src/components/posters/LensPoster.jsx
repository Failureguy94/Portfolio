import { Poster } from './Poster'

const CX = 200
const CY = 205
const hex = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i + Math.PI / 12
  return [CX + Math.cos(a) * 46, CY + Math.sin(a) * 46]
})

export function LensPoster({ id, alt }) {
  const ticks = Array.from({ length: 31 }, (_, i) => 32 + i * 11.2)
  return (
    <Poster id={id} alt={alt} bg="var(--color-bass)">
      <g filter="url(#rough)">
        <circle cx={CX} cy={CY} r="152" fill="var(--color-ink)" />
      </g>
      <circle cx={CX} cy={CY} r="126" fill="var(--color-ink-2)" />
      <circle cx={CX} cy={CY} r="138" fill="none" stroke="var(--color-paper)" strokeWidth="2" strokeDasharray="3 9" />
      {/* aperture blades: each edge of the opening extends out to the barrel */}
      {hex.map(([x, y], i) => {
        const [nx, ny] = hex[(i + 1) % 6]
        const dx = nx - x
        const dy = ny - y
        const len = Math.hypot(dx, dy)
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + (dx / len) * 150}
            y2={y + (dy / len) * 150}
            stroke="var(--color-paper)"
            strokeWidth="2.5"
            clipPath={`url(#${id}-clip)`}
          />
        )
      })}
      <clipPath id={`${id}-clip`}>
        <circle cx={CX} cy={CY} r="126" />
      </clipPath>
      <polygon points={hex.map((p) => p.join(',')).join(' ')} fill="var(--color-mustard)" />
      <circle cx="232" cy="168" r="11" fill="var(--color-paper)" />
      {/* timeline */}
      <path d="M24 440 H376" stroke="var(--color-ink)" strokeWidth="3" />
      {ticks.map((x, i) => (
        <line key={x} x1={x} y1="440" x2={x} y2={i % 5 === 0 ? 418 : 430} stroke="var(--color-ink)" strokeWidth="2.5" />
      ))}
      <rect x="252" y="402" width="6" height="56" fill="var(--color-paper)" />
      <path d="M244 398 h22 l-11 12 z" fill="var(--color-paper)" />
      <text x="24" y="484" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="600" fill="var(--color-ink)">
        CH-04
      </text>
      <text x="376" y="484" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="600" fill="var(--color-ink)">
        02:14:07
      </text>
    </Poster>
  )
}
