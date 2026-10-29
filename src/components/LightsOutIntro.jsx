import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const STORAGE_KEY = 'race-weekend-intro-seen'
const LIGHT_MS = 220
const HOLD_MS = 250
const WIPE_MS = 450

export function LightsOutIntro({ force = false, onDone }) {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    const seen = sessionStorage.getItem(STORAGE_KEY) === '1'
    return force || !seen
  })
  const [lit, setLit] = useState(0)
  const [phase, setPhase] = useState('lights')

  const skip = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    onDone()
  }, [onDone])

  // Handle immediate skip for reduced motion or already seen
  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY) === '1'
    if (reduced || (seen && !force)) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      onDone()
    }
  }, [force, onDone, reduced])

  // Keyboard shortcut listener (Space, Enter, Escape)
  useEffect(() => {
    if (!visible || reduced) return undefined
    function onKeyDown(e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        skip()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visible, reduced, skip])

  // Lights out sequence
  useEffect(() => {
    if (!visible || reduced) return undefined
    const timers = []

    // 5 red lights fill one by one every 220ms
    for (let i = 1; i <= 5; i += 1) {
      timers.push(setTimeout(() => setLit(i), i * LIGHT_MS))
    }

    // Hold 250ms after the 5th light, then all go out
    const outAt = 5 * LIGHT_MS + HOLD_MS
    timers.push(
      setTimeout(() => {
        setLit(0)
        setPhase('wipe')
      }, outAt),
    )

    // Content reveals with left-to-right wipe
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setVisible(false)
        onDone()
      }, outAt + WIPE_MS),
    )

    return () => timers.forEach(clearTimeout)
  }, [visible, reduced, onDone])

  if (reduced) return null

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-surface"
          initial={{ clipPath: 'inset(0 0 0 0)' }}
          exit={{ clipPath: 'inset(0 0 0 100%)' }}
          transition={{ duration: WIPE_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
          role="dialog"
          aria-label="Lights out intro"
        >
          <p className="mb-8 font-mono text-xs tracking-[0.4em] text-silver uppercase">Lights out</p>
          <div className="flex gap-3 sm:gap-5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="h-10 w-10 rounded-full border-2 border-racing/40 transition-colors duration-150 sm:h-14 sm:w-14"
                style={{
                  background: i < lit ? '#DC0A2D' : '#1a1020',
                  boxShadow: i < lit ? '0 0 20px #DC0A2D, 0 0 40px rgba(220,10,45,0.4)' : 'none',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="mt-10 font-mono text-xs tracking-[0.3em] text-silver uppercase underline-offset-4 hover:text-white hover:underline cursor-pointer"
          >
            Skip
          </button>
          {phase === 'wipe' ? (
            <motion.div
              className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-gradient-to-r from-racing via-sun to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: WIPE_MS / 1000, ease: 'easeInOut' }}
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
