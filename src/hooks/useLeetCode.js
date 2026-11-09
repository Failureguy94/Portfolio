import cp from '../data/cp.json'
import { useLiveStat } from './useLiveStat'

const fallback = {
  handle: cp.leetcode.handle,
  solved: cp.leetcode.solved,
  rating: cp.leetcode.rating,
  maxRating: cp.leetcode.maxRating,
  history: cp.leetcode.history,
}

async function load(signal) {
  const res = await fetch(`/api/leetcode?username=${encodeURIComponent(cp.leetcode.handle)}`, { signal })
  const json = await res.json()
  if (!res.ok || json.error || !json.solved) throw new Error('LeetCode unavailable')
  // LeetCode's public API may not report a contest rating; cp.json then holds the real one
  const rating = json.rating ?? cp.leetcode.rating
  return {
    handle: json.handle,
    solved: json.solved,
    rating,
    maxRating: Math.max(rating ?? 0, cp.leetcode.maxRating ?? 0, ...(json.contestHistory ?? []).map((c) => c.rating)) || null,
    history: json.contestHistory?.length ? json.contestHistory : cp.leetcode.history,
  }
}

export function useLeetCode() {
  return useLiveStat('portfolio_lc_v4', fallback, load)
}
