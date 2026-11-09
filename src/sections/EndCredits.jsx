import { CopyEmail } from '../components/CopyEmail'
import { ExtLink } from '../components/ExtLink'
import { Reel } from '../components/Reel'
import { copy } from '../data/copy'
import { endCredits, profile } from '../data/profile'

function Credit({ c }) {
  if (c.note) {
    return <li className="pt-10 text-center font-serif text-lg italic text-dim">{c.name}</li>
  }
  return (
    <li className="grid grid-cols-[1fr_1fr] gap-6 text-left">
      <span className="text-right font-serif text-base italic text-dim">{c.role}</span>
      <span className="font-title text-[1.4rem] leading-tight tracking-[0.02em] md:text-[1.75rem]">{c.name}</span>
    </li>
  )
}

export default function EndCredits() {
  const t = copy.credits

  function skip(e) {
    e.preventDefault()
    const el = document.getElementById('final')
    el?.scrollIntoView({ behavior: 'smooth' })
    el?.focus({ preventScroll: true })
  }

  return (
    <Reel id="contact" tone="ink" label="contact-title">
      <div className="relative px-4 md:px-8">
        <div className="flex justify-end pt-8">
          <a href="#final" onClick={skip} className="link font-sans text-base font-semibold text-mustard">
            {t.skip}
          </a>
        </div>

        <div
          className="credit-window relative mx-auto h-[78svh] max-w-[760px] overflow-hidden motion-reduce:h-auto"
          tabIndex={0}
          role="region"
          aria-label={t.rollLabel}
        >
          {/* The list appears twice so the roll loops seamlessly; the copy is hidden from screen readers. */}
          <div className="credit-roll motion-reduce:transform-none">
            {[0, 1].map((k) => (
              <ul
                key={k}
                aria-hidden={k === 1 ? 'true' : undefined}
                className={`flex flex-col gap-12 py-[39svh] motion-reduce:py-16 ${k === 1 ? 'motion-reduce:hidden' : ''}`}
              >
                {endCredits.map((c) => (
                  <Credit key={c.name} c={c} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div
        id="final"
        tabIndex={-1}
        className="flex min-h-[100svh] flex-col justify-center px-4 pb-16 pt-24 outline-none md:px-8"
      >
        <h2 id="contact-title" className="font-serif text-xl italic text-dim md:text-2xl">
          {t.finalHeading}
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="font-title mt-4 block whitespace-nowrap text-[clamp(1.75rem,8.1vw,9.5rem)] normal-case leading-[0.95] hover:text-mustard"
          style={{ textTransform: 'none' }}
        >
          {profile.email}
        </a>

        <div className="mt-12 flex flex-wrap items-center gap-x-9 gap-y-5 font-sans text-lg font-semibold">
          <CopyEmail email={profile.email} labels={t} className="btn-fill bg-paper text-ink" />
          <ExtLink href={profile.github.url}>
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </ExtLink>
          <ExtLink href={profile.linkedin.url}>
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </ExtLink>
          <a href={profile.resumePath} className="link" download>
            {copy.resume}
          </a>
        </div>

        <div className="mt-[18vh] flex flex-wrap items-end justify-between gap-6 border-t border-ink-2 pt-8">
          <p className="font-title text-[clamp(3rem,7vw,6rem)]">{t.theEnd}</p>
          <p className="font-serif text-lg italic text-mustard">{profile.availability}</p>
        </div>
      </div>
    </Reel>
  )
}
