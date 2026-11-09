import { useEffect, useState } from 'react'

const TTL_MS = 5 * 60 * 1000

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Date.now() - parsed.timestamp < TTL_MS ? parsed : null
  } catch {
    return null
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ...value, timestamp: Date.now() }))
  } catch {
    // storage may be unavailable (private mode); live data still renders
  }
}

/**
 * Fetches a stat once per session with a static fallback.
 * `load(signal)` must resolve to the live data or throw.
 * No secrets are read here: anything private lives in the /api functions.
 */
export function useLiveStat(cacheKey, fallbackData, load) {
  const [state, setState] = useState(() => {
    const cached = readCache(cacheKey)
    if (cached) return { source: 'live', syncedAt: cached.syncedAt, data: cached.data }
    return { source: 'static', syncedAt: null, data: fallbackData }
  })

  useEffect(() => {
    if (state.source === 'live') return undefined
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    load(controller.signal)
      .then((data) => {
        const syncedAt = new Date().toISOString()
        writeCache(cacheKey, { data, syncedAt })
        setState({ source: 'live', syncedAt, data })
      })
      .catch(() => {
        // keep the static snapshot
      })
      .finally(() => clearTimeout(timer))

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
    // load once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
