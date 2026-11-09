// Renders the Cast & Crew night scene to public/art/cast-night.webp.
// Uses art/cast-night-photo.{jpg,jpeg,png,webp} if present (a photograph made from the same brief),
// otherwise the original illustration art/cast-night.svg.
// Usage: npm run art   (or: node scripts/make-cast-art.js [--preview out.png])
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const W = 1200
const H = 1500
const SCALE = 2 // 2400×3000, the brief's size
const QUALITY = 0.74
const BUDGET = 450 * 1024

const photo = ['jpg', 'jpeg', 'png', 'webp']
  .map((ext) => path.join(root, `art/cast-night-photo.${ext}`))
  .find((p) => existsSync(p))

let body
if (photo) {
  const type = { jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' }[path.extname(photo).slice(1)]
  const b64 = readFileSync(photo).toString('base64')
  // cover-crop to 4:5
  body = `<img src="data:image/${type};base64,${b64}" style="width:${W}px;height:${H}px;object-fit:cover;display:block">`
} else {
  body = readFileSync(path.join(root, 'art/cast-night.svg'), 'utf8').replace(/^<\?xml[^>]*>\s*/, '')
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE })
await page.setContent(
  `<!doctype html><html><head><style>html,body{margin:0;background:#121110}svg{display:block;width:${W}px;height:${H}px}</style></head><body>${body}</body></html>`,
  { waitUntil: 'load' },
)
const png = await page.screenshot({ type: 'png' })
const webp = await page.evaluate(
  async ({ b64, q }) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    c.getContext('2d').drawImage(img, 0, 0)
    return c.toDataURL('image/webp', q).split(',')[1]
  },
  { b64: png.toString('base64'), q: QUALITY },
)
const preview = process.argv.indexOf('--preview')
if (preview > -1) writeFileSync(process.argv[preview + 1] ?? 'cast-night-preview.png', png)
await browser.close()

mkdirSync(path.join(root, 'public/art'), { recursive: true })
const out = path.join(root, 'public/art/cast-night.webp')
writeFileSync(out, Buffer.from(webp, 'base64'))
const kb = (statSync(out).size / 1024).toFixed(0)
console.log(`wrote public/art/cast-night.webp (${kb} KB, ${W * SCALE}×${H * SCALE}) from ${photo ? path.basename(photo) : 'cast-night.svg'}`)
if (statSync(out).size > BUDGET) console.warn(`warning: over the ${BUDGET / 1024} KB budget`)
