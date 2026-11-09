import { useRef } from 'react'
import { BloodReveal } from '../components/BloodReveal'
import { copy } from '../data/copy'
import { heroCaption, profile } from '../data/profile'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export function ColdOpen({ ready = true }) {
  const still = usePrefersReducedMotion()
  const frameRef = useRef(null)
  const nameRef = useRef(null)
  const inkRef = useRef(null)
  const raf = useRef(0)

  function onMove(e) {
    if (still || e.pointerType !== 'mouse') return
    const el = frameRef.current
    const r = el.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * 2 - 1
    const my = ((e.clientY - r.top) / r.height) * 2 - 1
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', mx.toFixed(3))
      el.style.setProperty('--my', my.toFixed(3))
    })
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="tone-ink relative flex h-[86svh] max-h-[860px] min-h-[540px] flex-col"
    >
      {/* top letterbox: the nav sits in it */}
      <div className="h-[calc(56px+2vh)] shrink-0 bg-ink" aria-hidden="true" />

      <div ref={frameRef} onPointerMove={onMove} className="relative flex-1 touch-pan-y overflow-hidden bg-paper text-ink">
        <div className="push-in absolute inset-0">
          {/* hidden artwork: below the name and buttons */}
          <BloodReveal hostRef={frameRef} nameRef={nameRef} inkRef={inkRef} ready={ready} />
          <div className="parallax absolute right-[7vw] top-[12%]" style={{ '--depth': 34 }}>
            <span aria-hidden="true" className="float block h-[9px] w-[22vw] -rotate-6 bg-mustard md:h-3 md:w-[14vw]" />
          </div>
          <p className="parallax absolute right-[7vw] top-[15%] font-serif text-lg italic md:top-[18%] md:text-2xl" style={{ '--depth': 12 }}>
            {copy.hero.kicker}
          </p>
          <h1
            ref={nameRef}
            id="hero-title"
            className="font-title parallax absolute bottom-[26%] left-[4vw] whitespace-nowrap text-[29vw] md:bottom-[24%] md:text-[13.9vw]"
            style={{ '--depth': 10 }}
          >
            <span className="block md:inline">{profile.nameLines[0]}</span>{' '}
            <span className="block pl-[4vw] md:inline md:pl-0">{profile.nameLines[1]}</span>
            {/* the name in paper colour, shown only over the revealed blood (drawn by BloodReveal) */}
            <canvas ref={inkRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-0 w-0" />
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
      <div className="flex min-h-[11vh] shrink-0 items-center justify-center bg-ink px-4 py-4">
        <p className="max-w-[52ch] text-center font-sans text-[1.05rem] font-medium leading-snug text-paper md:text-[1.2rem]">
          {heroCaption}
        </p>
      </div>
    </section>
  )
}
