import { useEffect, useState } from 'react'
import fallback from '../data/cp.json'

const INFO_URL = 'https://codeforces.com/api/user.info'
const RATING_URL = 'https://codeforces.com/api/user.rating'

export function useCodeforces() {
  const handle = fallback.codeforces.handle
  const [state, setState] = useState({
    status: 'loading',
    source: 'live',
    info: {
      handle,
      rank: fallback.codeforces.rank,
      rating: fallback.codeforces.rating,
      maxRating: fallback.codeforces.maxRating,
      maxRank: fallback.codeforces.maxRank,
    },
    history: fallback.codeforces.history,
  })

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    async function load() {
      try {
        const [infoRes, ratingRes] = await Promise.all([
          fetch(`${INFO_URL}?handles=${encodeURIComponent(handle)}`, {
            signal: controller.signal,
          }),
          fetch(`${RATING_URL}?handle=${encodeURIComponent(handle)}`, {
            signal: controller.signal,
          }),
        ])

        if (!infoRes.ok || !ratingRes.ok) throw new Error('Codeforces request failed')

        const infoJson = await infoRes.json()
        const ratingJson = await ratingRes.json()
        if (infoJson.status !== 'OK' || ratingJson.status !== 'OK') {
          throw new Error('Codeforces payload not OK')
        }

        const user = infoJson.result[0]
        setState({
          status: 'ok',
          source: 'live',
          info: {
            handle: user.handle,
            rank: user.rank,
            rating: user.rating,
            maxRating: user.maxRating,
            maxRank: user.maxRank,
          },
          history: ratingJson.result.map((c) => ({
            contestId: c.contestId,
            contestName: c.contestName,
            ratingUpdateTimeSeconds: c.ratingUpdateTimeSeconds,
            newRating: c.newRating,
          })),
        })
      } catch {
        setState({
          status: 'fallback',
          source: 'static',
          info: {
            handle,
            rank: fallback.codeforces.rank,
            rating: fallback.codeforces.rating,
            maxRating: fallback.codeforces.maxRating,
            maxRank: fallback.codeforces.maxRank,
          },
          history: fallback.codeforces.history,
        })
      } finally {
        clearTimeout(timeout)
      }
    }

    load()
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [handle])

  return state
}
