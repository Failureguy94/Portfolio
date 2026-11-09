// Screenshot every section at phone, tablet and desktop widths.
// Usage: node scripts/screenshots.js [baseUrl] [outDir]
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:5173'
const out = process.argv[3] ?? 'screenshots'
const widths = [390, 768, 1440]
const sections = ['top', 'about', 'work', 'numbers', 'cast', 'contact', 'final']

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()

for (const width of widths) {
  const height = width < 500 ? 844 : width < 1000 ? 1024 : 900
  const page = await browser.newPage({ viewport: { width, height } })
  await page.addInitScript(() => sessionStorage.setItem('portfolio_leader_seen', '1'))
  await page.goto(base, { waitUntil: 'networkidle' })

  // scroll the whole page so every reel wipes in and every counter rolls
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.floor(height / 2)) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(2500)

  for (const id of sections) {
    const el = page.locator(`#${id}`)
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await el.screenshot({ path: `${out}/${width}-${id}.png` })
  }
  // first screen exactly as a visitor sees it
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/${width}-viewport.png` })

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${width}px: horizontal overflow ${overflow}px`)
  await page.close()
}

// the countdown, mid-sequence
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(base)
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/countdown.png` })
await browser.close()
