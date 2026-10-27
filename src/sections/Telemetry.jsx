import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from 'recharts'
import cp from '../data/cp.json'
import { SectionHeader } from '../components/SectionHeader'
import { ExternalLink } from '../components/ExternalLink'
import { useCodeforces } from '../hooks/useCodeforces'

const tabs = [
  { id: 'cf', label: 'Codeforces' },
  { id: 'cc', label: 'CodeChef' },
  { id: 'lc', label: 'LeetCode' },
]

export function Telemetry() {
  const [tab, setTab] = useState('cf')
  const cf = useCodeforces()

  return (
    <section id="telemetry" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Sector 1 · Live delta"
          title="Telemetry"
          subtitle="Competitive programming dashboard. Numbers you can verify on the official profiles."
        />

        <div role="tablist" aria-label="Platforms" className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase ${
                tab === t.id ? 'bg-racing text-white' : 'border border-white/15 text-silver'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-[340px] border border-white/10 bg-surface/70 p-4 sm:p-6">
          {tab === 'cf' ? <CodeforcesPanel cf={cf} /> : null}
          {tab === 'cc' ? <CodeChefPanel /> : null}
          {tab === 'lc' ? <LeetCodePanel /> : null}
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-widest text-silver uppercase">
          Last updated {cp.lastUpdated}
          {tab === 'cf' && cf.status === 'fallback' ? ' · Codeforces live fetch failed, showing static fallback' : ''}
          {tab === 'cf' && cf.status === 'ok' ? ' · Codeforces live' : ''}
          {tab === 'cf' && cf.status === 'loading' ? ' · fetching Codeforces…' : ''}
        </p>
      </div>
    </section>
  )
}

function CodeforcesPanel({ cf }) {
  const data = useMemo(
    () =>
      (cf.history ?? []).map((c) => ({
        ...c,
        date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      })),
    [cf.history],
  )

  const peak = useMemo(() => {
    if (!data.length) return null
    return data.reduce((best, cur) => (cur.newRating >= best.newRating ? cur : best), data[0])
  }, [data])

  const peakIndex = data.findIndex((d) => d === peak)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-silver uppercase">Current / peak</p>
          <p className="font-display text-3xl italic">
            {cf.info.rating} <span className="text-lg text-silver">/ {cf.info.maxRating}</span>
          </p>
          <p className="font-mono text-xs text-racing capitalize">{cf.info.rank} · max {cf.info.maxRank}</p>
        </div>
        <ExternalLink
          href={cp.codeforces.profileUrl}
          className="font-mono text-[11px] tracking-widest text-silver uppercase underline"
        >
          View profile
        </ExternalLink>
      </div>
      {cf.status === 'loading' ? (
        <p className="font-mono text-sm text-silver">Loading lap chart…</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(199,203,214,0.08)" />
              <XAxis dataKey="date" hide />
              <YAxis
                stroke="#C7CBD6"
                tick={{ fill: '#C7CBD6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                width={40}
              />
              <Tooltip content={<LapTooltip />} />
              <Line
                type="monotone"
                dataKey="newRating"
                stroke="#DC0A2D"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {peak && peakIndex >= 0 ? (
                <ReferenceDot
                  x={data[peakIndex].date}
                  y={peak.newRating}
                  r={6}
                  fill="#FFCC00"
                  stroke="#0B1230"
                  label={{ value: 'Fastest Lap', fill: '#FFCC00', fontSize: 10, position: 'top' }}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function LapTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="border border-white/15 bg-navy px-3 py-2 font-mono text-xs text-white">
      <p className="text-sun">{p.newRating} pts</p>
      <p className="text-silver">{p.date}</p>
      <p className="max-w-[220px] text-silver">{p.contestName}</p>
    </div>
  )
}

function CodeChefPanel() {
  const { stars, rating, maxRating, handle } = cp.codechef
  const pct = Math.min(100, (stars / 7) * 100)

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">
      <StarGauge stars={stars} />
      <div>
        <p className="font-mono text-[10px] tracking-widest text-silver uppercase">{handle} · {stars}-star</p>
        <p className="font-display text-3xl italic">{rating}</p>
        <p className="font-mono text-xs text-silver">Peak {maxRating} · gauge is star class / 7</p>
        <div className="mt-4 h-2 w-full max-w-sm overflow-hidden bg-white/10">
          <div className="h-full bg-racing" style={{ width: `${pct}%` }} />
        </div>
        <ExternalLink
          href={cp.codechef.profileUrl}
          className="mt-4 inline-block font-mono text-[11px] tracking-widest text-silver uppercase underline"
        >
          View profile
        </ExternalLink>
      </div>
    </div>
  )
}

function StarGauge({ stars }) {
  const r = 70
  const c = 2 * Math.PI * r
  const filled = (stars / 7) * c

  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-40 w-40" aria-label={`${stars} star CodeChef gauge`}>
      <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(199,203,214,0.15)" strokeWidth="12" />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="#DC0A2D"
        strokeWidth="12"
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="square"
        transform="rotate(-90 90 90)"
      />
      <text x="90" y="88" textAnchor="middle" fill="#fff" fontFamily="Orbitron" fontSize="28" fontStyle="italic">
        {stars}★
      </text>
      <text x="90" y="112" textAnchor="middle" fill="#C7CBD6" fontFamily="JetBrains Mono" fontSize="10">
        / 7
      </text>
    </svg>
  )
}

function LeetCodePanel() {
  const { solved, target, easy, medium, hard, handle, note } = cp.leetcode
  const pct = Math.min(100, Math.round((solved / target) * 100))
  const totalSplit = (easy ?? 0) + (medium ?? 0) + (hard ?? 0)
  const hasSplit = easy != null && medium != null && hard != null && totalSplit > 0

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-silver uppercase">{handle}</p>
          <p className="font-display text-3xl italic">{solved}+ solved</p>
        </div>
        <ExternalLink
          href={cp.leetcode.profileUrl}
          className="font-mono text-[11px] tracking-widest text-silver uppercase underline"
        >
          View profile
        </ExternalLink>
      </div>
      <p className="mt-4 font-mono text-[10px] tracking-widest text-silver uppercase">Progress to {target}</p>
      <div className="mt-2 h-3 w-full overflow-hidden bg-white/10">
        <div className="h-full bg-racing" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 font-mono text-xs text-silver">{pct}%</p>
      {hasSplit ? (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-silver uppercase">Sectors · easy / medium / hard</p>
          <div className="flex h-4 w-full overflow-hidden">
            <div className="bg-sector-purple" style={{ width: `${(easy / totalSplit) * 100}%` }} title={`Easy ${easy}`} />
            <div className="bg-sector-green" style={{ width: `${(medium / totalSplit) * 100}%` }} title={`Medium ${medium}`} />
            <div className="bg-sector-yellow" style={{ width: `${(hard / totalSplit) * 100}%` }} title={`Hard ${hard}`} />
          </div>
          <p className="mt-2 font-mono text-xs text-silver">
            {easy} easy · {medium} medium · {hard} hard
          </p>
        </div>
      ) : (
        <p className="mt-6 font-mono text-xs text-sun">{note}</p>
      )}
    </div>
  )
}
