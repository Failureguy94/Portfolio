import { Reel } from '../components/Reel'
import { copy } from '../data/copy'
import { openingCredits } from '../data/profile'

export function OpeningCredits() {
  return (
    <Reel id="about" tone="ink" label="about-title" className="flex min-h-[92svh] items-center justify-center px-4 py-28">
      <h2 id="about-title" className="sr-only">
        {copy.about.heading}
      </h2>
      <ol className="flex flex-col items-center gap-[clamp(2.25rem,6vh,4rem)] text-center">
        {openingCredits.map((c, i) => (
          <li key={c.name} className="cut" style={{ '--cut-delay': `${250 + i * 650}ms` }}>
            <span className="block font-serif text-[0.95rem] italic text-dim md:text-base">{c.role}</span>
            <span className="font-title mt-2 block text-[1.6rem] leading-none tracking-[0.02em] md:text-[2.1rem]">
              {c.name}
            </span>
          </li>
        ))}
      </ol>
    </Reel>
  )
}
