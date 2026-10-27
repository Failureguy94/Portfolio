import { useScrollProgress } from '../hooks/useScrollProgress'

export function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[3px] bg-surface"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Page scroll"
    >
      <div
        className="h-full origin-left bg-linear-to-r from-racing to-sun"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
