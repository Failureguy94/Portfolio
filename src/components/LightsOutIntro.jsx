import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const STORAGE_KEY = 'race-weekend-intro-seen'
const LIGHT_MS = 220
const HOLD_MS = 180
const STREAK_MS = 520

export function LightsOutIntro({ force = false, onDone }) {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [lit, setLit] = useState(0)
  const [phase, setPhase] = useState('lights')

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY) === '1'
    if (reduced || (seen && !force)) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      onDone()
      return undefined
    }
    setVisible(true)
    return undefined
  }, [force, onDone, reduced])

  useEffect(() => {
    if (!visible) return undefined
    const timers = []

    for (let i = 1; i <= 5; i += 1) {
      timers.push(setTimeout(() => setLit(i), i * LIGHT_MS))
    }

    const outAt = 5 * LIGHT_MS + HOLD_MS
    timers.push(
      setTimeout(() => {
        setLit(0)
        setPhase('streak')
      }, outAt),
    )
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, '1')
        setVisible(false)
        onDone()
      }, outAt + STREAK_MS),
    )

    return () => timers.forEach(clearTimeout)
  }, [onDone, visible])

  function skip() {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    onDone()
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-surface"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-label="Lights out intro"
        >
          <p className="mb-8 font-mono text-xs tracking-[0.4em] text-silver uppercase">Lights out</p>
          <div className="flex gap-3 sm:gap-5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="h-10 w-10 rounded-full border-2 border-racing/40 sm:h-14 sm:w-14"
                style={{
                  background: i < lit ? '#DC0A2D' : '#1a1020',
                  boxShadow: i < lit ? '0 0 18px #DC0A2D' : 'none',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="mt-10 font-mono text-xs tracking-[0.3em] text-silver uppercase underline-offset-4 hover:text-white hover:underline"
          >
            Skip
          </button>
          {phase === 'streak' ? (
            <motion.div
              className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-linear-to-r from-racing via-sun to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: STREAK_MS / 1000, ease: 'easeIn' }}
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
