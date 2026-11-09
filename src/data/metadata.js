import { profile } from './profile.js'
import cp from './cp.json' with { type: 'json' }

export const siteUrl = 'https://sarthakparkale.vercel.app'

const summary = `Codeforces ${cp.codeforces.rating}, CodeChef ${cp.codechef.stars}-star (${cp.codechef.rating}), ${cp.leetcode.solved}+ LeetCode problems.`

export const siteMeta = {
  title: `${profile.name} · Software internships · ${profile.college}`,
  description: `${profile.name}, B.Tech CSE (${profile.batch}) at ${profile.college}. Projects in investigation tools and Solana. ${summary} Open to internships.`,
  ogTitle: `${profile.name}: a feature presentation`,
  ogDescription: `Projects, competitive programming numbers and contact for ${profile.name}, ${profile.college}. ${summary}`,
  ogImage: `${siteUrl}/og.png`,
  ogImageAlt: `${profile.name} title card`,
}
