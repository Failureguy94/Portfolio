import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { siteMeta } from './src/data/metadata.js'

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

export default defineConfig({
  plugins: [react(), tailwindcss(), htmlMetaPlugin()],
  base: process.env.VITE_BASE ?? '/',
})
