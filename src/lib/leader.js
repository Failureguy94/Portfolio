export const LEADER_KEY = 'portfolio_leader_seen'

export function shouldPlayCountdown() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(LEADER_KEY) !== '1'
  } catch {
    return true
  }
}

