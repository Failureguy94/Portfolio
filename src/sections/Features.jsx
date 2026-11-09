import { ExtLink } from '../components/ExtLink'
import { Reel } from '../components/Reel'
import { posters } from '../components/posters'
import { copy } from '../data/copy'
import { projects } from '../data/projects'
import { useInView } from '../hooks/useInView'

function Spread({ project, index }) {
  const [ref, inView] = useInView({ threshold: 0.2 })
  const Poster = posters[project.poster]
  const flip = index % 2 === 1
  const t = copy.work

  return (
    <article
      ref={ref}
      aria-labelledby={`${project.id}-title`}
      className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-x-10 lg:gap-x-16"
    >
      <div
        className={`-mx-4 md:mx-0 md:col-span-5 ${
          flip ? 'md:order-2 md:col-start-8 md:rotate-[0.8deg]' : 'md:-rotate-[0.8deg]'
        }`}
      >
        <div className="aspect-[4/3] overflow-hidden md:aspect-[4/5]">
          <Poster id={`poster-${project.id}`} alt={project.posterAlt} className="h-full" />
        </div>
      </div>

      <div
        className={`flex flex-col md:col-span-6 ${
          flip ? 'md:order-1 md:col-start-1 md:justify-end md:pb-6' : 'md:col-start-7 md:justify-center'
        }`}
      >
        <h3
          id={`${project.id}-title`}
          className="font-title cut text-[clamp(2.75rem,6.2vw,6rem)] leading-[0.95]"
          data-shown={inView}
        >
          {project.title}
        </h3>
        <p className="cut mt-4 font-serif text-[1.35rem] italic leading-snug md:text-[1.5rem]" data-shown={inView} style={{ '--cut-delay': '450ms' }}>
          {project.tagline}
        </p>

        <div className="mt-6 max-w-[56ch] space-y-3">
          {project.synopsis.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>

        <div className="mt-8 max-w-[30rem]">
          <p className="font-serif text-sm italic text-dim-ink">{t.castLabel}</p>
          <dl className="mt-2 font-sans text-[0.95rem]">
            {project.cast.map(([role, who]) => (
              <div key={role} className="flex items-baseline gap-3 py-[0.2rem]">
                <dt className="shrink-0 text-dim-ink">{role}</dt>
                <span className="mb-[0.3em] flex-1 border-b border-dotted border-dim-ink" aria-hidden="true" />
                <dd className="text-right font-semibold">{who}</dd>
              </div>
            ))}
          </dl>
        </div>

        {project.repo || project.live ? (
          <p className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-sans font-semibold">
            {project.repo ? (
              <ExtLink href={project.repo}>
                {t.repo}
                <span className="sr-only">: {project.title} (opens in a new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </ExtLink>
            ) : null}
            {project.live ? (
              <ExtLink href={project.live}>
                {t.live}
                <span className="sr-only">: {project.title} (opens in a new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </ExtLink>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default function Features() {
  const t = copy.work
  return (
    <Reel id="work" tone="paper" label="work-title" className="overflow-hidden pb-28 pt-24 md:pb-40 md:pt-32">
      <header className="mb-16 px-4 md:mb-28 md:px-8">
        <h2 id="work-title" className="font-title -ml-[0.04em] whitespace-nowrap text-[18vw] md:text-[19vw]">
          {t.heading}
        </h2>
        <p className="mt-4 font-serif text-xl italic md:ml-[40vw] md:text-2xl">{t.intro}</p>
      </header>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-28 px-4 md:gap-44 md:px-8">
        {projects.map((p, i) => (
          <Spread key={p.id} project={p} index={i} />
        ))}
      </div>
    </Reel>
  )
}
