import { useEffect, useState } from 'react'
import fallback from '../data/cp.json'

const CACHE_KEY = 'portfolio_cc_cache_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useCodeChef() {
  const handle = fallback.codechef.handle || 'sarthak14313'
  const token =
    import.meta.env.VITE_CODECHEF_API_KEY ||
    import.meta.env.VITE_CODECHEF_TOKEN ||
    ''
  const isAuth = Boolean(token)

  const [state, setState] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
          return {
            status: 'ok',
            source: 'cache',
            authenticated: isAuth,
            lastSynced: parsed.lastSynced,
            data: parsed.data,
          }
        }
      }
    } catch {
      // ignore cache read errors
    }

    return {
      status: 'loading',
      source: 'static',
      authenticated: isAuth,
      lastSynced: null,
      data: {
        handle,
        stars: fallback.codechef.stars,
        rating: fallback.codechef.rating,
        maxRating: fallback.codechef.maxRating,
        contests: fallback.codechef.contests || 37,
        note: fallback.codechef.note,
      },
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    async function load() {
      try {
        const headers = {
          Accept: 'application/json',
        }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const res = await fetch(`/api/codechef?handle=${encodeURIComponent(handle)}`, {
          headers,
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('CodeChef request failed')

        const json = await res.json()
        if (json.error) throw new Error(json.error)

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const liveData = {
          handle: json.handle || handle,
          stars: json.stars || fallback.codechef.stars,
          rating: json.rating || fallback.codechef.rating,
          maxRating: json.maxRating || fallback.codechef.maxRating,
          contests: json.contests || fallback.codechef.contests || 37,
          totalSolved: json.totalSolved || null,
          note: `Live profile synced · ${json.stars}-star rating${json.totalSolved ? ` · ${json.totalSolved} solved` : ''}`,
        }

        const nextState = {
          status: 'ok',
          source: 'live',
          authenticated: Boolean(json.authenticated || isAuth),
          lastSynced: now,
          data: liveData,
        }

        setState(nextState)

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              lastSynced: now,
              data: liveData,
            }),
          )
        } catch {
          // ignore cache write errors
        }
      } catch {
        setState((prev) => ({
          ...prev,
          status: 'fallback',
          source: 'static',
        }))
      } finally {
        clearTimeout(timeout)
      }
    }

    load()
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [handle, token, isAuth])

  return state
}
