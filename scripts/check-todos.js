import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../src/data')

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.js') || f.endsWith('.json'))

let hasError = false

for (const file of files) {
  const fullPath = path.join(dataDir, file)
  const content = fs.readFileSync(fullPath, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    if (line.includes('TODO')) {
      console.error(`[check-todos] Error: Found "TODO" in src/data/${file}:${idx + 1}`)
      console.error(`  > ${line.trim()}`)
      hasError = true
    }
  })
}

if (hasError) {
  console.error('\n[check-todos] Build failed: Please remove all "TODO" placeholders from src/data/')
  process.exit(1)
} else {
  console.log('[check-todos] ✓ No TODO placeholders found in src/data/')
}
