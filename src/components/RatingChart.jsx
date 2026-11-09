import { useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const W = 560
const H = 340
const PAD = { l: 44, r: 62, t: 20, b: 36 }
const LABEL_GAP = 22 // min vertical gap between end labels
const HIT = 30 // hover radius in chart units

const fmtDate = (sec) =>
  new Date(sec * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const fmtMonth = (sec) =>
  new Date(sec * 1000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Series marker: shape is the second encoding, so identity never rests on colour alone. */
export function Marker({ shape, x = 0, y = 0, size = 8, color, ring = 'var(--color-ink)' }) {
  const h = size / 2
  const common = { fill: color, stroke: ring, strokeWidth: 2, paintOrder: 'stroke' }
  if (shape === 'square') return <rect x={x - h} y={y - h} width={size} height={size} rx="1.5" {...common} />
  if (shape === 'diamond') {
    const d = h * 1.3
    return <path d={`M${x} ${y - d}L${x + d} ${y}L${x} ${y + d}L${x - d} ${y}Z`} {...common} />
  }
  return <circle cx={x} cy={y} r={h} {...common} />
}

/**
 * Contest rating over time for several platforms on one shared axis.
 * `series`: [{ id, name, color, shape, points: [{ t (unix s), rating, name }] }]
 */
export function RatingChart({ series, title }) {
  const [ref, inView] = useInView({ threshold: 0.35 })
  const still = usePrefersReducedMotion()
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null)

  const live = series.filter((s) => s.points?.length)
  if (!live.length) return null

  const all = live.flatMap((s) => s.points)
  const t0 = Math.min(...all.map((p) => p.t))
  const t1 = Math.max(...all.map((p) => p.t))
  const yMax = Math.ceil((Math.max(...all.map((p) => p.rating)) + 150) / 400) * 400
  const x = (t) => PAD.l + ((t - t0) / Math.max(1, t1 - t0)) * (W - PAD.l - PAD.r)
  const y = (r) => H - PAD.b - (r / yMax) * (H - PAD.t - PAD.b)

  const plotted = live.map((s) => {
    const pts = s.points.map((p) => [x(p.t), y(p.rating)])
    return { ...s, pts, d: pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ') }
  })

  // end labels sit in the right margin, nudged apart so they never collide
  const labels = plotted
    .map((s) => ({ id: s.id, want: s.pts.at(-1)[1], value: s.points.at(-1).rating, s }))
    .sort((a, b) => a.want - b.want)
  labels.forEach((l, i) => {
    l.y = Math.max(l.want, i ? labels[i - 1].y + LABEL_GAP : PAD.t)
  })
  const overflow = labels.length ? labels.at(-1).y - (H - PAD.b) : 0
  if (overflow > 0) labels.forEach((l) => (l.y -= overflow))

  const gridYs = []
  for (let r = 400; r <= yMax; r += 400) gridYs.push(r)
  const years = []
  for (let yr = new Date(t0 * 1000).getUTCFullYear() + 1; yr <= new Date(t1 * 1000).getUTCFullYear(); yr++) years.push(yr)

  const summary = live
    .map((s) => {
      const a = s.points[0]
      const b = s.points.at(-1)
      return `${s.name}: ${s.points.length} rated contests, ${a.rating} in ${fmtMonth(a.t)} to ${b.rating} in ${fmtMonth(b.t)}.`
    })
    .join(' ')

  function onMove(e) {
    const box = svgRef.current.getBoundingClientRect()
    const mx = ((e.clientX - box.left) / box.width) * W
    const my = ((e.clientY - box.top) / box.height) * H
    let best = null
    plotted.forEach((s, si) =>
      s.pts.forEach(([px, py], pi) => {
        const dist = Math.hypot(px - mx, py - my)
        if (dist < HIT && (!best || dist < best.dist)) best = { si, pi, dist }
      }),
    )
    setHover(best)
  }

  const hs = hover && plotted[hover.si]
  const hp = hs && hs.points[hover.pi]
  const [hx, hy] = hs ? hs.pts[hover.pi] : [0, 0]

  return (
    <figure ref={ref} className="m-0">
      <figcaption>
        <span className="block font-serif text-base italic text-dim">{title}</span>
        <span className="sr-only">{summary}</span>
      </figcaption>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-sans text-sm text-paper" aria-hidden="true">
        {live.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="-7 -7 14 14" focusable="false">
              <Marker shape={s.shape} color={s.color} size={9} />
            </svg>
            {s.name}
          </li>
        ))}
      </ul>

      <div className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-pan-y"
          aria-hidden="true"
          focusable="false"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {gridYs.map((r) => (
            <g key={r}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(r)} y2={y(r)} stroke="var(--color-ink-2)" strokeWidth="1" />
              <text x={PAD.l - 10} y={y(r) + 4} textAnchor="end" fontFamily="Inter, sans-serif" fontSize="12" fill="var(--color-dim)">
                {r}
              </text>
            </g>
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--color-dim)" strokeWidth="1" />
          {years.map((yr) => {
            const px = x(Date.UTC(yr, 0, 1) / 1000)
            return (
              <g key={yr}>
                <line x1={px} x2={px} y1={H - PAD.b} y2={H - PAD.b + 6} stroke="var(--color-dim)" strokeWidth="1" />
                <text x={px} y={H - 10} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="var(--color-dim)">
                  {yr}
                </text>
              </g>
            )
          })}

          {hs ? <line x1={hx} x2={hx} y1={PAD.t} y2={H - PAD.b} stroke="var(--color-dim)" strokeWidth="1" strokeDasharray="3 3" /> : null}

          {plotted.map((s, i) => (
            <path
              key={s.id}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={inView || still ? 0 : 1}
              opacity={hs && hs.id !== s.id ? 0.35 : 1}
              style={still ? undefined : { transition: `stroke-dashoffset 1600ms cubic-bezier(0.16,0.84,0.24,1) ${i * 220}ms, opacity 150ms` }}
            />
          ))}

          {/* end of each line, with a leader to its value in the margin */}
          {labels.map(({ id, y: ly, value, s }) => {
            const [ex, ey] = s.pts.at(-1)
            return (
              <g key={id} opacity={hs && hs.id !== id ? 0.35 : 1}>
                {ex < W - PAD.r - 2 || Math.abs(ey - ly) > 1 ? (
                  <path d={`M${ex} ${ey}L${W - PAD.r + 4} ${ly}`} stroke={s.color} strokeWidth="1" strokeDasharray="2 3" opacity="0.7" fill="none" />
                ) : null}
                <Marker shape={s.shape} x={ex} y={ey} color={s.color} size={9} />
                <text x={W - PAD.r + 10} y={ly + 5} fontFamily="Anton, Impact, sans-serif" fontSize="18" fill="var(--color-paper)">
                  {value}
                </text>
              </g>
            )
          })}

          {hs ? <Marker shape={hs.shape} x={hx} y={hy} color={hs.color} size={12} ring="var(--color-paper)" /> : null}
        </svg>

        {hp ? (
          <div
            className="pointer-events-none absolute z-10 w-max max-w-[220px] rounded-lg border border-paper/15 bg-ink/95 px-3 py-2 font-sans text-xs text-paper shadow-lg"
            style={{
              left: `${(hx / W) * 100}%`,
              top: `${(hy / H) * 100}%`,
              transform: `translate(${hx > W / 2 ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
            }}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <svg width="10" height="10" viewBox="-5 -5 10 10" aria-hidden="true">
                <Marker shape={hs.shape} color={hs.color} size={7} />
              </svg>
              {hs.name} · {hp.rating}
            </span>
            <span className="mt-0.5 block text-dim">{hp.name}</span>
            <span className="block text-dim">{fmtDate(hp.t)}</span>
          </div>
        ) : null}
      </div>
    </figure>
  )
}
