// Renders the 1200x630 Open Graph title card to public/og.png.
// Usage: node scripts/make-og.js   (needs network for Google Fonts)
import { chromium } from 'playwright'
import { heroCaption, profile } from '../src/data/profile.js'

const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500&family=Source+Serif+4:ital,opsz@1,8..60&display=block" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#121110;display:flex;flex-direction:column;overflow:hidden}
  .bar{height:56px;background:#121110}
  .frame{flex:1;position:relative;background:#F0E6D0;overflow:hidden}
  .disc{position:absolute;left:90px;top:-60px;width:400px;height:400px}
  .name{position:absolute;left:44px;bottom:56px;font:400 162px/0.86 Anton,Impact,sans-serif;text-transform:uppercase;color:#121110;white-space:nowrap}
  .kicker{position:absolute;right:56px;top:46px;font:italic 30px 'Source Serif 4',Georgia,serif;color:#121110}
  .tape{position:absolute;right:56px;top:28px;width:200px;height:10px;background:#E3A82B;transform:rotate(-5deg)}
  .caption{height:104px;display:flex;align-items:center;justify-content:center;padding:0 80px;font:500 25px/1.3 Inter,sans-serif;color:#F0E6D0;text-align:center}
</style></head><body>
  <div class="bar"></div>
  <div class="frame">
    <svg class="disc" viewBox="0 0 200 200"><path fill="#D8431E" d="M104 8c27 1 49 13 65 33 15 19 25 41 22 66-3 23-12 41-29 58-17 16-38 27-62 26-26-1-47-10-64-29C20 143 9 121 10 96c1-25 11-46 29-63C56 17 79 7 104 8z"/></svg>
    <div class="tape"></div>
    <div class="kicker">a feature presentation</div>
    <div class="name">${profile.name}</div>
  </div>
  <div class="caption">${heroCaption}</div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og.png', type: 'png' })
await browser.close()
console.log('wrote public/og.png')
