import { useInView } from '../hooks/useInView'

const W = 520
const H = 320
const PAD = { l: 44, r: 56, t: 20, b: 36 }

const fmtMonth = (sec) =>
  new Date(sec * 1000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Hand-drawn line chart of Codeforces rating over time. */
export function RatingChart({ history, title }) {
  const [ref, inView] = useInView({ threshold: 0.35 })
  if (!history?.length) return null

  const t0 = history[0].ratingUpdateTimeSeconds
  const t1 = history.at(-1).ratingUpdateTimeSeconds
  const ratings = history.map((h) => h.newRating)
  const yMax = Math.ceil((Math.max(...ratings) + 150) / 400) * 400
  const yMin = 0
  const x = (t) => PAD.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - PAD.l - PAD.r)
  const y = (r) => H - PAD.b - ((r - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b)

  const pts = history.map((h) => [x(h.ratingUpdateTimeSeconds), y(h.newRating)])
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
  const gridYs = []
  for (let r = 400; r <= yMax; r += 400) gridYs.push(r)

  const years = []
  const startYear = new Date(t0 * 1000).getUTCFullYear() + 1
  const endYear = new Date(t1 * 1000).getUTCFullYear()
  for (let yr = startYear; yr <= endYear; yr++) years.push(yr)

  const first = history[0]
  const last = history.at(-1)
  const summary = `${history.length} rated contests. Rating went from ${first.newRating} in ${fmtMonth(
    first.ratingUpdateTimeSeconds,
  )} to ${last.newRating} in ${fmtMonth(last.ratingUpdateTimeSeconds)}.`

  return (
    <figure ref={ref} className="m-0">
      <figcaption>
        <span className="block font-serif text-base italic text-dim">{title}</span>
        <span className="mt-1 block font-sans text-sm text-dim">{summary}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 block h-auto w-full" aria-hidden="true" focusable="false">
        {gridYs.map((r) => (
          <g key={r}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(r)} y2={y(r)} stroke="var(--color-ink-2)" strokeWidth="1.5" />
            <text x={PAD.l - 10} y={y(r) + 5} textAnchor="end" fontFamily="Inter, sans-serif" fontSize="13" fill="var(--color-dim)">
              {r}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--color-dim)" strokeWidth="1.5" />
        {years.map((yr) => {
          const px = x(Date.UTC(yr, 0, 1) / 1000)
          return (
            <g key={yr}>
              <line x1={px} x2={px} y1={H - PAD.b} y2={H - PAD.b + 7} stroke="var(--color-dim)" strokeWidth="1.5" />
              <text x={px} y={H - 8} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="var(--color-dim)">
                {yr}
              </text>
            </g>
          )
        })}
        <path
          d={d}
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={inView ? 0 : 1}
          style={{ transition: 'stroke-dashoffset 1600ms cubic-bezier(0.16,0.84,0.24,1)' }}
        />
        {pts.slice(0, -1).map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r="2.6" fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="1.5" />
        ))}
        <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="7" fill="var(--color-bass)" />
        <text
          x={pts.at(-1)[0] + 12}
          y={pts.at(-1)[1] + 7}
          fontFamily="Anton, Impact, sans-serif"
          fontSize="22"
          fill="var(--color-mustard)"
        >
          {last.newRating}
        </text>
      </svg>
    </figure>
  )
}
