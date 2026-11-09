import { lazy, Suspense, useCallback, useState } from 'react'
import { Countdown } from './components/Countdown'
import { FilmStrip } from './components/FilmStrip'
import { Grain } from './components/Grain'
import { Nav } from './components/Nav'
import { RoughFilter } from './components/RoughFilter'
import { copy } from './data/copy'
import { projects } from './data/projects'
import { skillGroups } from './data/skills'
import { shouldPlayCountdown } from './lib/leader'
import { ColdOpen } from './sections/ColdOpen'
import { OpeningCredits } from './sections/OpeningCredits'

const Features = lazy(() => import('./sections/Features'))
const BoxOffice = lazy(() => import('./sections/BoxOffice'))
const CastCrew = lazy(() => import('./sections/CastCrew'))
const EndCredits = lazy(() => import('./sections/EndCredits'))

const projectTitles = projects.map((p) => p.title)
const skillNames = skillGroups.flatMap((g) => g.items.map((i) => i.name))

export default function App() {
  const [leader, setLeader] = useState(shouldPlayCountdown)
  const endLeader = useCallback(() => setLeader(false), [])

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] bg-mustard px-4 py-3 font-sans font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {copy.skipToContent}
      </a>
      <RoughFilter />
      <Nav />
      <main id="main">
        <ColdOpen />
        <OpeningCredits />
        <FilmStrip items={projectTitles} speed={36} />
        <Suspense fallback={<div className="min-h-[200vh] bg-paper" aria-hidden="true" />}>
          <Features />
          <BoxOffice />
          <CastCrew />
          <FilmStrip items={skillNames} speed={60} reverse />
          <EndCredits />
        </Suspense>
      </main>
      <Grain />
      {leader ? <Countdown onDone={endLeader} /> : null}
    </>
  )
}
