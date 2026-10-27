import { useState } from 'react'
import { Copy } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { profile } from '../data/profile'
import { SectionHeader } from '../components/SectionHeader'
import { ExternalLink } from '../components/ExternalLink'
import { Toast } from '../components/Toast'

export function TeamRadio() {
  const [toast, setToast] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [body, setBody] = useState('')

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setToast('Copied')
      setTimeout(() => setToast(''), 1600)
    } catch {
      setToast('Copy failed')
      setTimeout(() => setToast(''), 1600)
    }
  }

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(
    `Internship / intro from ${name || 'a recruiter'}`,
  )}&body=${encodeURIComponent(`${body}\n\n— ${name || ''} ${from ? `(${from})` : ''}`)}`

  return (
    <section id="radio" className="px-4 py-16 pb-28 sm:px-6 md:py-24 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Box this lap"
          title="Team Radio"
          subtitle="Sarthak, box this lap — ping me if you want a builder who already has contest miles and shipped repos."
        />

        <p className="mb-8 font-display text-xl italic text-silver sm:text-2xl">
          “Box, box. Internships this season. Radio check — do you copy?”
        </p>

        <div className="grid gap-10 lg:grid-cols-2">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = mailto
            }}
          >
            <p className="font-mono text-[10px] tracking-widest text-silver uppercase">
              Send Message uses mailto on your device. No backend — swap in Formspree later if you want.
            </p>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest text-silver uppercase">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-white/15 bg-surface px-3 py-2 text-white"
                required
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest text-silver uppercase">Your email</span>
              <input
                type="email"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full border border-white/15 bg-surface px-3 py-2 text-white"
                required
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest text-silver uppercase">Message</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="mt-1 w-full border border-white/15 bg-surface px-3 py-2 text-white"
                required
              />
            </label>
            <button
              type="submit"
              className="border border-silver/50 px-5 py-2.5 font-mono text-xs tracking-[0.18em] text-white uppercase hover:border-white"
            >
              Send Message
            </button>
          </form>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="font-mono text-sm text-white underline">
                {profile.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[11px] text-silver uppercase"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <ExternalLink
                href={profile.linkedin.url}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 font-mono text-xs text-silver uppercase"
              >
                <LinkedinIcon size={16} /> LinkedIn
              </ExternalLink>
              <ExternalLink
                href={profile.github.url}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 font-mono text-xs text-silver uppercase"
              >
                <GithubIcon size={16} /> GitHub
              </ExternalLink>
              <a
                href={profile.resumePath}
                download
                className="inline-flex items-center border border-silver/40 px-3 py-2 font-mono text-xs text-silver uppercase"
              >
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </section>
  )
}
