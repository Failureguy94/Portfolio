// Renders art/blood-slide.svg to public/art/blood-slide.webp (+ .png fallback).
// Transparent, 2x for a 1900px-wide hero. Label text comes from src/data/profile.js.
// Usage: npm run art   (or: node scripts/make-blood-art.js [--preview out.png])
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { profile } from '../src/data/profile.js'
import { ART, specimenLabel } from '../src/lib/bloodArt.js'
import { MAX_OPACITY } from '../src/hooks/useTrailMask.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCALE = 2
const WEBP_QUALITY = 0.85
const WEBP_BUDGET = 250 * 1024
const PAPER = '#f0e6d0'
const INK = '#121110'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

let svg = readFileSync(path.join(root, 'art/blood-slide.svg'), 'utf8')
const label = specimenLabel(profile)
svg = svg.replace(/\{\{(\w+)\}\}/g, (m, key) => {
  if (!(key in label)) throw new Error(`unknown label token ${m}`)
  return esc(label[key])
})
const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
if (!vb || +vb[1] !== ART.width || +vb[2] !== ART.height) {
  throw new Error('art/blood-slide.svg viewBox does not match ART in src/lib/bloodArt.js')
}

// the pool bitmap is referenced relatively in the SVG; inline it for rendering
const pool = readFileSync(path.join(root, 'art/blood-pool.png')).toString('base64')
svg = svg.replace('href="blood-pool.png"', `href="data:image/png;base64,${pool}"`)

const font = readFileSync(
  path.join(root, 'node_modules/@fontsource/special-elite/files/special-elite-latin-400-normal.woff2'),
).toString('base64')

const html = `<!doctype html><html><head><style>
@font-face{font-family:'Special Elite';src:url(data:font/woff2;base64,${font}) format('woff2');font-display:block}
html,body{margin:0;background:transparent}
svg{display:block;width:${ART.width}px;height:${ART.height}px}
</style></head><body>${svg.replace(/^<\?xml[^>]*>\s*/, '')}</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: ART.width, height: ART.height },
  deviceScaleFactor: SCALE,
})
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.load("16px 'Special Elite'").then(() => document.fonts.ready))
const fontOk = await page.evaluate(() => document.fonts.check("16px 'Special Elite'"))
if (!fontOk) throw new Error('Special Elite did not load')

const png = await page.screenshot({ omitBackground: true, type: 'png' })

// Encode WebP in the browser (keeps alpha, no extra dependency) and measure pool contrast.
const result = await page.evaluate(
  async ({ b64, q, art, scale, maxOpacity, paper, ink }) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const webp = c.toDataURL('image/webp', q)

    // contrast of the black name over the pool, as revealed (pool × MAX_OPACITY over paper)
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    const P = hex(paper)
    const Lk = lum(hex(ink))
    const { data, width } = ctx.getImageData(0, 0, c.width, c.height)
    const ratios = []
    const r = art.poolR * 0.92 * scale
    const cx = art.poolCx * scale
    const cy = art.poolCy * scale
    for (let y = Math.floor(cy - r); y < cy + r; y += 2) {
      for (let x = Math.floor(cx - r); x < cx + r; x += 2) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue
        const i = (y * width + x) * 4
        const a = (data[i + 3] / 255) * maxOpacity
        if (data[i + 3] < 200) continue
        const px = [0, 1, 2].map((k) => data[i + k] * a + P[k] * (1 - a))
        ratios.push((lum(px) + 0.05) / (Lk + 0.05))
      }
    }
    ratios.sort((m, n) => m - n)
    const pct = (p) => ratios[Math.floor((ratios.length - 1) * p)]
    return { webp: webp.split(',')[1], isWebp: webp.startsWith('data:image/webp'), min: pct(0), p5: pct(0.05), median: pct(0.5) }
  },
  { b64: png.toString('base64'), q: WEBP_QUALITY, art: ART, scale: SCALE, maxOpacity: MAX_OPACITY, paper: PAPER, ink: INK },
)

const preview = process.argv.indexOf('--preview')
if (preview > -1) {
  // the art over the hero paper, for review
  await page.setContent(
    `<body style="margin:0;background:${PAPER}"><img src="data:image/png;base64,${png.toString('base64')}" style="width:${ART.width}px;display:block"></body>`,
  )
  await page.screenshot({ path: process.argv[preview + 1] ?? 'blood-art-preview.png' })
}
await browser.close()

if (!result.isWebp) throw new Error('this Chromium cannot encode WebP')
mkdirSync(path.join(root, 'public/art'), { recursive: true })
const webpPath = path.join(root, 'public/art/blood-slide.webp')
const pngPath = path.join(root, 'public/art/blood-slide.png')
writeFileSync(webpPath, Buffer.from(result.webp, 'base64'))
writeFileSync(pngPath, png)

const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`
console.log(`wrote public/art/blood-slide.webp (${kb(webpPath)}) and .png (${kb(pngPath)}), ${ART.width * SCALE}×${ART.height * SCALE}`)
console.log(
  `name-over-pool contrast at ${MAX_OPACITY} opacity: min ${result.min.toFixed(2)}, 5th pct ${result.p5.toFixed(2)}, median ${result.median.toFixed(2)} (target ≥ 3:1 for the headline)`,
)
if (statSync(webpPath).size > WEBP_BUDGET) console.warn(`warning: WebP is over the ${WEBP_BUDGET / 1024} KB budget`)
if (result.p5 < 3) console.warn('note: the black name is below 3:1 over most of the pool (lower MAX_OPACITY or lighten blood-pool.png to raise it)')
