import { useMemo, useState } from 'react'
import { projectFilters } from '../data/projects'
import { SectionHeader } from '../components/SectionHeader'
import { ExternalLink } from '../components/ExternalLink'
import { useGitHubProjects } from '../hooks/useGitHubProjects'
import { FadeUp, StaggerContainer, StaggerItem } from '../components/MotionReveal'

export function RaceCalendar() {
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)
  const { projects, status: ghStatus, authenticated, lastSynced } = useGitHubProjects()

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter, projects],
  )
  const featured = visible.filter((p) => p.featured)
  const archive = visible.filter((p) => !p.featured)

  return (
    <section id="races" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <SectionHeader
            kicker="Sector 2 · Spec sheets"
            title="Race Calendar"
            subtitle="Pole-position builds first. Filter without a reload — the rest of the season sits in the archive."
          />
        </FadeUp>

        <FadeUp delay={0.06} className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Project filters">
          {projectFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors cursor-pointer ${
                filter === f ? 'bg-racing text-white' : 'border border-white/15 text-silver hover:border-white/40'
              }`}
            >
              {f}
            </button>
          ))}
        </FadeUp>

        {featured.length ? (
          <div>
            <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-sun uppercase">Pole Position</p>
            <StaggerContainer className="grid gap-5 lg:grid-cols-3" stagger={0.08}>
              {featured.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard
                    project={p}
                    featured
                    open={openId === p.id}
                    onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : null}

        {archive.length ? (
          <div className="mt-12">
            <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-silver uppercase">Season Archive</p>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
              {archive.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard
                    project={p}
                    open={openId === p.id}
                    onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : null}

        {!visible.length ? <p className="font-mono text-sm text-silver">No races in this class.</p> : null}

        <p className="mt-8 font-mono text-[10px] tracking-widest text-silver uppercase">
          {ghStatus === 'ok' ? (
            <span className="inline-flex items-center gap-1.5 text-sector-green">
              <span className="h-1.5 w-1.5 rounded-full bg-sector-green" />
              GitHub telemetry live {authenticated ? '(authenticated)' : ''} {lastSynced ? `· ${lastSynced}` : ''}
            </span>
          ) : ghStatus === 'loading' ? (
            'Fetching GitHub telemetry…'
          ) : (
            'GitHub telemetry · static fallback'
          )}
        </p>
      </div>
    </section>
  )
}

function ProjectCard({ project, featured = false, open, onToggle }) {
  const hasLive = Boolean(project.live && !String(project.live).includes('TODO'))
  const hasRepo = Boolean(project.repo && !String(project.repo).includes('TODO'))

  const validStack = (project.stack ?? []).filter(
    (s) => s && !String(s).includes('TODO'),
  )

  const hasLang = Boolean(project.language && !String(project.language).includes('TODO'))
  const hasStars = typeof project.stars === 'number' && project.stars > 0
  const hasCommit = Boolean(project.lastCommit && !String(project.lastCommit).includes('TODO'))

  const statCells = []
  if (hasLang) statCells.push({ label: 'Lang', value: project.language })
  if (hasStars) statCells.push({ label: 'Stars', value: project.stars })
  if (hasCommit) statCells.push({ label: 'Commit', value: project.lastCommit })

  return (
    <article className={`border border-white/10 bg-surface/80 flex flex-col justify-between ${featured ? 'p-5' : 'p-4'}`}>
      <div>
        <button type="button" onClick={onToggle} className="w-full text-left cursor-pointer">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`font-display font-extrabold italic ${featured ? 'text-2xl' : 'text-xl'}`}>
              {project.name}
            </h3>
            {hasLive ? (
              <span className="shrink-0 border border-sun/70 px-2 py-0.5 font-mono text-[10px] tracking-widest text-sun uppercase">
                Live Demo
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-silver">{project.pitch}</p>
        </button>

        {validStack.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {validStack.map((s) => (
              <li key={s} className="border border-white/10 px-2 py-0.5 font-mono text-[10px] text-silver">
                {s}
              </li>
            ))}
          </ul>
        ) : null}

        {statCells.length > 0 ? (
          <dl className="mt-4 grid grid-flow-col auto-cols-fr divide-x divide-white/10 border border-white/10 font-mono text-[10px] tracking-widest uppercase">
            {statCells.map((cell) => (
              <div key={cell.label} className="p-2">
                <dt className="text-silver">{cell.label}</dt>
                <dd className="truncate text-white">{cell.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {hasRepo || hasLive ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {hasRepo ? (
              <ExternalLink
                href={project.repo}
                className="border border-racing px-3 py-1.5 font-mono text-[11px] tracking-widest text-racing uppercase hover:bg-racing hover:text-white transition-colors"
              >
                Repo
              </ExternalLink>
            ) : null}
            {hasLive ? (
              <ExternalLink
                href={project.live}
                className="font-mono text-[11px] tracking-widest text-silver uppercase underline hover:text-white transition-colors"
              >
                Open live
              </ExternalLink>
            ) : null}
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-silver">
          {project.problem ? (
            <p>
              <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Problem · </span>
              {project.problem}
            </p>
          ) : null}
          {project.role ? (
            <p>
              <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Role · </span>
              {project.role}
            </p>
          ) : null}
          {project.outcome ? (
            <p>
              <span className="font-mono text-[10px] tracking-widest text-racing uppercase">Outcome · </span>
              {project.outcome}
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 text-left font-mono text-[10px] text-silver hover:text-white transition-colors cursor-pointer"
        >
          Tap card for race notes
        </button>
      )}
    </article>
  )
}
