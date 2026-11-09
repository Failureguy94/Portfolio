import { Poster } from './Poster'

export function SlickPoster({ id, alt }) {
  return (
    <Poster id={id} alt={alt} bg="var(--color-mustard)">
      {/* satellite */}
      <g transform="translate(78 92) rotate(-22)" filter="url(#rough)">
        <g className="anim bob" style={{ animationDuration: '5s' }}>
        <rect x="-34" y="-7" width="26" height="14" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="3" />
        <rect x="8" y="-7" width="26" height="14" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="3" />
        <rect x="-9" y="-11" width="18" height="22" fill="var(--color-ink)" />
        </g>
      </g>
      {/* the look-down */}
      <path d="M88 112 L158 262" stroke="var(--color-ink)" strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round" className="dash-flow" />
      {/* slick */}
      <path
        filter="url(#rough)"
        fill="var(--color-ink)"
        d="M52 318c-24-64 30-122 98-112 50 8 72-46 138-20 58 23 46 106-4 140-42 29-44 92-124 88-70-4-62-36-108-96z"
      />
      <path d="M118 300c24-26 66-30 98-12" stroke="var(--color-paper)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M150 352c18-10 40-10 58-2" stroke="var(--color-paper)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* AIS track out of the slick */}
      <path
        d="M262 214 C280 170 300 150 318 118"
        stroke="var(--color-ink)"
        strokeWidth="3.5"
        fill="none"
        strokeDasharray="2 10"
        strokeLinecap="round"
        className="dash-flow"
      />
      {[
        [270, 190],
        [292, 156],
        [310, 130],
      ].map(([x, y], i) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="5"
          fill="var(--color-paper)"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          className="ping"
          style={{ '--d': `${i * 0.4}s` }}
        />
      ))}
      {/* ship */}
      <g transform="translate(330 98) rotate(-8)" filter="url(#rough)">
        <g className="anim bob">
          <path d="M-34 0 H34 L24 16 H-26 Z" fill="var(--color-bass)" />
          <rect x="-12" y="-14" width="20" height="14" fill="var(--color-ink)" />
        </g>
      </g>
      {/* horizon of sea */}
      <path d="M0 468 H400" stroke="var(--color-ink)" strokeWidth="2" />
      <path d="M0 480 H400" stroke="var(--color-ink)" strokeWidth="1" />
    </Poster>
  )
}
