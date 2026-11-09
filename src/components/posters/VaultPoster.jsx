import { Poster } from './Poster'

const bolts = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2)

export function VaultPoster({ id, alt }) {
  return (
    <Poster id={id} alt={alt} bg="var(--color-ink)">
      <g filter="url(#rough)">
        <circle cx="186" cy="220" r="156" fill="var(--color-bass)" />
      </g>
      <circle cx="186" cy="220" r="122" fill="none" stroke="var(--color-ink)" strokeWidth="5" />
      {bolts.map((a) => (
        <circle key={a} cx={186 + Math.cos(a) * 139} cy={220 + Math.sin(a) * 139} r="6" fill="var(--color-ink)" />
      ))}
      {/* handle */}
      <g className="spin-med" style={{ transformBox: 'view-box', transformOrigin: '186px 220px' }}>
      {[0, 120, 240].map((deg) => (
        <line
          key={deg}
          x1="186"
          y1="220"
          x2={186 + Math.cos(((deg - 90) * Math.PI) / 180) * 74}
          y2={220 + Math.sin(((deg - 90) * Math.PI) / 180) * 74}
          stroke="var(--color-ink)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      ))}
      <circle cx="186" cy="220" r="24" fill="var(--color-ink)" />
      </g>
      <circle cx="186" cy="220" r="9" fill="var(--color-paper)" />
      {/* magnifier */}
      <g className="sweep-lens">
      <g transform="rotate(-8 300 352)">
        <rect x="330" y="398" width="96" height="22" rx="3" transform="rotate(45 330 398)" fill="var(--color-paper)" filter="url(#rough)" />
        <circle cx="300" cy="352" r="72" fill="var(--color-mustard)" stroke="var(--color-paper)" strokeWidth="14" />
        <path
          d="M268 354 L292 378 L336 326"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="13"
          strokeLinecap="square"
        />
      </g>
      </g>
    </Poster>
  )
}
