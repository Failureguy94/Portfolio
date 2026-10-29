import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { siteMeta } from './src/data/metadata.js'
import leetcodeHandler from './api/leetcode.js'
import codechefHandler from './api/codechef.js'

function htmlMetaPlugin() {
  return {
    name: 'html-meta-plugin',
    transformIndexHtml(html) {
      return html
        .replace(/<title>.*?<\/title>/, `<title>${siteMeta.title}</title>`)
        .replace(/<meta\s+name="description"\s+content=".*?"\s*\/>/, `<meta name="description" content="${siteMeta.description}" />`)
        .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/>/, `<meta property="og:title" content="${siteMeta.ogTitle}" />`)
        .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/>/, `<meta property="og:description" content="${siteMeta.ogDescription}" />`)
        .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/>/, `<meta name="twitter:title" content="${siteMeta.twitterTitle}" />`)
        .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/, `<meta name="twitter:description" content="${siteMeta.twitterDescription}" />`)
    },
  }
}

function telemetryApiPlugin() {
  return {
    name: 'telemetry-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          if (url.pathname === '/api/leetcode') {
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
            await leetcodeHandler(reqShim, resShim)
            return
          }
          if (url.pathname === '/api/codechef') {
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
            await codechefHandler(reqShim, resShim)
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

export default defineConfig({
  plugins: [react(), tailwindcss(), htmlMetaPlugin(), telemetryApiPlugin()],
  base: process.env.VITE_BASE ?? '/',
})
