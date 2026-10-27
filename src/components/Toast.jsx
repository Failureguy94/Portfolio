import { AnimatePresence, motion } from 'framer-motion'

export function Toast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-sm border border-sun/40 bg-surface px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-sun shadow-lg md:bottom-8"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
