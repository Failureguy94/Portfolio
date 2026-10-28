import { profile } from './profile.js'
import cp from './cp.json' with { type: 'json' }

const cfRankCap = cp.codeforces.rank
  ? cp.codeforces.rank.charAt(0).toUpperCase() + cp.codeforces.rank.slice(1)
  : ''

export const siteMetrics = {
  cgpa: profile.cgpa,
  graduationYears: profile.graduationYears || profile.batch,
  codeforcesRating: cp.codeforces.rating,
  codeforcesRank: cfRankCap,
  codechefRating: cp.codechef.rating,
  codechefStars: cp.codechef.stars,
  leetcodeSolved: cp.leetcode.solved,
}

export const siteMeta = {
  title: `${profile.displayName} — CSE internships | ${profile.collegeShort}`,
  description: `${profile.displayName}, ${profile.degree} (${siteMetrics.graduationYears}, CGPA ${siteMetrics.cgpa}) at ${profile.collegeShort}. Codeforces ${siteMetrics.codeforcesRank} (${siteMetrics.codeforcesRating}), CodeChef ${siteMetrics.codechefStars}★ (${siteMetrics.codechefRating}). Open to internships.`,
  ogTitle: `${profile.displayName} — CSE internships | ${profile.collegeShort}`,
  ogDescription: `Codeforces ${siteMetrics.codeforcesRank} (${siteMetrics.codeforcesRating}), CodeChef ${siteMetrics.codechefStars}★ (${siteMetrics.codechefRating}). ${profile.degree} (${siteMetrics.graduationYears}, CGPA ${siteMetrics.cgpa}) at ${profile.collegeShort}. Ratings, projects, and contact.`,
  twitterTitle: `${profile.displayName} — CSE internships | ${profile.collegeShort}`,
  twitterDescription: `Codeforces ${siteMetrics.codeforcesRank} (${siteMetrics.codeforcesRating}), CodeChef ${siteMetrics.codechefStars}★ (${siteMetrics.codechefRating}), CGPA ${siteMetrics.cgpa}. Open to internships.`,
}
