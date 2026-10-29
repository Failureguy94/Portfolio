import { useEffect, useState } from 'react'
import fallback from '../data/cp.json'

const INFO_URL = 'https://codeforces.com/api/user.info'
const RATING_URL = 'https://codeforces.com/api/user.rating'
const CACHE_KEY = 'portfolio_cf_cache_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function sha512(str) {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function buildCodeforcesUrl(baseUrl, methodName, baseParams, apiKey, apiSecret) {
  const url = new URL(baseUrl)
  const params = { ...baseParams }

  if (apiKey && apiSecret) {
    const time = Math.floor(Date.now() / 1000)
    params.apiKey = apiKey
    params.time = String(time)

    // Sort parameter keys alphabetically
    const sortedKeys = Object.keys(params).sort()
    const queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&')

    // 6 random characters prefix
    const rand = String(Math.floor(100000 + Math.random() * 900000))
    const sigString = `${rand}/${methodName}?${queryString}#${apiSecret}`
    const hash = await sha512(sigString)
    params.apiSig = `${rand}${hash}`
  }

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return url.toString()
}

export function useCodeforces() {
  const handle = fallback.codeforces.handle
  const apiKey = import.meta.env.VITE_CODEFORCES_API_KEY || ''
  const apiSecret = import.meta.env.VITE_CODEFORCES_API_SECRET || ''
  const isAuth = Boolean(apiKey && apiSecret)

  const [state, setState] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.info) {
          return {
            status: 'ok',
            source: 'cache',
            authenticated: isAuth,
            lastSynced: parsed.lastSynced,
            info: parsed.info,
            history: parsed.history,
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
      info: {
        handle,
        rank: fallback.codeforces.rank,
        rating: fallback.codeforces.rating,
        maxRating: fallback.codeforces.maxRating,
        maxRank: fallback.codeforces.maxRank,
      },
      history: fallback.codeforces.history,
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    async function load() {
      try {
        const infoUrl = await buildCodeforcesUrl(
          INFO_URL,
          'user.info',
          { handles: handle },
          apiKey,
          apiSecret,
        )
        const ratingUrl = await buildCodeforcesUrl(
          RATING_URL,
          'user.rating',
          { handle },
          apiKey,
          apiSecret,
        )

        const [infoRes, ratingRes] = await Promise.all([
          fetch(infoUrl, { signal: controller.signal }),
          fetch(ratingUrl, { signal: controller.signal }),
        ])

        if (!infoRes.ok || !ratingRes.ok) throw new Error('Codeforces request failed')

        const infoJson = await infoRes.json()
        const ratingJson = await ratingRes.json()
        if (infoJson.status !== 'OK' || ratingJson.status !== 'OK') {
          throw new Error('Codeforces payload not OK')
        }

        const user = infoJson.result[0]
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const liveInfo = {
          handle: user.handle,
          rank: user.rank,
          rating: user.rating,
          maxRating: user.maxRating,
          maxRank: user.maxRank,
        }

        const liveHistory = ratingJson.result.map((c) => ({
          contestId: c.contestId,
          contestName: c.contestName,
          ratingUpdateTimeSeconds: c.ratingUpdateTimeSeconds,
          newRating: c.newRating,
        }))

        const nextState = {
          status: 'ok',
          source: 'live',
          authenticated: isAuth,
          lastSynced: now,
          info: liveInfo,
          history: liveHistory,
        }

        setState(nextState)

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              lastSynced: now,
              info: liveInfo,
              history: liveHistory,
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
  }, [handle, apiKey, apiSecret, isAuth])

  return state
}
