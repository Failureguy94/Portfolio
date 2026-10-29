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
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import cp from '../data/cp.json'
import { SectionHeader } from '../components/SectionHeader'
import { ExternalLink } from '../components/ExternalLink'
import { useCodeforces } from '../hooks/useCodeforces'
import { useGitHubProjects } from '../hooks/useGitHubProjects'
import { useCodeChef } from '../hooks/useCodeChef'
import { useLeetCode } from '../hooks/useLeetCode'
import { FadeUp } from '../components/MotionReveal'
import { CountUp } from '../components/CountUp'

const tabs = [
  { id: 'cf', label: 'Codeforces' },
  { id: 'cc', label: 'CodeChef' },
  { id: 'lc', label: 'LeetCode' },
  { id: 'gh', label: 'GitHub' },
]

export function Telemetry() {
  const [tab, setTab] = useState('cf')
  const shouldReduce = useReducedMotion()
  const cf = useCodeforces()
  const cc = useCodeChef()
  const lc = useLeetCode()
  const gh = useGitHubProjects()

  const currentStatus =
    tab === 'cf' ? cf.status : tab === 'cc' ? cc.status : tab === 'lc' ? lc.status : gh.status

  return (
    <section id="telemetry" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <SectionHeader
            kicker="Sector 1 · Live delta"
            title="Telemetry"
            subtitle="Competitive programming dashboard. Numbers you can verify on the official profiles."
          />
        </FadeUp>

        <FadeUp delay={0.05}>
          <div role="tablist" aria-label="Platforms" className="mb-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase cursor-pointer transition-colors ${
                  tab === t.id ? 'text-white' : 'border border-white/15 text-silver hover:border-white/40'
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="telemetry-tab-indicator"
                    className="absolute inset-0 bg-racing"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[340px] border border-white/10 bg-surface/70 p-4 sm:p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {tab === 'cf' ? <CodeforcesPanel cf={cf} shouldReduce={shouldReduce} /> : null}
                {tab === 'cc' ? <CodeChefPanel cc={cc} shouldReduce={shouldReduce} /> : null}
                {tab === 'lc' ? <LeetCodePanel lc={lc} shouldReduce={shouldReduce} /> : null}
                {tab === 'gh' ? <GitHubPanel gh={gh} shouldReduce={shouldReduce} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px] tracking-widest text-silver uppercase">
          {currentStatus === 'ok' && (
            <span className="inline-flex items-center gap-1 text-sector-green mr-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sector-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sector-green" />
              </span>
              <span className="font-bold text-[9px] tracking-widest text-sector-green">LIVE</span>
            </span>
          )}
          <span>Last updated {cp.lastUpdated}</span>
          {tab === 'cf' && cf.status === 'ok' ? ` · Codeforces live ${cf.authenticated ? '(authenticated)' : ''} ${cf.lastSynced ? `· ${cf.lastSynced}` : ''}` : ''}
          {tab === 'cf' && cf.status === 'loading' ? ' · fetching Codeforces…' : ''}
          {tab === 'cf' && cf.status === 'fallback' ? ' · Codeforces static fallback' : ''}

          {tab === 'cc' && cc.status === 'ok' ? ` · CodeChef live ${cc.authenticated ? '(authenticated)' : ''} ${cc.lastSynced ? `· ${cc.lastSynced}` : ''}` : ''}
          {tab === 'cc' && cc.status === 'loading' ? ' · fetching CodeChef…' : ''}
          {tab === 'cc' && cc.status === 'fallback' ? ' · CodeChef static fallback' : ''}

          {tab === 'lc' && lc.status === 'ok' ? ` · LeetCode live ${lc.authenticated ? '(authenticated)' : ''} ${lc.lastSynced ? `· ${lc.lastSynced}` : ''}` : ''}
          {tab === 'lc' && lc.status === 'loading' ? ' · fetching LeetCode…' : ''}
          {tab === 'lc' && lc.status === 'fallback' ? ' · LeetCode static fallback' : ''}

          {tab === 'gh' && gh.status === 'ok' ? ` · GitHub live ${gh.authenticated ? '(authenticated)' : ''} ${gh.lastSynced ? `· ${gh.lastSynced}` : ''}` : ''}
          {tab === 'gh' && gh.status === 'loading' ? ' · fetching GitHub…' : ''}
          {tab === 'gh' && gh.status === 'fallback' ? ' · GitHub static fallback' : ''}
        </p>
      </div>
    </section>
  )
}

