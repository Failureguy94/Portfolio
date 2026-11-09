/** A full-bleed section ("reel") in ink or paper. */
export function Reel({ id, tone = 'ink', label, className = '', children }) {
  return (
    <section id={id} aria-labelledby={label} className={`tone-${tone} relative ${className}`}>
      {children}
    </section>
  )
}
