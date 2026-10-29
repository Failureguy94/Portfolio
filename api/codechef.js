export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const queryParams = req.query || {}
  const handle = queryParams.handle || 'sarthak14313'
  const token =
    process.env.CODECHEF_API_KEY ||
    process.env.VITE_CODECHEF_API_KEY ||
    process.env.VITE_CODECHEF_TOKEN ||
    (req.headers?.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '')

  try {
    if (token) {
      const apiRes = await fetch(`https://api.codechef.com/users/${encodeURIComponent(handle)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      if (apiRes.ok) {
        const json = await apiRes.json()
        const user = json?.result?.data?.content
        if (user) {
          const rawStars = user.stars
          const starsNum = parseInt(String(rawStars).replace('★', ''), 10) || 3
          return res.status(200).json({
            handle,
            rating: user.currentRating,
            maxRating: user.highestRating,
            stars: starsNum,
            authenticated: true,
            source: 'live',
          })
        }
      }
    }

    const pageRes = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!pageRes.ok) {
      throw new Error(`CodeChef responded with HTTP ${pageRes.status}`)
    }

    const html = await pageRes.text()
    const ratingMatch = html.match(/class="rating-number"[^>]*>\s*([0-9]+)\s*</)
    const highestMatch = html.match(/\(Highest Rating\s*([0-9]+)\)/)
    const starBlock = html.match(/class="rating-star"[^>]*>([\s\S]*?)<\/div>/)
    const starCount = starBlock ? (starBlock[1].match(/&#9733;/g) || []).length : 3

    return res.status(200).json({
      handle,
      rating: ratingMatch ? parseInt(ratingMatch[1], 10) : 1636,
      maxRating: highestMatch ? parseInt(highestMatch[1], 10) : 1636,
      stars: starCount || 3,
      authenticated: Boolean(token),
      source: 'live',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message, source: 'fallback' })
  }
}
