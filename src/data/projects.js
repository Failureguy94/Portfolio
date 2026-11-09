// Projects, strongest first. `poster` picks the SVG composition in src/components/posters.
// `repo` / `live`: set to null to hide the link.

export const projects = [
  {
    id: 'slicksherlock',
    title: 'SlickSherlock',
    poster: 'slick',
    tagline: 'Somebody spilled oil. A satellite saw it.',
    synopsis: [
      'Investigators get a satellite radar scene of an oil slick and need to know which ships to look at first.',
      'For Smart India Hackathon I built the prototype end to end: slick segmentation, reverse drift, correlation against AIS vessel tracks, and an exportable dossier.',
      'It returns ranked candidates for investigation, not a verdict, and the console is live.',
    ],
    cast: [
      ['Detection', 'Python, SAR imagery'],
      ['Vessel tracks', 'AIS data'],
      ['API', 'FastAPI'],
      ['Console', 'React, TypeScript, MapLibre'],
    ],
    repo: 'https://github.com/Failureguy94/SpillForensic-AI',
    live: 'https://spill-forensic-ai.vercel.app',
    posterAlt:
      'Poster: a black oil slick on a mustard field, with a dashed vessel track leading out of it to a small orange ship, watched by a satellite.',
  },
  {
    id: 'veribounty',
    title: 'Veri Bounty',
    poster: 'vault',
    tagline: 'Put money on the truth.',
    synopsis: [
      'Fact-checking bounties need a stake, a review step and a payout that cannot leak funds.',
      'I architected the dApp: an Anchor program that holds the bounty in a PDA vault, an Express and MongoDB backend with a Gemini pre-screen, and a React client with wallet adapters.',
      'It runs on Solana devnet with automated payouts.',
    ],
    cast: [
      ['Chain', 'Solana'],
      ['Escrow', 'Anchor, Rust'],
      ['Backend', 'Express, MongoDB'],
      ['Client', 'React, TypeScript'],
    ],
    repo: 'https://github.com/Failureguy94/VeriBounty',
    live: null,
    posterAlt:
      'Poster: an orange vault door on black, with a mustard magnifying glass showing a check mark.',
  },
  {
    id: 'dvr-nvr',
    title: 'DVR/NVR Forensic Analysis Tool',
    poster: 'lens',
    tagline: 'Every camera keeps its diary in a different language.',
    synopsis: [
      'Each DVR and NVR vendor stores footage its own way, which slows forensic teams down.',
      'For an NTRO problem statement at Smart India Hackathon, I built container demuxing, stream repair, frame-integrity hashing and timestamp carving into one vendor-agnostic tool.',
      'The result keeps verifiable chain-of-custody data for every clip.',
    ],
    cast: [
      ['Core', 'Python'],
      ['Video', 'OpenCV, FFmpeg'],
      ['Service', 'FastAPI'],
      ['Desktop', 'PyQt'],
    ],
    repo: null,
    live: null,
    posterAlt:
      'Poster: a camera lens with an aperture on an orange field, above a video timeline with a playhead.',
  },
  {
    id: 'codekick',
    title: 'Codekick',
    poster: 'signpost',
    tagline: 'For the first-year who doesn’t know where to start.',
    synopsis: [
      'Incoming freshmen kept asking which tech domain to start with and which resources to trust.',
      'Codekick lays out each domain’s trade-offs and a roadmap, with an AI chatbot for the follow-up questions.',
      'I built it full stack.',
    ],
    cast: [
      ['App', 'Next.js, React'],
      ['Data', 'Supabase'],
      ['Chatbot', 'Gemini'],
    ],
    repo: 'https://github.com/Failureguy94/codekick',
    live: 'https://codepunch.vercel.app',
    posterAlt:
      'Poster: a crooked signpost with three arrows pointing in different directions, labelled Web, ML and Web3.',
  },
]
