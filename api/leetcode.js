export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const queryParams = req.query || {}
  const username = queryParams.username || 'sarthak0703y'
  const sessionToken =
    process.env.LEETCODE_SESSION ||
    process.env.VITE_LEETCODE_SESSION ||
    process.env.VITE_LEETCODE_API_KEY ||
    (req.headers?.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '')

  const query = `query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      profile { ranking reputation }
    }
  }`

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  }
  if (sessionToken) {
    headers['Cookie'] = `LEETCODE_SESSION=${sessionToken}`
  }

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { username } }),
    })

    if (!response.ok) {
      throw new Error(`LeetCode responded with HTTP ${response.status}`)
    }

    const json = await response.json()
    const stats = json?.data?.matchedUser?.submitStats?.acSubmissionNum || []
    const ranking = json?.data?.matchedUser?.profile?.ranking || null

    let solved = 0
    let easy = 0
    let medium = 0
    let hard = 0

    for (const item of stats) {
      if (item.difficulty === 'All') solved = item.count
      if (item.difficulty === 'Easy') easy = item.count
      if (item.difficulty === 'Medium') medium = item.count
      if (item.difficulty === 'Hard') hard = item.count
    }

    return res.status(200).json({
      handle: username,
      solved,
      easy,
      medium,
      hard,
      ranking,
      authenticated: Boolean(sessionToken),
      source: 'live',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message, source: 'fallback' })
  }
}
