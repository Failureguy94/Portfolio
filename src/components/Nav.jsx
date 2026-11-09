import { useEffect, useRef, useState } from 'react'
import { copy } from '../data/copy'
import { navLinks, profile } from '../data/profile'
import { useActiveSection } from '../hooks/useActiveSection'

const ids = navLinks.map((l) => l.id)

export function Nav() {
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const bar = useRef(null)

  // reel progress: a thin orange-red line that fills as the page scrolls
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkCls = (id) =>
    `font-sans text-[0.95rem] underline-offset-[0.35em] ${
      active === id ? 'font-semibold underline decoration-2 decoration-mustard' : 'hover:underline'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-paper/10 bg-ink/70 text-paper backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-8">
        <a href="#top" className="font-title text-[1.35rem] tracking-[0.01em]">
          {profile.name}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={linkCls(l.id)} aria-current={active === l.id ? 'true' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resumePath} className="font-sans text-[0.95rem] font-semibold text-mustard underline underline-offset-[0.35em]">
              {copy.resume}
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="font-sans text-base font-semibold underline underline-offset-[0.35em] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? copy.close : copy.menu}
        </button>
      </nav>

      <div
        ref={bar}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left scale-x-0 bg-bass"
      />

      {open ? (
        <ul id="mobile-menu" className="border-t border-ink-2 px-4 pb-6 pt-2 md:hidden">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="font-title block py-2 text-4xl"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={profile.resumePath} className="font-title block py-2 text-4xl text-mustard">
              {copy.resume}
            </a>
          </li>
        </ul>
      ) : null}
    </header>
  )
}
