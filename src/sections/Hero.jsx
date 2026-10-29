import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data/profile'
import { siteMetrics } from '../data/metadata'
import { ExternalLink } from '../components/ExternalLink'
import { GithubIcon } from '../components/BrandIcons'

export function Hero() {
  const sectionRef = useRef(null)
  const shouldReduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : 12])

  const nameWords = profile.displayName.toUpperCase().split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.035,
        delayChildren: 0.05,
      },
    },
  }

  const letterVariants = {
    hidden: {
      opacity: shouldReduce ? 1 : 0,
      y: shouldReduce ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section ref={sectionRef} id="hero" className="relative px-4 pt-16 pb-20 sm:px-6 md:pt-28 md:pb-24 overflow-hidden">
      {/* Background track-line parallax pattern */}
      <motion.div
        aria-hidden="true"
        style={{ y: yParallax }}
        className="pointer-events-none absolute inset-0 opacity-15 overflow-hidden"
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="track-lines" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="60" stroke="#DC0A2D" strokeWidth="1" strokeDasharray="6 6" />
              <line x1="30" y1="0" x2="30" y2="60" stroke="#C7CBD6" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#track-lines)" />
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.32em] text-racing uppercase">Grid position · internships</p>
          <motion.h1
            className="mt-4 flex flex-wrap font-display text-5xl leading-[0.9] font-extrabold tracking-wide text-white italic sm:text-6xl lg:text-7xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {nameWords.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{profile.pitch}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#races"
              className="bg-racing px-5 py-2.5 font-mono text-xs tracking-[0.18em] text-white uppercase hover:bg-racing/90 transition-colors"
            >
              View Projects
            </a>
            <a
              href="#radio"
              className="border border-silver/40 px-5 py-2.5 font-mono text-xs tracking-[0.18em] text-silver uppercase hover:border-white hover:text-white transition-colors"
            >
              Contact Me
            </a>
            <ExternalLink
              href={profile.github.url}
              aria-label="GitHub"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-silver hover:text-white transition-colors"
            >
              <GithubIcon size={18} />
            </ExternalLink>
          </div>
        </div>

        <article
          aria-label="Driver card"
          className="border border-white/12 bg-surface/80 p-1 shadow-[0_0_0_1px_rgb(220,10,45,0.25)] overflow-hidden"
        >
          {/* Timing screen boot: header bar wipes in */}
          <motion.div
            initial={shouldReduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
            className="flex items-center justify-between bg-racing px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-white uppercase"
          >
            <span>Timing</span>
            <span>Sector 1</span>
          </motion.div>
          <div className="p-5">
            <motion.div
              initial={shouldReduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.35, ease: 'easeOut' }}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-mono text-[10px] text-silver">P1</p>
                <h2 className="font-display text-2xl font-extrabold italic">{profile.lastName.toUpperCase()}</h2>
                <p className="mt-1 font-mono text-xs text-silver">{profile.collegeShort}</p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-sun uppercase">
                  <span className="h-2 w-2 rounded-full bg-sun status-pulse-glow" aria-hidden="true" />
                  {profile.status.label}
                </p>
                <p className="mt-2 font-mono text-[10px] text-silver">{siteMetrics.graduationYears}</p>
                <p className="font-mono text-[10px] text-silver">CGPA {siteMetrics.cgpa}</p>
              </div>
            </motion.div>
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 font-mono text-xs">
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.48, ease: 'easeOut' }}
              >
                <dt className="text-[10px] tracking-widest text-silver uppercase">Role</dt>
                <dd className="mt-1 text-white">{profile.role}</dd>
              </motion.div>
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.58, ease: 'easeOut' }}
              >
                <dt className="text-[10px] tracking-widest text-silver uppercase">Badge</dt>
                <dd className="mt-1 inline-block border border-racing/60 px-2 py-0.5 text-racing">
                  {profile.gdg.badge}
                </dd>
              </motion.div>
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.68, ease: 'easeOut' }}
                className="col-span-2"
              >
                <dt className="text-[10px] tracking-widest text-silver uppercase">Constructor</dt>
                <dd className="mt-1 text-white">{profile.degree}</dd>
              </motion.div>
            </dl>
          </div>
        </article>
      </div>
    </section>
  )
}
