import cp from '../data/cp.json'
import { useLiveStat } from './useLiveStat'

const fallback = {
  handle: cp.codechef.handle,
  stars: cp.codechef.stars,
  rating: cp.codechef.rating,
  maxRating: cp.codechef.maxRating,
  solved: null,
}

async function load(signal) {
  const res = await fetch(`/api/codechef?handle=${encodeURIComponent(cp.codechef.handle)}`, { signal })
  const json = await res.json()
  if (!res.ok || json.error || !json.rating) throw new Error('CodeChef unavailable')
  return {
    handle: json.handle || cp.codechef.handle,
    stars: json.stars ?? cp.codechef.stars,
    rating: json.rating,
    maxRating: json.maxRating ?? json.rating,
    solved: json.totalSolved ?? null,
  }
}

export function useCodeChef() {
  return useLiveStat('portfolio_cc_v2', fallback, load)
}