function FastestLapDot({ cx, cy }) {
  if (!cx || !cy) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#FFCC00" opacity={0.3} className="animate-ping" />
      <circle cx={cx} cy={cy} r={6} fill="#FFCC00" stroke="#0B1230" strokeWidth={2} />
    </g>
  )
}

function CodeforcesPanel({ cf, shouldReduce }) {
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

  if (cf.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-14 w-56 rounded skeleton-shimmer" />
        <div className="h-64 w-full rounded skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-silver uppercase">Current / peak</p>
          <p className="font-display text-3xl italic">
            <CountUp value={cf.info.rating} />{' '}
            <span className="text-lg text-silver">
              / <CountUp value={cf.info.maxRating} />
            </span>
          </p>
          <p className="font-mono text-xs text-racing capitalize">
            {cf.info.rank} · max {cf.info.maxRank}
          </p>
        </div>
        <ExternalLink
          href={cp.codeforces.profileUrl}
          className="font-mono text-[11px] tracking-widest text-silver uppercase underline"
        >
          View profile
        </ExternalLink>
      </div>
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
              isAnimationActive={!shouldReduce}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            {peak && peakIndex >= 0 ? (
              <ReferenceDot
                x={data[peakIndex].date}
                y={peak.newRating}
                shape={<FastestLapDot />}
                label={{ value: 'Fastest Lap', fill: '#FFCC00', fontSize: 10, position: 'top' }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
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

function CodeChefPanel({ cc, shouldReduce }) {
  const data = cc?.data || cp.codechef
  const { stars, rating, maxRating, handle, contests, totalSolved } = data
  const pct = Math.min(100, (stars / 7) * 100)

  if (cc?.status === 'loading') {
    return (
      <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">
        <div className="mx-auto h-40 w-40 rounded-full skeleton-shimmer" />
        <div className="space-y-3">
          <div className="h-6 w-36 rounded skeleton-shimmer" />
          <div className="h-10 w-24 rounded skeleton-shimmer" />
          <div className="h-4 w-72 rounded skeleton-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">
      <StarGauge stars={stars} shouldReduce={shouldReduce} />
      <div>
        <p className="font-mono text-[10px] tracking-widest text-silver uppercase">
          {handle} · {stars}-star
        </p>
        <p className="font-display text-3xl italic">
          <CountUp value={rating} />
        </p>
        <p className="font-mono text-xs text-silver">
          Peak <CountUp value={maxRating} /> · <CountUp value={contests ?? 37} /> contests
          {totalSolved ? (
            <>
              {' · '}
              <CountUp value={totalSolved} /> solved
            </>
          ) : (
            ''
          )}
          {' · '}gauge is star class / 7
        </p>
        <div className="mt-4 h-2 w-full max-w-sm overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-racing"
            initial={shouldReduce ? { width: `${pct}%` } : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
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

function StarGauge({ stars, shouldReduce }) {
  const r = 70
  const c = 2 * Math.PI * r
  const filled = (stars / 7) * c

  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-40 w-40" aria-label={`${stars} star CodeChef gauge`}>
      <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(199,203,214,0.15)" strokeWidth="12" />
      <motion.circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="#DC0A2D"
        strokeWidth="12"
        strokeDasharray={c}
        initial={shouldReduce ? { strokeDashoffset: c - filled } : { strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - filled }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
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

function LeetCodePanel({ lc, shouldReduce }) {
  const data = lc?.data || cp.leetcode
  const { solved, target, easy, medium, hard, handle, note } = data
  const pct = Math.min(100, Math.round((solved / target) * 100))
  const totalSplit = (easy ?? 0) + (medium ?? 0) + (hard ?? 0)
  const hasSplit = easy != null && medium != null && hard != null && totalSplit > 0

  if (lc?.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 rounded skeleton-shimmer" />
        <div className="h-6 w-full rounded skeleton-shimmer" />
        <div className="h-8 w-full rounded skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-silver uppercase">{handle}</p>
          <p className="font-display text-3xl italic">
            <CountUp value={solved} />+ solved
          </p>
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
        <motion.div
          className="h-full bg-racing"
          initial={shouldReduce ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-1 font-mono text-xs text-silver">
        <CountUp value={pct} />%
      </p>
      {hasSplit ? (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-silver uppercase">
            Sectors · easy / medium / hard
          </p>
          <div className="flex h-4 w-full overflow-hidden bg-white/5">
            <motion.div
              className="bg-sector-purple h-full"
              initial={shouldReduce ? { width: `${(easy / totalSplit) * 100}%` } : { width: 0 }}
              animate={{ width: `${(easy / totalSplit) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              title={`Easy ${easy}`}
            />
            <motion.div
              className="bg-sector-green h-full"
              initial={shouldReduce ? { width: `${(medium / totalSplit) * 100}%` } : { width: 0 }}
              animate={{ width: `${(medium / totalSplit) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
              title={`Medium ${medium}`}
            />
            <motion.div
              className="bg-sector-yellow h-full"
              initial={shouldReduce ? { width: `${(hard / totalSplit) * 100}%` } : { width: 0 }}
              animate={{ width: `${(hard / totalSplit) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
              title={`Hard ${hard}`}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-silver">
            <CountUp value={easy} /> easy · <CountUp value={medium} /> medium · <CountUp value={hard} /> hard
          </p>
        </div>
      ) : (
        <p className="mt-6 font-mono text-xs text-sun">{note}</p>
      )}
    </div>
  )
}

function GitHubPanel({ gh }) {
  const { userStats, projects, status, authenticated, lastSynced } = gh

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-10 w-44 rounded skeleton-shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-20 rounded skeleton-shimmer" />
          <div className="h-20 rounded skeleton-shimmer" />
          <div className="h-20 rounded skeleton-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-silver uppercase">Handle · Telemetry</p>
          <p className="font-display text-3xl italic">
            Failureguy94 <span className="text-lg text-silver">/ GitHub</span>
          </p>
          <p className="font-mono text-xs text-racing">
            {status === 'ok' ? (
              <span className="inline-flex items-center gap-1.5 text-sector-green">
                <span className="h-1.5 w-1.5 rounded-full bg-sector-green" />
                Live API sync {authenticated ? '(authenticated)' : ''} {lastSynced ? `· ${lastSynced}` : ''}
              </span>
            ) : status === 'loading' ? (
              'Syncing telemetry…'
            ) : (
              'Static snapshot baseline'
            )}
          </p>
        </div>
        <ExternalLink
          href="https://github.com/Failureguy94"
          className="font-mono text-[11px] tracking-widest text-silver uppercase underline"
        >
          View profile
        </ExternalLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-white/10 bg-surface/50 p-4 font-mono">
          <p className="text-[10px] tracking-widest text-silver uppercase">Public Repos</p>
          <p className="mt-1 font-display text-3xl text-white italic">
            <CountUp value={userStats.publicRepos} />
          </p>
        </div>
        <div className="border border-white/10 bg-surface/50 p-4 font-mono">
          <p className="text-[10px] tracking-widest text-silver uppercase">Tracked Stars</p>
          <p className="mt-1 font-display text-3xl text-sun italic">
            <CountUp value={userStats.totalStars} /> ★
          </p>
        </div>
        <div className="border border-white/10 bg-surface/50 p-4 font-mono">
          <p className="text-[10px] tracking-widest text-silver uppercase">Followers</p>
          <p className="mt-1 font-display text-3xl text-white italic">
            <CountUp value={userStats.followers} />
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-silver uppercase">Real-time Shipped Projects</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {projects
            .filter((p) => Boolean(p.repo))
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border border-white/5 bg-surface/40 px-3 py-2 font-mono text-xs"
              >
                <span className="truncate pr-2 text-white">{p.name}</span>
                <span className="shrink-0 text-silver">
                  {p.language || 'Code'} · {p.stars}★ · {p.lastCommit || 'recent'}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}


