import cp from '../data/cp.json'
import { useLiveStat } from './useLiveStat'

const API = 'https://codeforces.com/api'

const fallback = {
  handle: cp.codeforces.handle,
  rank: null, // never claim a rank from a stale snapshot
  rating: cp.codeforces.rating,
  maxRating: cp.codeforces.maxRating,
  solved: cp.codeforces.solved,
  history: cp.codeforces.history,
}

async function load(signal) {
  const handle = encodeURIComponent(cp.codeforces.handle)
  const [infoRes, ratingRes, solved] = await Promise.all([
    fetch(`${API}/user.info?handles=${handle}`, { signal }),
    fetch(`${API}/user.rating?handle=${handle}`, { signal }),
    // counted server-side; a failure here keeps the snapshot number
    fetch(`/api/codeforces?handle=${handle}`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.solved ?? cp.codeforces.solved)
      .catch(() => cp.codeforces.solved),
  ])
  const info = await infoRes.json()
  const rating = await ratingRes.json()
  if (info.status !== 'OK' || rating.status !== 'OK') throw new Error('Codeforces payload not OK')
  const user = info.result[0]
  return {
    handle: user.handle,
    rank: user.rank ?? null,
    rating: user.rating,
    maxRating: user.maxRating,
    solved,
    history: rating.result.map((c) => ({
      contestId: c.contestId,
      contestName: c.contestName,
      ratingUpdateTimeSeconds: c.ratingUpdateTimeSeconds,
      newRating: c.newRating,
    })),
  }
}

export function useCodeforces() {
  return useLiveStat('portfolio_cf_v3', fallback, load)
}
