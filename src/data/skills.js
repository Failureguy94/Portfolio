// Only list a skill if it was used in a project on the page.
// `usedIn` holds project titles, shown as small text under each name.

export const skillGroups = [
  {
    name: 'Languages',
    items: [
      { name: 'Python', usedIn: ['SlickSherlock', 'DVR/NVR tool'] },
      { name: 'TypeScript', usedIn: ['SlickSherlock', 'Veri Bounty', 'Codekick'] },
      { name: 'JavaScript', usedIn: ['Veri Bounty', 'Codekick'] },
      { name: 'Rust', usedIn: ['Veri Bounty'] },
    ],
  },
  {
    name: 'Web',
    items: [
      { name: 'React', usedIn: ['SlickSherlock', 'Veri Bounty', 'Codekick'] },
      { name: 'Next.js', usedIn: ['Codekick'] },
      { name: 'Express', usedIn: ['Veri Bounty'] },
      { name: 'FastAPI', usedIn: ['SlickSherlock', 'DVR/NVR tool'] },
      { name: 'MapLibre', usedIn: ['SlickSherlock'] },
    ],
  },
  {
    name: 'Blockchain',
    items: [
      { name: 'Solana', usedIn: ['Veri Bounty'] },
      { name: 'Anchor', usedIn: ['Veri Bounty'] },
      { name: 'Wallet adapters', usedIn: ['Veri Bounty'] },
    ],
  },
  {
    name: 'Tools',
    items: [
      { name: 'MongoDB', usedIn: ['Veri Bounty'] },
      { name: 'Supabase', usedIn: ['Codekick'] },
      { name: 'OpenCV', usedIn: ['DVR/NVR tool'] },
      { name: 'FFmpeg', usedIn: ['DVR/NVR tool'] },
      { name: 'Gemini API', usedIn: ['Veri Bounty', 'Codekick'] },
    ],
  },
  {
    name: 'Contests',
    items: [{ name: 'C++', usedIn: ['Codeforces', 'CodeChef'] }],
  },
]
