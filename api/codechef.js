const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'

// The public profile page embeds every rated contest as `var all_rating = [...]`.
function parseHistory(html) {
  const m = html.match(/var all_rating\s*=\s*(\[[\s\S]*?\]);/)
  if (!m) return null
  try {
    return JSON.parse(m[1])
      .map((c) => ({
        // end_date is Indian Standard Time
        t: Math.round(Date.parse(`${String(c.end_date).replace(' ', 'T')}+05:30`) / 1000),
        rating: parseInt(c.rating, 10),
        name: c.name,
      }))
      .filter((c) => Number.isFinite(c.t) && Number.isFinite(c.rating))
  } catch {
    return null
  }
}

async function fetchProfilePage(handle) {
  const pageRes = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { 'User-Agent': UA },
  })
  if (!pageRes.ok) throw new Error(`CodeChef responded with HTTP ${pageRes.status}`)
  return pageRes.text()
}

async function historyFromPage(handle) {
  try {
    return parseHistory(await fetchProfilePage(handle))
  } catch {
    return null
  }
}

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

  const isUrl = Boolean(token && /^https?:\/\//i.test(token.trim()))

  try {
    // 1. If token is a URL (such as codechef-stats.tashif.codes)
    if (isUrl) {
      const trimmedUrl = token.trim()
      // Determine candidate URLs: the given URL and handle-specific variants if URL contains another username (e.g. tourist)
      const candidateUrls = [trimmedUrl]
      if (trimmedUrl.includes('tashif.codes')) {
        candidateUrls.push(
          `https://codechef-stats.tashif.codes/${encodeURIComponent(handle)}`,
          `https://codechef-stats.tashif.codes/profile/${encodeURIComponent(handle)}`,
        )
        // If the URL had a different user (e.g. /tourist/profile), substitute with current handle
        const replaced = trimmedUrl.replace(/(?<=\/)[a-zA-Z0-9_-]+(?=(\/profile|\/rating|\/heatmap)?$)/, handle)
        if (replaced !== trimmedUrl) candidateUrls.unshift(replaced)
      }

      for (const targetUrl of candidateUrls) {
        try {
          const apiRes = await fetch(targetUrl, {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          })
          if (!apiRes.ok) continue
          const json = await apiRes.json()
          const rawRating =
            json?.data?.currentRating ??
            json?.data?.current ??
            json?.profile?.currentRating ??
            json?.currentRating
          if (rawRating != null && !Number.isNaN(Number(rawRating))) {
            const rawMax =
              json?.data?.maxRating ??
              json?.data?.max ??
              json?.profile?.highestRating ??
              json?.highestRating ??
              rawRating
            const rawStars = json?.data?.rank ?? json?.profile?.stars ?? json?.stars
            const starsNum = rawStars ? parseInt(String(rawStars).replace(/[^0-9]/g, ''), 10) : null
            const contests = json?.data?.totalContests ?? json?.profile?.totalContests ?? null
            const totalSolved = json?.data?.totalSolved ?? json?.profile?.totalSolved ?? null

            return res.status(200).json({
              handle,
              rating: Math.round(Number(rawRating)),
              maxRating: Math.round(Number(rawMax)),
              stars: starsNum || null,
              contests,
              totalSolved,
              history: await historyFromPage(handle),
              authenticated: true,
              source: 'live',
            })
          }
        } catch {
          // try next candidate URL
        }
      }
    }

    // 2. If token is an official OAuth Bearer token
    if (token && !isUrl) {
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
          const starsNum = parseInt(String(rawStars).replace('★', ''), 10) || null
          return res.status(200).json({
            handle,
            rating: user.currentRating,
            maxRating: user.highestRating,
            stars: starsNum,
            contests: null,
            history: await historyFromPage(handle),
            authenticated: true,
            source: 'live',
          })
        }
      }
    }

    // 3. Fallback to direct public profile scraper
    const html = await fetchProfilePage(handle)
    const ratingMatch = html.match(/class="rating-number"[^>]*>\s*([0-9]+)\s*</)
    const highestMatch = html.match(/\(Highest Rating\s*([0-9]+)\)/)
    const starBlock = html.match(/class="rating-star"[^>]*>([\s\S]*?)<\/div>/)
    const starCount = starBlock ? (starBlock[1].match(/&#9733;/g) || []).length : null

    if (!ratingMatch) {
      throw new Error('CodeChef rating not found on profile page')
    }
    const rating = parseInt(ratingMatch[1], 10)

    return res.status(200).json({
      handle,
      rating,
      maxRating: highestMatch ? parseInt(highestMatch[1], 10) : rating,
      stars: starCount || null,
      contests: null,
      history: parseHistory(html),
      authenticated: Boolean(token),
      source: 'live',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message, source: 'fallback' })
  }
}
