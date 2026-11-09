import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { siteMeta, siteUrl } from './src/data/metadata.js'
import leetcodeHandler from './api/leetcode.js'
import codechefHandler from './api/codechef.js'
import codeforcesHandler from './api/codeforces.js'

const escapeAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function htmlMetaPlugin() {
  const tokens = {
    SITE_TITLE: siteMeta.title,
    SITE_DESCRIPTION: siteMeta.description,
    SITE_URL: siteUrl,
    OG_TITLE: siteMeta.ogTitle,
    OG_DESCRIPTION: siteMeta.ogDescription,
    OG_IMAGE: siteMeta.ogImage,
    OG_IMAGE_ALT: siteMeta.ogImageAlt,
  }
  return {
    name: 'html-meta-plugin',
    transformIndexHtml(html) {
      return html.replace(/%([A-Z_]+)%/g, (m, key) => (key in tokens ? escapeAttr(tokens[key]) : m))
    },
  }
}

const apiRoutes = {
  '/api/leetcode': leetcodeHandler,
  '/api/codechef': codechefHandler,
  '/api/codeforces': codeforcesHandler,
}

function telemetryApiPlugin() {
  return {
    name: 'telemetry-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const handler = apiRoutes[url.pathname]
          if (handler) {
            const reqShim = {
              query: Object.fromEntries(url.searchParams.entries()),
              headers: req.headers,
              method: req.method,
            }
            const resShim = {
              setHeader: (k, v) => res.setHeader(k, v),
              status: (code) => {
                res.statusCode = code
                return {
                  json: (data) => {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(data))
                  },
                  end: () => res.end(),
                }
              },
            }
            await handler(reqShim, resShim)
            return
          }
        } catch {
          // pass to next middleware on error
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), tailwindcss(), htmlMetaPlugin(), telemetryApiPlugin()],
    base: process.env.VITE_BASE ?? '/',
  }
})
