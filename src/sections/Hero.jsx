import { profile } from '../data/profile'
import { siteMetrics } from '../data/metadata'
import { ExternalLink } from '../components/ExternalLink'
import { GithubIcon } from '../components/BrandIcons'

export function Hero() {
  return (
    <section id="hero" className="relative px-4 pt-16 pb-20 sm:px-6 md:pt-28 md:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.32em] text-racing uppercase">Grid position · internships</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.9] font-extrabold tracking-wide text-white italic sm:text-6xl lg:text-7xl">
            {profile.displayName.toUpperCase()}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{profile.pitch}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#races"
              className="bg-racing px-5 py-2.5 font-mono text-xs tracking-[0.18em] text-white uppercase"
            >
              View Projects
            </a>
            <a
              href="#radio"
              className="border border-silver/40 px-5 py-2.5 font-mono text-xs tracking-[0.18em] text-silver uppercase hover:border-white hover:text-white"
            >
              Contact Me
            </a>
            <ExternalLink
              href={profile.github.url}
              aria-label="GitHub"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-silver hover:text-white"
            >
              <GithubIcon size={18} />
            </ExternalLink>
          </div>
        </div>

        <article
          aria-label="Driver card"
          className="border border-white/12 bg-surface/80 p-1 shadow-[0_0_0_1px_rgb(220,10,45,0.25)]"
        >
          <div className="flex items-center justify-between bg-racing px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-white uppercase">
            <span>Timing</span>
            <span>Sector 1</span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] text-silver">P1</p>
                <h2 className="font-display text-2xl font-extrabold italic">{profile.lastName.toUpperCase()}</h2>
                <p className="mt-1 font-mono text-xs text-silver">{profile.collegeShort}</p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-sun uppercase">
                  <span className="h-2 w-2 rounded-full bg-sun" aria-hidden="true" />
                  {profile.status.label}
                </p>
                <p className="mt-2 font-mono text-[10px] text-silver">{siteMetrics.graduationYears}</p>
                <p className="font-mono text-[10px] text-silver">CGPA {siteMetrics.cgpa}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 font-mono text-xs">
              <div>
                <dt className="text-[10px] tracking-widest text-silver uppercase">Role</dt>
                <dd className="mt-1 text-white">{profile.role}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-widest text-silver uppercase">Badge</dt>
                <dd className="mt-1 inline-block border border-racing/60 px-2 py-0.5 text-racing">
                  {profile.gdg.badge}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] tracking-widest text-silver uppercase">Constructor</dt>
                <dd className="mt-1 text-white">{profile.degree}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>
  )
}
