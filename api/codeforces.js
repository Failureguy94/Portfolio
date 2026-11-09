// Codeforces solved count: unique problems with an accepted submission.
// user.status returns every submission (hundreds of KB), so it is counted here and only the number is sent on.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const handle = (req.query || {}).handle || 'Sarthak14313'
  try {
    const r = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    })
    if (!r.ok) throw new Error(`Codeforces responded with HTTP ${r.status}`)
    const json = await r.json()
    if (json.status !== 'OK') throw new Error('Codeforces payload not OK')
    const solved = new Set()
    for (const s of json.result) {
      if (s.verdict !== 'OK') continue
      const p = s.problem || {}
      solved.add(p.contestId != null ? `${p.contestId}/${p.index}` : `${p.problemsetName ?? ''}/${p.name}`)
    }
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ handle, solved: solved.size, source: 'live' })
  } catch (err) {
    return res.status(500).json({ error: err.message, source: 'fallback' })
  }
}
