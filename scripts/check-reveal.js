// Checks the hero blood reveal: trail screenshots, idle loop, long tasks, CLS, reduced motion, sweep.
// Usage: node scripts/check-reveal.js [baseUrl] [outDir]
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:5173'
const out = process.argv[3] ?? 'screenshots/reveal'
mkdirSync(out, { recursive: true })

const results = []
const check = (name, ok, detail = '') => results.push({ name, ok, detail })

// counts rAF calls and collects long tasks and layout shifts from the start
const instrument = () => {
  sessionStorage.setItem('portfolio_leader_seen', '1')
  window.__raf = 0
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => {
    window.__raf++
    return raf(cb)
  }
  window.__long = []
  window.__cls = 0
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: 'longtask', buffered: true })
  new PerformanceObserver((l) =>
    l.getEntries().forEach((e) => {
      if (!e.hadRecentInput) window.__cls += e.value
    }),
  ).observe({ type: 'layout-shift', buffered: true })
}
const noSweep = () => sessionStorage.setItem('portfolio_blood_sweep', '1')

const browser = await chromium.launch()

async function open(width, { sweep = false, ctxOpts = {} } = {}) {
  const height = width < 500 ? 844 : width < 1000 ? 1024 : 900
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...ctxOpts })
  const page = await ctx.newPage()
  const errors = []
  // live CP-stat proxies (/api/*) depend on third-party sites; their failures are not ours
  page.on('console', (m) => m.type() === 'error' && !/\/api\//.test(m.location().url ?? '') && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.addInitScript(instrument)
  if (!sweep) await page.addInitScript(noSweep)
  await page.goto(base, { waitUntil: 'networkidle' })
  // artwork is loaded after first paint, when the browser is idle
  await page.waitForFunction(() => document.querySelector('[data-blood-reveal]')?.width > 0, null, { timeout: 8000 })
  return { ctx, page, errors, height }
}

// a wavy pass across the hero frame, ending in the middle of the pool
async function trail(page) {
  const box = await page.locator('#hero-title').boundingBox()
  const art = await page.locator('[data-blood-reveal]').boundingBox()
  const y0 = art.y + art.height * 0.6
  const pts = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    pts.push([art.x + art.width * (0.08 + 0.85 * t), y0 + Math.sin(t * Math.PI * 3) * art.height * 0.28])
  }
  pts.push([box.x + box.width * 0.2, box.y + box.height * 0.3])
  for (const [x, y] of pts) {
    await page.mouse.move(x, y, { steps: 2 })
    await page.waitForTimeout(12)
  }
}

for (const width of [390, 768, 1440]) {
  const { ctx, page, errors } = await open(width)

  await page.evaluate(() => (window.__long = []))
  await trail(page)
  check(`${width}: loop runs while trail is visible`, (await page.getAttribute('[data-blood-reveal]', 'data-running')) === 'true')
  await page.screenshot({ path: `${out}/${width}-a-mid-trail.png` })
  const longDuringMove = await page.evaluate(() => window.__long.filter((d) => d > 50))
  check(`${width}: no long tasks over 50ms while moving`, longDuringMove.length === 0, longDuringMove.join(', '))

  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${out}/${width}-b-after-2500ms.png` })
  const state = await page.evaluate(() => {
    const c = document.querySelector('[data-blood-reveal]')
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let max = 0
    for (let i = 3; i < d.length; i += 4) max = Math.max(max, d[i])
    return { running: c.dataset.running, maxAlpha: max, hidden: c.getAttribute('aria-hidden'), pe: getComputedStyle(c).pointerEvents }
  })
  check(`${width}: fully hidden 2.5s after the pointer stops`, state.maxAlpha === 0, `max alpha ${state.maxAlpha}`)
  check(`${width}: loop stopped when idle`, state.running === 'false')
  const rafIdle = await page.evaluate(async () => {
    const before = window.__raf
    await new Promise((r) => setTimeout(r, 1000))
    return window.__raf - before
  })
  check(`${width}: no requestAnimationFrame calls while idle`, rafIdle === 0, `${rafIdle} calls in 1s`)
  check(`${width}: canvas is aria-hidden and ignores the pointer`, state.hidden === 'true' && state.pe === 'none')

  // clicks still reach the buttons over the art
  const btn = page.getByRole('link', { name: /resume/i }).first()
  const hit = await btn.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('a') === el
  })
  check(`${width}: Resume button is not covered`, hit)

  const cls = await page.evaluate(() => window.__cls)
  check(`${width}: CLS`, cls < 0.01, cls.toFixed(4))
  check(`${width}: no console errors`, errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// discovery sweep: once per session, after the intro
{
  const { ctx, page } = await open(1440, { sweep: true })
  await page.waitForFunction(() => document.querySelector('[data-blood-reveal]').dataset.running === 'true', null, { timeout: 4000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${out}/1440-sweep.png` })
  check('sweep plays on first visit', true)
  await page.waitForTimeout(3200)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const raf = await page.evaluate(() => window.__raf)
  check('sweep does not replay in the same session', (await page.getAttribute('[data-blood-reveal]', 'data-running')) === 'false', `${raf} rAF`)
  await ctx.close()
}

// reduced motion: static, faint, no trail, no sweep
{
  const { ctx, page } = await open(1440, { sweep: true, ctxOpts: { reducedMotion: 'reduce' } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(600)
  const before = await page.evaluate(() => window.__raf)
  await trail(page)
  await page.waitForTimeout(300)
  const s = await page.evaluate(() => {
    const c = document.querySelector('[data-blood-reveal]')
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let max = 0
    for (let i = 3; i < d.length; i += 4) max = Math.max(max, d[i])
    return { max, running: c.dataset.running, raf: window.__raf }
  })
  await page.screenshot({ path: `${out}/1440-reduced-motion.png` })
  check('reduced motion: artwork shown statically and faint', s.max > 0 && s.max <= 0.15 * 255, `max alpha ${s.max}`)
  check('reduced motion: no trail loop or sweep', s.running !== 'true' && s.raf - before < 5, `${s.raf - before} rAF`)
  await ctx.close()
}

await browser.close()
let failed = 0
for (const r of results) {
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`)
}
console.log(`\n${results.length - failed}/${results.length} passed, screenshots in ${out}`)
process.exit(failed ? 1 : 0)
