import { useEffect, useRef, useState } from 'react'
import { copy } from '../data/copy'
import { LEADER_KEY as KEY } from '../lib/leader'

const STEP_MS = 550


/** 3-2-1 film leader. Under two seconds, once per session, skippable. */
export function Countdown({ onDone }) {
  const [n, setN] = useState(3)
  const done = useRef(false)
  const finishRef = useRef(() => {})

  useEffect(() => {
    function finish() {
      if (done.current) return
      done.current = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        // ignore
      }
      onDone()
    }
    const t1 = setTimeout(() => setN(2), STEP_MS)
    const t2 = setTimeout(() => setN(1), STEP_MS * 2)
    const t3 = setTimeout(finish, STEP_MS * 3)
    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    finishRef.current = finish
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('keydown', onKey)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink text-paper"
      onClick={() => finishRef.current()}
      role="dialog"
      aria-label={copy.countdown.label}
    >
      <svg viewBox="0 0 200 200" className="absolute h-[78vmin] w-[78vmin]" aria-hidden="true">
        <line x1="-400" y1="100" x2="600" y2="100" stroke="#2a2724" strokeWidth="0.6" />
        <line x1="100" y1="-400" x2="100" y2="600" stroke="#2a2724" strokeWidth="0.6" />
        <g className="leader-sweep">
          <path d="M100 100 L100 6 A94 94 0 0 1 181 53 Z" fill="#2a2724" />
        </g>
        <circle cx="100" cy="100" r="94" fill="none" stroke="#b5ab97" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="#b5ab97" strokeWidth="0.8" />
      </svg>
      <span key={n} className="font-title relative text-[34vmin] leading-none" aria-hidden="true">
        {n}
      </span>
      <button
        type="button"
        autoFocus
        onClick={(e) => {
          e.stopPropagation()
          finishRef.current()
        }}
        className="link absolute bottom-6 right-6 font-sans text-base text-paper"
      >
        {copy.countdown.skip}
      </button>
    </div>
  )
}
