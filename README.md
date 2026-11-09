# Sarthak Parkale: Feature Presentation

Single-page internship portfolio built with Vite, React and Tailwind CSS v4. The page plays like one film: a film-leader countdown, a title card, opening credits, four project "posters", a box-office ledger of competitive programming numbers, cast and crew, and end credits that finish on the contact details.

The visual language follows mid-century title design: flat cut-paper shapes, condensed type, cream and black reels, one orange-red and one mustard. All illustrations are original SVG in `src/components/posters/`. No film IP is used.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173, includes the /api functions
npm run build      # fails if any data file still contains a TODO
npm run preview
```

## Edit content

You should not need to touch components. Edit these files:

| File | What it controls |
| --- | --- |
| `src/data/profile.js` | Name, hero caption, opening credits, nav, end-credits roll, email, GitHub, LinkedIn, resume path, availability line |
| `src/data/projects.js` | Projects in display order: title, tagline, synopsis, "cast" (stack), repo and live links, poster choice and poster alt text |
| `src/data/skills.js` | Cast & crew groups. Only list a skill if a project on the page used it |
| `src/data/cp.json` | Handles, profile URLs, and the static fallback numbers shown when a live fetch fails. Update `lastUpdated` when you edit it |
| `src/data/copy.js` | Headings, button labels, small interface copy |
| `src/data/metadata.js` | Page title, description, Open Graph text, site URL |
| `public/resume.pdf` | The resume behind every Resume link |

Conventions:

- Set `repo` or `live` to `null` to hide that link.
- For data you do not have yet, write `[PLACEHOLDER]` with a `// TODO` comment. `npm run build` refuses to build while a TODO remains, so a placeholder can never ship.
- A project's `poster` is one of `slick`, `vault`, `lens` or `signpost`. To add a fifth project, draw a new poster component in `src/components/posters/` and register it in `index.js`.

### Live numbers

- **Codeforces:** fetched in the browser from the public API (`user.info`, `user.rating`). The current rank label is only shown when it comes from the live API, never from the snapshot.
- **LeetCode:** `/api/leetcode` (a Vercel function) queries LeetCode's GraphQL endpoint. The fallback shows `cp.json`'s `solved` with a `+`.
- **CodeChef:** `/api/codechef` reads a stats service if `CODECHEF_API_KEY` is set, otherwise the public profile page.

Results are cached for five minutes per tab. 

## Deploy to Vercel

1. Push the branch to GitHub and import the repo in Vercel. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
2. Optional: under *Settings, Environment Variables*, add `LEETCODE_SESSION` and `CODECHEF_API_KEY` (see `.env.example`). Never prefix secrets with `VITE_`.
3. If the production domain is not `https://sarthakparkale.vercel.app`, change `siteUrl` in `src/data/metadata.js`, then update `public/robots.txt` and `public/sitemap.xml`.

`vercel.json` routes `/api/*` to the functions and everything else to `index.html`.

## Scripts

| Command | What it does |
| --- | --- |
| `node scripts/make-og.js` | Re-renders the 1200×630 `public/og.png` title card from `profile.js` (needs network for fonts). Run it after changing the name or hero caption |
| `node scripts/screenshots.js [url] [dir]` | Screenshots every section at 390, 768 and 1440 px |
| `node scripts/verify.js [url]` | Checks horizontal scroll, the countdown and Skip credits by keyboard, link `rel`, external links, the resume, OG tags, the blood artwork file and its `aria-hidden` layer, no TODO strings, and reduced-motion behaviour |
| `npm run art` | Re-renders the hidden hero artwork (see below) |
| `node scripts/check-reveal.js [url] [dir]` | Screenshots the hero reveal mid-trail and 4.5 s later at 390, 768 and 1440 px; checks the loop stops when idle, long tasks, CLS, the sweep and reduced motion |

The Playwright scripts need a browser once: `npx playwright install chromium`.

## Hidden hero artwork (blood reveal)

A blood pool and a black silhouetted figure holding a microscope slide are hidden behind the hero name. Moving the pointer (or dragging a finger sideways) wipes them into view along a soft trail that fades out again. On the first visit of a session, one short automatic sweep shows the effect after the intro.

- **Source:** `art/blood-slide.svg`, an editable SVG with the slide and the figure (an original silhouette with no facial detail, fading out above the name). The pool is `art/blood-pool.png`, lifted from the draft mock-up with `python3 scripts/extract-blood-pool.py <draft.png> art/blood-pool.png` (needs `opencv-python` and `numpy`). The slide label's text is filled from `src/data/profile.js` at render time, so it never needs editing by hand. Geometry the hero relies on (pool centre and radius, slide centre, visible extent) is in `src/lib/bloodArt.js`; update it if you move things in the SVG.
- **Regenerate:** `npm run art` renders `public/art/blood-slide.webp` (transparent, 2960×1520, about 140 KB) and a PNG fallback with Playwright. It also prints the contrast of the black name over the pool (the draft's deep red gives about 2.3–2.6:1, below the 3:1 large-text guideline, while the trail is showing) and warns if the WebP exceeds 250 KB. `--preview out.png` saves the art over the hero paper colour.
- **Tune the trail:** constants at the top of `src/hooks/useTrailMask.js`:
  - `BRUSH_RADIUS` (140 px at a 1440 px hero; scales with width, clamped by `BRUSH_MIN`/`BRUSH_MAX`, 90–170), `BRUSH_JITTER`, `SPEED_BOOST`
  - `FADE_MS`: how long a stamp takes to disappear completely (4000 ms)
  - `MAX_OPACITY` (0.9): the art's strongest opacity. Lowering it also lightens the pool behind the name
  - `STATIC_OPACITY` (0.12): the still art shown under reduced motion
  - `SWEEP_MS`: length of the discovery sweep
- **Behaviour:** the animation loop only runs while some trail is visible, and stops when the hero is offscreen or the tab is hidden. The layer is `aria-hidden`, ignores the pointer, and is absolutely positioned, so it cannot block clicks or shift layout. If the artwork fails to load, nothing happens.

## Motion and accessibility

- The film-leader countdown runs for 1.65 s, once per tab (`sessionStorage`). It can be skipped with Esc, Enter, Space, a click, or the focused "Skip intro" button.
- Motion, almost all CSS:
  - Text rises out of a soft blur, and headings slide in word by word.
  - The hero has pointer parallax and a hidden artwork revealed by a cursor trail.
  - Each poster animates its own parts and tilts toward the cursor.
  - Two film-strip marquees run between sections.
  - The numbers and skills sections use glass panels over drifting colour fields.
  - Numbers roll up into place, and a scroll-progress line runs under the nav.
- Under `prefers-reduced-motion` the hero artwork sits still at 12% opacity, with no trail or sweep. There is also no countdown, parallax, marquee, grain flicker or credit roll, and every element shows in its final state.
- The end-credits roll pauses on hover or focus. "Skip credits" moves focus to the contact frame.
- Colour pairs used for text are AA or better: cream on black 15.2:1, mustard on black 8.9:1. Orange-red is used for shapes only.

## Credits

Fonts: Anton (self-hosted in `public/fonts`), Source Serif 4, Inter and Special Elite (`@fontsource/special-elite`, used only when the artwork is rendered), all under the SIL Open Font License 1.1.
