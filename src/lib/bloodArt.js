// Geometry of the blood-slide artwork, shared by the render script and the hero.
// All numbers are in the SVG's own units (art/blood-slide.svg viewBox).
// At a 1900px-wide hero the art is drawn at scale 1, so 1 unit = 1 CSS px.

export const ART = {
  width: 1200,
  height: 720,
  // the pool's centre and mean radius
  poolCx: 300,
  poolCy: 420,
  poolR: 200,
  // the slide's centre, used to aim the discovery sweep
  slideCx: 792,
  slideCy: 258,
  // visible extent (splatter, slide shadow): used to keep the art inside the hero
  minX: 60,
  maxX: 1112,
  minY: 105,
  maxY: 690,
  // the Anton line box (0.86 × 13.9vw) of the hero name at a 1900px-wide hero
  refLineHeight: 227,
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
