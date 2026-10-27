# Sarthak Parkale — Race Weekend portfolio

Single-page internship portfolio (Vite + React + Tailwind CSS + Framer Motion). Theme is inspired by an F1 race-weekend livery (navy / racing red / sun yellow) — no team marks or driver photos.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

## How to edit content

Do not hunt through components. Change these files:

| File | What it controls |
| --- | --- |
| `src/data/profile.js` | Name, pitch, college, CGPA, email, GitHub, LinkedIn, resume path, nav labels, keyboard shortcuts |
| `src/data/cp.json` | Codeforces handle + fallback rating history, CodeChef snapshot, LeetCode counts |
| `src/data/projects.js` | Project cards, filters, repo/live URLs, pole vs archive (`featured`) |
| `src/data/skills.js` | Skill groups and “used in” hover text |
| `public/resume.pdf` | Downloadable CV |

Anything marked `TODO` is intentionally incomplete. Fill it in the data file; the UI will pick it up.

Codeforces is fetched live from `user.info` and `user.rating`. If the request fails (CORS, timeout, network), the site falls back to `cp.json`.

## Deploy

### Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel (framework: Vite).
3. Leave the build command as `npm run build` and output as `dist`.
4. Add a production domain, then update `index.html` canonical / Open Graph URLs and `public/robots.txt` + `public/sitemap.xml`.

`vercel.json` already rewrites all routes to `index.html`.

### GitHub Pages

1. In `vite.config.js`, build with a repo base, for example:

   ```bash
   VITE_BASE=/your-repo-name/ npm run build
   ```

2. Deploy the `dist/` folder with GitHub Pages (Actions or `gh-pages`).
3. If the site is `https://<user>.github.io/<repo>/`, that same path must be `VITE_BASE`.

User-site hosting (`https://<user>.github.io/`) can keep `VITE_BASE=/`.

## Keyboard

- `R` replay lights-out intro
- `P` jump to projects
- `C` jump to contact
- `?` shortcut list

The intro uses `sessionStorage` (`race-weekend-intro-seen`), plays once per tab, and is skipped when `prefers-reduced-motion` is set.
