import { useEffect, useState } from 'react'
import fallback from '../data/cp.json'

const CACHE_KEY = 'portfolio_lc_cache_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useLeetCode() {
  const handle = fallback.leetcode.handle || 'sarthak0703y'
  const token =
    import.meta.env.VITE_LEETCODE_SESSION ||
    import.meta.env.VITE_LEETCODE_API_KEY ||
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
        solved: fallback.leetcode.solved,
        target: fallback.leetcode.target || 600,
        easy: fallback.leetcode.easy,
        medium: fallback.leetcode.medium,
        hard: fallback.leetcode.hard,
        ranking: null,
        note: fallback.leetcode.note,
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

        const res = await fetch(`/api/leetcode?username=${encodeURIComponent(handle)}`, {
          headers,
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('LeetCode request failed')

        const json = await res.json()
        if (json.error) throw new Error(json.error)

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const liveData = {
          handle: json.handle || handle,
          solved: json.solved || fallback.leetcode.solved,
          target: fallback.leetcode.target || 600,
          easy: json.easy,
          medium: json.medium,
          hard: json.hard,
          ranking: json.ranking,
          note: `Live profile synced${json.ranking ? ` · Global Rank #${json.ranking.toLocaleString()}` : ''}`,
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
