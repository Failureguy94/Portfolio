import { useState } from 'react'
import { Activity, Flag, Radio, Wrench, CircleQuestionMark } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { useActiveSection } from '../hooks/useActiveSection'

const icons = {
  telemetry: Activity,
  races: Flag,
  'pit-wall': Wrench,
  radio: Radio,
}

export function Navbar({ onHelp }) {
  const active = useActiveSection(['hero', ...navLinks.map((l) => l.id)])
  const [open, setOpen] = useState(false)

  function goTop(e) {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[90] focus:bg-sun focus:px-3 focus:py-2 focus:text-surface"
      >
        Skip to content
      </a>

      <header className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-navy/90 px-4 backdrop-blur-md md:hidden">
        <a
          href="#hero"
          onClick={goTop}
          className="font-display text-xs font-extrabold tracking-[0.2em] text-white italic"
        >
          {profile.shortName.toUpperCase()}
        </a>
        <div className="flex items-center gap-3">
          <StatusLight compact onToggle={() => setOpen((v) => !v)} open={open} />
          <button type="button" onClick={onHelp} className="text-silver" aria-label="Keyboard shortcuts">
            <CircleQuestionMark size={16} />
          </button>
        </div>
      </header>

      <header className="fixed top-0 right-0 left-0 z-40 hidden border-b border-white/10 bg-navy/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <a
            href="#hero"
            onClick={goTop}
            className="font-display text-sm font-extrabold tracking-[0.2em] text-white italic"
          >
            {profile.shortName.toUpperCase()}
          </a>
          <nav aria-label="Primary" className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`font-mono text-[11px] tracking-[0.22em] uppercase ${
                  active === link.id ? 'text-racing' : 'text-silver hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <StatusLight onToggle={() => setOpen((v) => !v)} open={open} />
            <a
              href={profile.resumePath}
              download
              className="bg-sun px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.16em] text-surface uppercase"
            >
              Resume
            </a>
            <button
              type="button"
              onClick={onHelp}
              className="text-silver hover:text-white"
              aria-label="Keyboard shortcuts"
            >
              <CircleQuestionMark size={16} />
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile"
        className="fixed right-0 bottom-0 left-0 z-40 grid grid-cols-5 border-t border-white/10 bg-navy/95 backdrop-blur-md md:hidden"
      >
        {navLinks.map((link) => {
          const Icon = icons[link.id]
          const isActive = active === link.id
          return (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`flex flex-col items-center gap-1 py-2 font-mono text-[10px] uppercase ${
                isActive ? 'text-racing' : 'text-silver'
              }`}
            >
              <Icon size={16} />
              {link.short}
            </a>
          )
        })}
        <a
          href={profile.resumePath}
          download
          className="flex flex-col items-center justify-center bg-sun font-mono text-[10px] font-semibold text-surface uppercase"
        >
          Resume
        </a>
      </nav>
    </>
  )
}

function StatusLight({ open, onToggle, compact = false }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-silver uppercase"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sun" />
        </span>
        {compact ? 'Open' : profile.status.label}
      </button>
      {open ? (
        <div
          role="dialog"
          className="absolute top-10 right-0 w-64 rounded-sm border border-white/10 bg-surface p-4 shadow-xl"
        >
          <p className="font-mono text-[10px] tracking-widest text-sun uppercase">Availability</p>
          <p className="mt-2 text-sm text-silver">{profile.status.availability}</p>
          <a href={`mailto:${profile.email}`} className="mt-3 block font-mono text-xs text-white underline">
            {profile.email}
          </a>
        </div>
      ) : null}
    </div>
  )
}
