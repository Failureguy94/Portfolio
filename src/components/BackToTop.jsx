import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    let ticking = false

    function checkScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > window.innerHeight * 0.9)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()

    return () => window.removeEventListener('scroll', checkScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: shouldReduce ? 'auto' : 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={shouldReduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduce ? false : { opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 bottom-20 z-30 inline-flex items-center justify-center border border-white/20 bg-surface/85 p-2.5 text-silver backdrop-blur-md transition-colors hover:border-white hover:text-white cursor-pointer md:right-8 md:bottom-8"
        >
          <ArrowUp size={16} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}
