import { ExtLink } from '../components/ExtLink'
import { Reel } from '../components/Reel'
import { Reveal } from '../components/Reveal'
import { SplitText } from '../components/SplitText'
import { Tilt } from '../components/Tilt'
import { posters } from '../components/posters'
import { copy } from '../data/copy'
import { projects } from '../data/projects'

function Spread({ project, index }) {
  const Poster = posters[project.poster]
  const flip = index % 2 === 1
  const t = copy.work

  return (
    <article
      aria-labelledby={`${project.id}-title`}
      className="grid grid-cols-1 gap-y-7 md:grid-cols-12 md:items-center md:gap-x-10 lg:gap-x-14"
    >
      <Reveal className={`-mx-4 md:mx-0 md:col-span-5 lg:col-span-4 ${flip ? 'md:order-2 md:col-start-8 lg:col-start-9' : ''}`}>
        <Tilt rest={flip ? '0.8deg' : '-0.8deg'}>
          <div className="aspect-[4/3] overflow-hidden md:aspect-[4/5] md:shadow-[0_30px_60px_-30px_rgba(18,17,16,0.55)]">
            <Poster id={`poster-${project.id}`} alt={project.posterAlt} className="h-full" />
          </div>
        </Tilt>
      </Reveal>

      <div className={`flex flex-col md:col-span-7 lg:col-span-7 ${flip ? 'md:order-1 md:col-start-1' : 'lg:col-start-6'}`}>
        <SplitText
          as="h3"
          id={`${project.id}-title`}
          text={project.title}
          className="font-title text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.95]"
        />
        <Reveal as="p" delay={200} className="mt-3 font-serif text-[1.25rem] italic leading-snug md:text-[1.35rem]">
          {project.tagline}
        </Reveal>

        <Reveal delay={320} className="mt-5 max-w-[60ch] space-y-2.5">
          {project.synopsis.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </Reveal>

        <Reveal delay={440} className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[28rem] flex-1">
            <p className="font-serif text-sm italic text-dim-ink">{t.castLabel}</p>
            <dl className="mt-1.5 font-sans text-[0.92rem]">
              {project.cast.map(([role, who]) => (
                <div key={role} className="flex items-baseline gap-3 py-[0.15rem]">
                  <dt className="shrink-0 text-dim-ink">{role}</dt>
                  <span className="mb-[0.3em] flex-1 border-b border-dotted border-dim-ink" aria-hidden="true" />
                  <dd className="text-right font-semibold">{who}</dd>
                </div>
              ))}
            </dl>
          </div>

          {project.repo || project.live ? (
            <p className="flex flex-wrap gap-x-7 gap-y-2 font-sans font-semibold lg:pb-1">
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
        </Reveal>
      </div>
    </article>
  )
}

export default function Features() {
  const t = copy.work
  return (
    <Reel id="work" tone="paper" label="work-title" className="overflow-hidden pb-20 pt-16 md:pb-28 md:pt-20">
      <header className="mx-auto mb-12 flex max-w-[1280px] flex-col gap-3 px-4 md:mb-20 md:flex-row md:items-end md:justify-between md:px-8">
        <SplitText
          id="work-title"
          text={t.heading}
          className="font-title text-[clamp(3.25rem,10vw,8.5rem)]"
        />
        <Reveal as="p" delay={250} className="font-serif text-lg italic md:pb-3 md:text-xl">
          {t.intro}
        </Reveal>
      </header>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20 px-4 md:gap-28 md:px-8">
        {projects.map((p, i) => (
          <Spread key={p.id} project={p} index={i} />
        ))}
      </div>
    </Reel>
  )
}
