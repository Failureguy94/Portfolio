import { Reel } from '../components/Reel'
import { Reveal } from '../components/Reveal'
import { copy } from '../data/copy'
import { openingCredits } from '../data/profile'

export function OpeningCredits() {
  return (
    <Reel id="about" tone="ink" label="about-title" className="px-4 py-16 md:px-8 md:py-24">
      <h2 id="about-title" className="sr-only">
        {copy.about.heading}
      </h2>
      <ol className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 text-center md:grid-cols-3 lg:grid-cols-5 lg:gap-0">
        {openingCredits.map((c, i) => (
          <Reveal
            as="li"
            key={c.name}
            delay={i * 140}
            className={`flex flex-col justify-center px-4 ${i === 0 ? 'col-span-2 md:col-span-1' : ''} ${
              i > 0 ? 'lg:border-l lg:border-ink-2' : ''
            }`}
          >
            <span className="block font-serif text-[0.95rem] italic text-dim">{c.role}</span>
            <span className="font-title mt-2 block text-[1.5rem] leading-[1.02] tracking-[0.02em] md:text-[1.75rem]">
              {c.name}
            </span>
          </Reveal>
        ))}
      </ol>
    </Reel>
  )
}
