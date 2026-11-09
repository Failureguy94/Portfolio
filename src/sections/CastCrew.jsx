import { Reel } from '../components/Reel'
import { copy } from '../data/copy'
import { skillGroups } from '../data/skills'

export default function CastCrew() {
  const t = copy.cast
  return (
    <Reel id="cast" tone="paper" label="cast-title" className="overflow-hidden px-4 py-28 md:px-8 md:py-40">
      {/* a cut-paper half moon bleeding off the right edge */}
      <svg
        viewBox="0 0 200 400"
        className="pointer-events-none absolute -right-[2px] bottom-[12%] hidden h-[46vh] w-auto lg:block"
        aria-hidden="true"
        focusable="false"
      >
        <path filter="url(#rough)" fill="var(--color-mustard)" d="M200 6C92 10 8 96 8 200s84 190 192 194z" />
      </svg>

      <div className="relative mx-auto grid max-w-[1280px] gap-14 md:grid-cols-[auto_1fr] md:gap-20">
        <header className="md:sticky md:top-24 md:self-start">
          <h2
            id="cast-title"
            className="font-title text-[clamp(3.5rem,14vw,6rem)] md:rotate-180 md:text-[clamp(6rem,10vw,10rem)] md:[writing-mode:vertical-rl]"
          >
            {t.heading}
          </h2>
          <p className="mt-4 max-w-[24ch] font-serif text-lg italic md:hidden">{t.intro}</p>
        </header>

        <div>
          <p className="mb-16 hidden max-w-[30ch] font-serif text-xl italic md:ml-[calc(38%+2.5rem)] md:block">{t.intro}</p>
          <div className="flex flex-col gap-14 md:gap-20">
            {skillGroups.map((g) => (
              <section key={g.name} aria-label={g.name} className="grid gap-3 md:grid-cols-[38%_1fr] md:gap-10">
                <h3 className="font-serif text-lg italic text-dim-ink md:pt-2 md:text-right md:text-xl">{g.name}</h3>
                <ul className="flex flex-col gap-3">
                  {g.items.map((s) => (
                    <li key={s.name} className="flex flex-wrap items-baseline gap-x-4">
                      <span className="font-title text-[clamp(2rem,4vw,3.25rem)]">{s.name}</span>
                      <span className="font-sans text-sm text-dim-ink">{s.usedIn.join(', ')}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Reel>
  )
}
