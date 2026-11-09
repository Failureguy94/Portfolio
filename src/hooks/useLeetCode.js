import cp from '../data/cp.json'
import { useLiveStat } from './useLiveStat'

const fallback = { handle: cp.leetcode.handle, solved: cp.leetcode.solved, history: cp.leetcode.history }

async function load(signal) {
  const res = await fetch(`/api/leetcode?username=${encodeURIComponent(cp.leetcode.handle)}`, { signal })
  const json = await res.json()
  if (!res.ok || json.error || !json.solved) throw new Error('LeetCode unavailable')
  return {
    handle: json.handle,
    solved: json.solved,
    history: json.contestHistory?.length ? json.contestHistory : cp.leetcode.history,
  }
}

export function useLeetCode() {
  return useLiveStat('portfolio_lc_v3', fallback, load)
}
