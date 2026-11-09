// Geometry of the blood-slide artwork, shared by the render script and the hero.
// All numbers are in the SVG's own units (art/blood-slide.svg viewBox).
// At a 1900px-wide hero the art is drawn at scale 1, so 1 unit = 1 CSS px.

export const ART = {
  width: 1480,
  height: 760,
  // where the hero name sits in the art: left of its first line, top of the h1, Anton line box
  nameX: 56,
  nameTop: 368,
  refLineHeight: 227, // 0.86 × 13.9vw at a 1900px-wide hero
  // the pool's centre and mean radius
  poolCx: 446,
  poolCy: 388,
  poolR: 332,
  // the slide's centre, used to aim the discovery sweep
  slideCx: 901,
  slideCy: 235,
  // the figure and slide must stay inside the hero; the pool may bleed off the left edge
  fitMinX: 446,
  maxX: 1420,
  minY: 120,
}

export const ART_SRC = { webp: '/art/blood-slide.webp', png: '/art/blood-slide.png' }

/** Text for the frosted slide label, derived from profile.js so it never drifts. */
export function specimenLabel(profile) {
  const [first, ...rest] = profile.name.trim().split(/\s+/)
  const last = rest.length ? rest[rest.length - 1] : ''
  const [degreeShort, degreeLong = ''] = profile.degree.split(',').map((s) => s.trim())
  const initials = degreeLong
    .split(/\s+/)
    .filter((w) => w && !/^(and|of|in|the|&)$/i.test(w))
    .map((w) => w[0])
    .join('')
  const years = String(profile.batch).match(/\d{4}/g) ?? []
  const status = String(profile.availability ?? '')
    .replace(/^currently\s+/i, '')
    .replace(/[.!]+$/, '')
    .trim()
  const cut = status.lastIndexOf(' ')

  return {
    specimen: 'SPECIMEN 01',
    name: `${first[0]}. ${last}`.toUpperCase(),
    college: profile.college.toUpperCase(),
    degree: `${degreeShort} ${initials}`.trim().toUpperCase(),
    batch: years.length ? `BATCH ${years[years.length - 1]}` : '',
    status1: (cut > 0 ? status.slice(0, cut) : status).toUpperCase(),
    status2: (cut > 0 ? status.slice(cut + 1) : '').toUpperCase(),
  }
}
