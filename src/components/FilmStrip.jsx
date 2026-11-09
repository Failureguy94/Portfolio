/** A strip of 35mm film running sideways, carrying a line of words. Decorative. */
export function FilmStrip({ items, reverse = false, speed = 40 }) {
  const run = (
    <span className="flex shrink-0 items-center">
      {items.map((it) => (
        <span key={it} className="flex items-center">
          <span className="font-title px-6 text-[1.35rem] leading-none text-paper md:text-[1.6rem]">{it}</span>
          <span className="h-2 w-2 rounded-full bg-bass" />
        </span>
      ))}
    </span>
  )
  return (
    <div className="film-strip relative overflow-hidden py-[26px]" aria-hidden="true">
      <div className="marquee-track flex w-max" data-reverse={reverse} style={{ '--speed': `${speed}s` }}>
        {run}
        {run}
        {run}
        {run}
      </div>
    </div>
  )
}
