import { useMemo, useState } from 'react'
import { projectFilters, projects } from '../data/projects'
import { SectionHeader } from '../components/SectionHeader'
import { ExternalLink } from '../components/ExternalLink'

export function RaceCalendar() {
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter],
  )
  const featured = visible.filter((p) => p.featured)
  const archive = visible.filter((p) => !p.featured)

  return (
    <section id="races" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Sector 2 · Spec sheets"
          title="Race Calendar"
          subtitle="Pole-position builds first. Filter without a reload — the rest of the season sits in the archive."
        />

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Project filters">
          {projectFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase ${
                filter === f ? 'bg-racing text-white' : 'border border-white/15 text-silver'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {featured.length ? (
          <div>
            <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-sun uppercase">Pole Position</p>
            <div className="grid gap-5 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  featured
                  open={openId === p.id}
                  onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {archive.length ? (
          <div className="mt-12">
            <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-silver uppercase">Season Archive</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {archive.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  open={openId === p.id}
                  onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {!visible.length ? <p className="font-mono text-sm text-silver">No races in this class.</p> : null}
      </div>
    </section>
  )
}

function ProjectCard({ project, featured = false, open, onToggle }) {
  return (
    <article className={`border border-white/10 bg-surface/80 ${featured ? 'p-5' : 'p-4'}`}>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-display font-extrabold italic ${featured ? 'text-2xl' : 'text-xl'}`}>
            {project.name}
          </h3>
          {project.live ? (
            <span className="shrink-0 border border-sun/70 px-2 py-0.5 font-mono text-[10px] tracking-widest text-sun uppercase">
              Live Demo
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-silver">{project.pitch}</p>
      </button>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <li key={s} className="border border-white/10 px-2 py-0.5 font-mono text-[10px] text-silver">
            {s}
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-3 border border-white/10 font-mono text-[10px] tracking-widest uppercase">
        <div className="border-r border-white/10 p-2">
          <dt className="text-silver">Lang</dt>
          <dd className="text-white">{project.language}</dd>
        </div>
        <div className="border-r border-white/10 p-2">
          <dt className="text-silver">Stars</dt>
          <dd className="text-white">{project.stars}</dd>
        </div>
        <div className="p-2">
          <dt className="text-silver">Commit</dt>
          <dd className="text-white">{project.lastCommit}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <ExternalLink
          href={project.repo}
          className="border border-racing px-3 py-1.5 font-mono text-[11px] tracking-widest text-racing uppercase"
        >
          Repo
        </ExternalLink>
        {project.live ? (
          <ExternalLink
            href={project.live}
            className="font-mono text-[11px] tracking-widest text-silver uppercase underline"
          >
            Open live
          </ExternalLink>
        ) : null}
      </div>
      {open ? (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-silver">
          <p>
            <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Problem · </span>
            {project.problem}
          </p>
          <p>
            <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Role · </span>
            {project.role}
          </p>
          <p>
            <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Outcome · </span>
            {project.outcome}
          </p>
        </div>
      ) : (
        <p className="mt-3 font-mono text-[10px] text-silver">Tap card for race notes</p>
      )}
    </article>
  )
}
