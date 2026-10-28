export const projectFilters = ['All', 'Web', 'Blockchain', 'Hackathon']

export const projects = [
  {
    id: 'slicksherlock',
    name: 'SlickSherlock',
    featured: true,
    pitch:
      'Oil-spill investigation platform using satellite detection with AIS vessel correlation.',
    categories: ['Web', 'Hackathon'],
    stack: ['Python', 'FastAPI', 'React', 'TypeScript', 'MapLibre', 'SAR/AIS'],
    language: 'Python',
    stars: 0,
    lastCommit: '2026-10-03',
    repo: 'https://github.com/Failureguy94/SpillForensic-AI',
    live: 'https://spill-forensic-ai.vercel.app',
    problem:
      'Investigators need a decision-support loop from a SAR scene to ranked vessel candidates, not a black-box “who did it” label.',
    role: 'Built the SIH prototype: scene intake, slick segmentation, reverse drift, AIS correlation, and dossier exports.',
    outcome:
      'Smart India Hackathon prototype (NTRO-related oil-spill attribution). Live console is deployed; vessel output is candidates for investigation, not findings of responsibility.',
  },
  {
    id: 'veribounty',
    name: 'Veri Bounty',
    featured: true,
    pitch:
      'Solana fact-checking bounty platform with an Anchor escrow, React client, and Express/Mongo backend.',
    categories: ['Blockchain', 'Web'],
    stack: ['Solana', 'Anchor', 'Rust', 'React', 'TypeScript', 'Express', 'MongoDB'],
    language: 'TypeScript',
    stars: 0,
    lastCommit: '2026-07-20',
    repo: 'https://github.com/Failureguy94/VeriBounty',
    live: null,
    problem:
      'Fact-checking bounties need stake, verification, and payouts that cannot leak funds or skip the claim review path.',
    role: 'Architected the dApp: Anchor PDAs for escrow, REST backend with Gemini pre-screen, React + wallet adapter frontend.',
    outcome:
      'Devnet prototype processing simulated fact-check transactions with automated payouts from a PDA vault.',
  },
  {
    id: 'dvr-nvr',
    name: 'DVR/NVR Forensic Analysis Tool',
    featured: true,
    pitch:
      'Multi-vendor DVR/NVR forensic analysis tool for a Smart India Hackathon NTRO problem statement.',
    categories: ['Hackathon'],
    stack: [],
    language: '',
    stars: 0,
    lastCommit: '',
    repo: '',
    live: null,
    problem:
      'Forensic teams need a vendor-agnostic way to inspect DVR/NVR footage and metadata under an NTRO-style brief.',
    role: 'SIH prototype: scene intake, multi-vendor video extraction, and metadata parsing under forensic guidelines.',
    outcome:
      'Smart India Hackathon prototype (NTRO problem statement). Vendor-agnostic parser for proprietary surveillance footage.',
  },
  {
    id: 'codekick',
    name: 'Codekick',
    featured: false,
    pitch:
      'Helps incoming freshmen pick a tech domain with trade-offs, roadmaps, and an AI chatbot.',
    categories: ['Web'],
    stack: ['React', 'Next.js', 'TypeScript', 'Supabase', 'Gemini'],
    language: 'TypeScript',
    stars: 2,
    lastCommit: '2026-03-23',
    repo: 'https://github.com/Failureguy94/codekick',
    live: 'https://codepunch.vercel.app',
    problem:
      'First-year students kept asking which domain to start with and which resources to trust.',
    role: 'Full-stack: React/Next client, Supabase backend, Gemini chatbot for domain Q&A.',
    outcome:
      'Used by 300+ incoming freshmen; chatbot handled 1,000+ domain queries in the stated snapshot.',
  },
]
