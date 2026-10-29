import { useEffect, useState } from 'react'
import { projects as fallbackProjects } from '../data/projects'
import { profile } from '../data/profile'

const CACHE_KEY = 'portfolio_github_cache_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function parseGitHubRepo(url) {
  if (!url) return null
  const match = String(url).match(/github\.com\/([^/]+)\/([^/#?]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

export function useGitHubProjects() {
  const token = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.VITE_GITHUB_API_KEY || ''
  const handle = profile.github?.handle || 'Failureguy94'

  const [state, setState] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.projects)) {
          return {
            projects: parsed.projects,
            userStats: parsed.userStats,
            status: 'ok',
            source: 'cache',
            authenticated: Boolean(token),
            lastSynced: parsed.lastSynced,
          }
        }
      }
    } catch {
      // ignore storage errors
    }

    return {
      projects: fallbackProjects,
      userStats: {
        publicRepos: fallbackProjects.filter((p) => Boolean(p.repo)).length,
        followers: 0,
        totalStars: fallbackProjects.reduce((sum, p) => sum + (p.stars || 0), 0),
      },
      status: 'loading',
      source: 'static',
      authenticated: Boolean(token),
      lastSynced: null,
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    async function loadGitHubData() {
      const headers = {
        Accept: 'application/vnd.github.v3+json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      try {
        const userPromise = fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
          headers,
          signal: controller.signal,
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)

        const projectPromises = fallbackProjects.map(async (project) => {
          const parsed = parseGitHubRepo(project.repo)
          if (!parsed) return project

          try {
            const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
              headers,
              signal: controller.signal,
            })
            if (!res.ok) return project
            const data = await res.json()

            return {
              ...project,
              stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : project.stars,
              lastCommit: data.pushed_at ? data.pushed_at.slice(0, 10) : project.lastCommit,
              language: data.language || project.language,
            }
          } catch {
            return project
          }
        })

        const [userData, liveProjects] = await Promise.all([userPromise, Promise.all(projectPromises)])

        const totalStars = liveProjects.reduce((sum, p) => sum + (p.stars || 0), 0)
        const userStats = {
          publicRepos: userData?.public_repos ?? liveProjects.filter((p) => Boolean(p.repo)).length,
          followers: userData?.followers ?? 0,
          totalStars,
        }

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const nextState = {
          projects: liveProjects,
          userStats,
          status: 'ok',
          source: 'live',
          authenticated: Boolean(token),
          lastSynced: now,
        }

        setState(nextState)

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              projects: liveProjects,
              userStats,
              lastSynced: now,
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

    loadGitHubData()

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [token, handle])

  return state
}
