import { useRef } from 'react'
import { BloodReveal } from '../components/BloodReveal'
import { copy } from '../data/copy'
import { heroCaption, profile } from '../data/profile'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { blobPath } from '../lib/blob'

// Three cut-paper outlines with the same structure, so the disc can morph between them.
const SHAPES = [
  blobPath([92, 88, 95, 86, 93, 90, 84, 94], 100, 100, 0.2),
  blobPath([86, 95, 88, 94, 84, 96, 90, 87], 100, 100, 0.35),
  blobPath([95, 85, 92, 91, 88, 86, 96, 89], 100, 100, 0.1),
]

function Disc({ className, still }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <path filter="url(#rough)" fill="var(--color-bass)" d={SHAPES[0]}>
        {still ? null : (
          <animate
            attributeName="d"
            dur="11s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.33;0.66;1"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
            values={`${SHAPES[0]};${SHAPES[1]};${SHAPES[2]};${SHAPES[0]}`}
          />
        )}
      </path>
    </svg>
  )
}

export function ColdOpen({ ready = true }) {
  const still = usePrefersReducedMotion()
  const frameRef = useRef(null)
  const nameRef = useRef(null)
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
          <div className="parallax absolute left-[-14vw] top-[-6%] md:left-[6vw] md:top-[-12%]" style={{ '--depth': -26 }}>
            <Disc still={still} className="h-[min(70vh,112vw)] w-[min(70vh,112vw)] md:h-[min(80vh,46vw)] md:w-[min(80vh,46vw)]" />
          </div>
          {/* hidden artwork: above the disc, below the name and buttons */}
          <BloodReveal hostRef={frameRef} nameRef={nameRef} ready={ready} />
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
