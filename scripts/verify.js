// End-to-end checks against a running server.
// Usage: node scripts/verify.js [baseUrl]
import { chromium, request } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:5173'
const results = []
const check = (name, ok, detail = '') => results.push({ name, ok, detail })

const browser = await chromium.launch()

// 1. countdown: plays on a fresh session, focus lands on Skip, Escape skips it
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(base)
  const visible = await page.getByRole('dialog').isVisible()
  const focused = await page.evaluate(() => document.activeElement?.textContent)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(100)
  const gone = (await page.getByRole('dialog').count()) === 0
  check('countdown plays on first visit', visible)
  check('countdown skip button has focus', focused === 'Skip intro', focused)
  check('Escape skips countdown', gone)
  await page.reload()
  check('countdown only once per session', (await page.getByRole('dialog').count()) === 0)
  await page.close()
}

const seen = () => sessionStorage.setItem('portfolio_leader_seen', '1')

// 2. layout and content at each width
for (const width of [360, 390, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 860 } })
  await page.addInitScript(seen)
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(600)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check(`no horizontal scroll at ${width}px`, overflow <= 0, `${overflow}px`)
  await page.close()
}

// 3. links, placeholders, skip credits
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(seen)
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)

  const text = await page.evaluate(() => document.body.innerText)
  check('no TODO or [PLACEHOLDER] visible', !/TODO|\[PLACEHOLDER\]/.test(text))

  const badRel = await page.$$eval('a[target="_blank"]', (as) =>
    as.filter((a) => !/noopener/.test(a.rel) || !/noreferrer/.test(a.rel)).map((a) => a.href),
  )
  check('every new-tab link has rel="noopener noreferrer"', badRel.length === 0, badRel.join(', '))

  const links = await page.$$eval('a[href^="http"]', (as) => [...new Set(as.map((a) => a.href))])
  const api = await request.newContext()
  for (const href of links) {
    let status = 0
    try {
      status = (await api.get(href, { timeout: 15000, maxRedirects: 5 })).status()
    } catch {
      status = -1
    }
    // LinkedIn answers bots with 999; it still resolves for people.
    const ok = (status >= 200 && status < 400) || (href.includes('linkedin.com') && status === 999)
    check(`link resolves: ${href}`, ok, String(status))
  }
  const pdf = await api.get(`${base}/resume.pdf`)
  check('resume.pdf downloads', pdf.status() === 200 && /pdf/.test(pdf.headers()['content-type'] ?? ''), pdf.headers()['content-type'])
  const og = await api.get(`${base}/og.png`)
  check('og.png served', og.status() === 200)

  await page.goto(base + '#contact')
  await page.getByRole('link', { name: 'Skip credits' }).focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
  const active = await page.evaluate(() => document.activeElement?.id)
  check('Skip credits moves focus to the final frame', active === 'final', active)

  const ogImage = await page.$eval('meta[property="og:image"]', (m) => m.content)
  check('og:image is an absolute URL', /^https:\/\//.test(ogImage), ogImage)
  await page.close()
}

// 4. reduced motion: no countdown, final states, no auto-roll
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  check('reduced motion: no countdown', (await page.getByRole('dialog').count()) === 0)
  const s = await page.evaluate(() => ({
    cut: [...document.querySelectorAll('.rise')].every((e) => getComputedStyle(e).opacity === '1'),
    roll: getComputedStyle(document.querySelector('.credit-roll') ?? document.body).animationName,
    grain: getComputedStyle(document.querySelector('.grain')).animationName,
  }))
  check('reduced motion: text shown without waiting', s.cut)
  check('reduced motion: credits do not roll', s.roll === 'none', s.roll)
  check('reduced motion: grain is static', s.grain === 'none', s.grain)
  await ctx.close()
}

await browser.close()

let failed = 0
for (const r of results) {
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  (${r.detail})` : ''}`)
}
console.log(`\n${results.length - failed}/${results.length} passed`)
process.exit(failed ? 1 : 0)
