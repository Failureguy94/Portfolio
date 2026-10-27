import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { CheckeredDivider } from './components/CheckeredDivider'
import { LightsOutIntro } from './components/LightsOutIntro'
import { Navbar } from './components/Navbar'
import { ScrollProgress } from './components/ScrollProgress'
import { ShortcutHelp } from './components/ShortcutHelp'
import { Hero } from './sections/Hero'

const Telemetry = lazy(() => import('./sections/Telemetry').then((m) => ({ default: m.Telemetry })))
const RaceCalendar = lazy(() => import('./sections/RaceCalendar').then((m) => ({ default: m.RaceCalendar })))
const PitWall = lazy(() => import('./sections/PitWall').then((m) => ({ default: m.PitWall })))
const TeamRadio = lazy(() => import('./sections/TeamRadio').then((m) => ({ default: m.TeamRadio })))

function PanelFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 font-mono text-sm text-silver" aria-hidden="true">
      Loading sector…
    </div>
  )
}

export default function App() {
  const [introDone, setIntroDone] = useState(false)
  const [replay, setReplay] = useState(0)
  const [help, setHelp] = useState(false)

  const finishIntro = useCallback(() => setIntroDone(true), [])

  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const key = e.key.toLowerCase()
      if (key === 'r') {
        setIntroDone(false)
        setReplay((n) => n + 1)
      } else if (key === 'p') {
        document.getElementById('races')?.scrollIntoView({ behavior: 'smooth' })
      } else if (key === 'c') {
        document.getElementById('radio')?.scrollIntoView({ behavior: 'smooth' })
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setHelp((v) => !v)
      } else if (e.key === 'Escape') {
        setHelp(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="carbon-bg min-h-screen pb-16 md:pb-0">
      <ScrollProgress />
      <LightsOutIntro key={replay} force={replay > 0} onDone={finishIntro} />
      <Navbar onHelp={() => setHelp(true)} />
      <main>
        <Hero />
        <CheckeredDivider />
        <Suspense fallback={<PanelFallback />}>
          <Telemetry />
          <CheckeredDivider />
          <RaceCalendar />
          <CheckeredDivider />
          <PitWall />
          <CheckeredDivider />
          <TeamRadio />
        </Suspense>
      </main>
      <ShortcutHelp open={help} onClose={() => setHelp(false)} />
      {introDone ? null : <div className="sr-only" aria-live="polite">Lights-out sequence playing</div>}
    </div>
  )
}
