import { useRef } from 'react'
import { CastReveal } from '../components/CastReveal'
import { Reel } from '../components/Reel'
import { Reveal } from '../components/Reveal'
import { SplitText } from '../components/SplitText'
import { copy } from '../data/copy'
import { skillGroups } from '../data/skills'
import { blobPath } from '../lib/blob'

const moon = blobPath([96, 90, 98, 92, 95, 88, 97, 93], 100, 100)
const pebble = blobPath([70, 82, 66, 78, 72, 64, 80, 74], 100, 100, 0.4)

export default function CastCrew() {
  const t = copy.cast
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  return (
    <Reel ref={sectionRef} id="cast" tone="paper" label="cast-title" className="touch-pan-y overflow-hidden px-4 py-16 md:px-8 md:py-24">
      {/* cut-paper shapes behind frosted cards */}
      <svg viewBox="0 0 200 200" className="drift pointer-events-none absolute right-[-10vw] top-[22%] h-[44vw] max-h-[560px] w-[44vw] max-w-[560px]" aria-hidden="true" focusable="false">
        <path filter="url(#rough)" fill="var(--color-mustard)" d={moon} />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="drift pointer-events-none absolute bottom-[-6%] left-[-8vw] h-[30vw] max-h-[380px] w-[30vw] max-w-[380px]"
        style={{ animationDelay: '-9s' }}
        aria-hidden="true"
        focusable="false"
      >
        <path filter="url(#rough)" fill="var(--color-bass)" d={pebble} />
      </svg>

      {/* hidden night scene beside the cards, revealed by the pointer */}
      <CastReveal hostRef={sectionRef} headerRef={headerRef} gridRef={gridRef} />

      <div className="relative mx-auto max-w-[1280px]">
        <header ref={headerRef} className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <SplitText id="cast-title" text={t.heading} className="font-title text-[clamp(3.25rem,8vw,7rem)]" />
          <Reveal as="p" delay={250} className="max-w-[28ch] font-serif text-lg italic md:pb-2 md:text-xl">
            {t.intro}
          </Reveal>
        </header>

        <div ref={gridRef} className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {skillGroups.map((g, gi) => (
            <Reveal
              as="section"
              key={g.name}
              delay={gi * 110}
              aria-label={g.name}
              className={`glass-paper rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1 ${
                // a lone card on the last row sits at the right, under the card above it
                gi === skillGroups.length - 1 && skillGroups.length % 3 === 1 ? 'lg:col-start-3' : ''
              }`}
            >
              <h3 className="font-serif text-lg italic text-dim-ink">{g.name}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {g.items.map((s) => (
                  <li key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-title text-[1.6rem] leading-tight md:text-[1.85rem]">{s.name}</span>
                    <span className="font-sans text-[0.8rem] text-dim-ink">{s.usedIn.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Reel>
  )
}
