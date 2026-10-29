import { useScrollProgress } from '../hooks/useScrollProgress'

export function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[2.5px] bg-white/5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Lap progress"
    >
      <div
        className="relative h-full bg-racing"
        style={{ width: `${progress * 100}%` }}
      >
        {progress > 0.002 ? (
          <span
            className="absolute -right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-sun shadow-[0_0_8px_#FFCC00]"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  )
}
