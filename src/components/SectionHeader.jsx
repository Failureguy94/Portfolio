export function SectionHeader({ kicker, title, subtitle }) {
  return (
    <header className="mb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-racing">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl font-extrabold italic tracking-wide text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-silver">{subtitle}</p> : null}
      <div className="mt-5 sector-bar w-full max-w-xs" />
    </header>
  )
}
