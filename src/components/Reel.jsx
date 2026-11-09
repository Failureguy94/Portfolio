import { useInView } from '../hooks/useInView'

/**
 * A full-bleed section ("reel") in ink or paper. It wipes in left to right the
 * first time it enters the viewport; children with class `cut` then appear on
 * hard cuts using their --cut-delay.
 *
 * The observer watches the unclipped outer element: Chromium treats a fully
 * clipped target as not intersecting, so the clip lives on the inner layer.
 */
export function Reel({ id, tone = 'ink', label, className = '', children }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: '0px 0px -12% 0px' })
  return (
    <section id={id} ref={ref} aria-labelledby={label} className="relative bg-ink">
      <div data-reveal={inView ? 'shown' : 'pending'} className={`tone-${tone} relative ${className}`}>
        {children}
      </div>
    </section>
  )
}
