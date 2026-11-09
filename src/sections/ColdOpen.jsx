import { copy } from '../data/copy'
import { heroCaption, profile } from '../data/profile'

/** Torn cut-paper disc, drawn by hand. */
function Disc({ className }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <path
        filter="url(#rough)"
        fill="var(--color-bass)"
        d="M104 8c27 1 49 13 65 33 15 19 25 41 22 66-3 23-12 41-29 58-17 16-38 27-62 26-26-1-47-10-64-29C20 143 9 121 10 96c1-25 11-46 29-63C56 17 79 7 104 8z"
      />
    </svg>
  )
}

export function ColdOpen() {
  return (
    <section id="top" aria-labelledby="hero-title" className="tone-ink relative flex h-[100svh] min-h-[600px] flex-col">
      {/* top letterbox: the nav sits in it */}
      <div className="h-[calc(56px+3vh)] shrink-0 bg-ink" aria-hidden="true" />

      <div className="relative flex-1 overflow-hidden bg-paper text-ink">
        <div className="push-in absolute inset-0">
          <Disc className="absolute left-[-14vw] top-[-6%] h-[min(78vh,118vw)] w-[min(78vh,118vw)] md:left-[6vw] md:top-[-10%] md:h-[88%] md:w-auto" />
          <span
            aria-hidden="true"
            className="absolute right-[7vw] top-[12%] block h-[9px] w-[22vw] -rotate-6 bg-mustard md:h-3 md:w-[14vw]"
          />
          <p className="absolute right-[7vw] top-[15%] font-serif text-lg italic md:top-[18%] md:text-2xl">
            {copy.hero.kicker}
          </p>
          <h1
            id="hero-title"
            className="font-title absolute bottom-[25%] left-[4vw] whitespace-nowrap text-[29vw] md:bottom-[22%] md:text-[13.9vw]"
          >
            <span className="block md:inline">{profile.nameLines[0]}</span>{' '}
            <span className="block pl-[4vw] md:inline md:pl-0">{profile.nameLines[1]}</span>
          </h1>
        </div>

        <div className="absolute bottom-[6%] left-[4vw] flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href={profile.resumePath} className="btn-fill bg-ink text-paper">
            {copy.resume}
            <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="link font-sans text-base font-semibold">
            {copy.hero.contact}
          </a>
        </div>
      </div>

      {/* bottom letterbox carries the subtitle */}
      <div className="flex min-h-[15vh] shrink-0 items-center justify-center bg-ink px-4 py-5">
        <p className="max-w-[52ch] text-center font-sans text-[1.05rem] font-medium leading-snug text-paper md:text-[1.3rem]">
          {heroCaption}
        </p>
      </div>
    </section>
  )
}
