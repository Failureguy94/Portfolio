import { useEffect, useRef } from 'react'
import { ART } from '../lib/bloodArt.js'

// ---------- tuning ----------
/** Brush radius in px at a 1440px-wide hero. Scales with the hero width, clamped below. */
export const BRUSH_RADIUS = 140
export const BRUSH_MIN = 90
export const BRUSH_MAX = 170
/** ± variation of each stamp's radius and opacity, so the edge feels organic. */
export const BRUSH_JITTER = 0.12
/** Fast strokes lay stamps up to this much larger (0.35 = +35%). */
export const SPEED_BOOST = 0.35
/** A stamp has fully faded this long after it was laid (ms). */
export const FADE_MS = 4000
/** The strongest the artwork is ever shown (0–1). */
export const MAX_OPACITY = 1
/** prefers-reduced-motion: the artwork sits still at this opacity instead. */
export const STATIC_OPACITY = 0.12
/** Length of the one-off discovery sweep (ms). */
export const SWEEP_MS = 1200

const MAX_DPR = 2
const TRAIL_SCALE = 0.5 // the trail is soft, so it lives at half resolution
const STAMP_ALPHA = 0.85
const SPACING = 0.28 // gap between interpolated stamps, as a fraction of the radius
const TAU = FADE_MS / 3.6 // exponential decay: ~2.7% left at FADE_MS, then the trail is cleared
const MIN_DECAY_STEP = 0.06 // batch tiny decay steps so 8-bit alpha cannot get stuck
const INK_GAIN = 3 // the letter mask is the trail × this (clamped), so letters flip to paper colour crisply

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const jitter = () => 1 + (Math.random() * 2 - 1) * BRUSH_JITTER
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function makeBrush() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.55, 'rgba(255,255,255,1)')
  grad.addColorStop(0.8, 'rgba(255,255,255,0.5)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return c
}

// Discovery sweep, in artwork units: from below-left of the pool, through it, up to the slide.
function sweepPoint(t) {
  const p0 = [ART.poolCx - ART.poolR * 0.95, ART.poolCy + ART.poolR * 0.55]
  const p1 = [ART.poolCx - ART.poolR * 0.1, ART.poolCy + ART.poolR * 0.75]
  const p2 = [ART.poolCx + ART.poolR * 0.9, ART.slideCy + 40]
  const p3 = [ART.slideCx + 140, ART.slideCy - 10]
  const u = 1 - t
  const b = (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  return [b(0), b(1)]
}

/**
 * Reveals `image` through a soft, fading pointer trail on `canvasRef`.
 * `hostRef` receives the pointer events; `getRect()` returns where the artwork sits,
 * in the canvas's containing block ({ x, y, w, h } in CSS px).
 * `nameRef` / `inkRef`: the hero name and a canvas inside it. Where the revealed blood sits under
 * the name, the letters are redrawn there in paper colour, so they read as cut out of the blood.
 */
export function useTrailMask({ hostRef, canvasRef, nameRef, inkRef, image, getRect, reduced, sweep, onSweepStart }) {
  const ctrl = useRef(null)
  const getRectRef = useRef(getRect)
  const onSweepStartRef = useRef(onSweepStart)
  useEffect(() => {
    getRectRef.current = getRect
    onSweepStartRef.current = onSweepStart
  })

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas || !image) return undefined

    const ctx = canvas.getContext('2d')
    const trail = document.createElement('canvas')
    const tctx = trail.getContext('2d')
    const brush = makeBrush()
    const name = nameRef?.current
    const ink = reduced ? null : inkRef?.current
    const ictx = ink?.getContext('2d')
    let letters = null // the name in paper colour, pre-drawn at ink size
    const mask = ink ? document.createElement('canvas') : null // letter mask, at trail resolution
    const mctx = mask?.getContext('2d')
    let artLow = null // the artwork's alpha at trail resolution
    let inkPad = 0
    let dprNow = 1
    let art = null
    let rect = null
    let base = BRUSH_RADIUS
    let box = null // cached on-screen box of the canvas, refreshed every frame
    let raf = 0
    let running = false
    let lastFrame = 0
    let decayAcc = 0
    let lastStampAt = -Infinity
    let inView = true
    let pageVisible = !document.hidden
    let sweepPending = false
    let sweepStart = 0
    let sweepTimer = 0
    let disposed = false
    const pointer = { last: null }
    const sweeper = { last: null }

    function setRunning(v) {
      running = v
      canvas.dataset.running = v ? 'true' : 'false'
    }

    let sizeKey = ''
    let artToken = 0

    function drawStatic() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!art) return
      ctx.globalAlpha = STATIC_OPACITY
      ctx.drawImage(art, 0, 0)
      ctx.globalAlpha = 1
    }

    // Scale the artwork once per size, off the main thread where supported, so each frame is a 1:1 copy.
    function scaleArt(w, h) {
      const token = ++artToken
      const fallback = () => {
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const a = c.getContext('2d')
        a.imageSmoothingQuality = 'high'
        a.drawImage(image, 0, 0, w, h)
        return c
      }
      const made =
        typeof createImageBitmap === 'function'
          ? createImageBitmap(image, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' }).catch(fallback)
          : Promise.resolve(fallback())
      made.then((bmp) => {
        if (token !== artToken || disposed) {
          bmp.close?.()
          return
        }
        art?.close?.()
        art = bmp
        if (mask) {
          artLow = document.createElement('canvas')
          artLow.width = trail.width
          artLow.height = trail.height
          artLow.getContext('2d').drawImage(bmp, 0, 0, trail.width, trail.height)
        }
        if (reduced) drawStatic()
      })
    }

    function layout() {
      const r = getRectRef.current()
      if (!r || r.w <= 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const key = [r.x, r.y, r.w, r.h, dpr].map((v) => v.toFixed(1)).join()
      if (key === sizeKey) return
      sizeKey = key
      rect = r
      canvas.style.left = `${r.x}px`
      canvas.style.top = `${r.y}px`
      canvas.style.width = `${r.w}px`
      canvas.style.height = `${r.h}px`
      canvas.width = Math.round(r.w * dpr)
      canvas.height = Math.round(r.h * dpr)
      trail.width = Math.ceil(r.w * TRAIL_SCALE)
      trail.height = Math.ceil(r.h * TRAIL_SCALE)
      if (mask) {
        mask.width = trail.width
        mask.height = trail.height
      }
      base = clamp((BRUSH_RADIUS * host.clientWidth) / 1440, BRUSH_MIN, BRUSH_MAX)
      box = null
      dprNow = dpr
      if (!reduced) reset()
      scaleArt(canvas.width, canvas.height)
      drawLetters()
    }

    // Pre-draw the hero name in paper colour, glyph for glyph over the real text.
    function drawLetters() {
      if (!ink || !name) return
      const dpr = dprNow
      const cs = getComputedStyle(name)
      const size = parseFloat(cs.fontSize)
      inkPad = Math.ceil(size * 0.25)
      const w = name.offsetWidth + inkPad * 2
      const h = name.offsetHeight + inkPad * 2
      ink.style.left = `${-inkPad}px`
      ink.style.top = `${-inkPad}px`
      ink.style.width = `${w}px`
      ink.style.height = `${h}px`
      ink.width = Math.round(w * dpr)
      ink.height = Math.round(h * dpr)
      letters = document.createElement('canvas')
      letters.width = ink.width
      letters.height = ink.height
      const g = letters.getContext('2d')
      g.scale(dpr, dpr)
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
      g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim() || '#f0e6d0'
      g.textBaseline = 'alphabetic'
      // measure in layout space: the on-screen box divided by the current zoom (push-in scale)
      const nb = name.getBoundingClientRect()
      const zoom = nb.width / name.offsetWidth || 1
      const range = document.createRange()
      for (const span of name.children) {
        const node = span.firstChild
        if (!node || node.nodeType !== 3) continue
        range.selectNodeContents(node)
        const r = range.getBoundingClientRect()
        const text = cs.textTransform === 'uppercase' ? node.textContent.toUpperCase() : node.textContent
        const ascent = g.measureText(text).fontBoundingBoxAscent
        const x = (r.left - nb.left) / zoom + inkPad
        const y = (r.top - nb.top) / zoom + inkPad + ascent
        g.fillText(text, x, y)
      }
      ictx.clearRect(0, 0, ink.width, ink.height)
    }

    // Show the paper-coloured letters only where the revealed artwork is.
    function drawInk() {
      if (!ink || !letters || !name || !artLow) return
      // mask = trail boosted (so its soft edge is short) ∩ the artwork's own shape
      mctx.clearRect(0, 0, mask.width, mask.height)
      mctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < INK_GAIN; i++) mctx.drawImage(trail, 0, 0)
      mctx.globalCompositeOperation = 'destination-in'
      mctx.drawImage(artLow, 0, 0)
      mctx.globalCompositeOperation = 'source-over'

      ictx.clearRect(0, 0, ink.width, ink.height)
      ictx.drawImage(letters, 0, 0)
      // where the name sits relative to the artwork, including its parallax shift
      const m = new DOMMatrixReadOnly(getComputedStyle(name).transform === 'none' ? undefined : getComputedStyle(name).transform)
      const nx = name.offsetLeft + m.e - inkPad
      const ny = name.offsetTop + m.f - inkPad
      ictx.globalCompositeOperation = 'destination-in'
      ictx.drawImage(mask, (rect.x - nx) * dprNow, (rect.y - ny) * dprNow, canvas.width, canvas.height)
      // outside the artwork there is nothing to keep
      ictx.globalCompositeOperation = 'destination-out'
      ictx.fillStyle = '#000'
      const ax = (rect.x - nx) * dprNow
      const ay = (rect.y - ny) * dprNow
      ictx.fillRect(0, 0, ink.width, Math.max(0, ay))
      ictx.fillRect(0, ay + canvas.height, ink.width, ink.height)
      ictx.fillRect(0, 0, Math.max(0, ax), ink.height)
      ictx.fillRect(ax + canvas.width, 0, ink.width, ink.height)
      ictx.globalCompositeOperation = 'source-over'
    }

    function reset() {
      cancelAnimationFrame(raf)
      setRunning(false)
      tctx.clearRect(0, 0, trail.width, trail.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (ink) ictx.clearRect(0, 0, ink.width, ink.height)
      pointer.last = null
      sweeper.last = null
      lastStampAt = -Infinity
      sweepStart = 0
    }

    function start() {
      if (running || !inView || !pageVisible) return
      setRunning(true)
      lastFrame = performance.now()
      decayAcc = 0
      raf = requestAnimationFrame(frame)
    }

    function stamp(x, y, r) {
      const rr = r * jitter()
      tctx.globalAlpha = Math.min(1, STAMP_ALPHA * jitter())
      tctx.drawImage(brush, (x - rr) * TRAIL_SCALE, (y - rr) * TRAIL_SCALE, rr * 2 * TRAIL_SCALE, rr * 2 * TRAIL_SCALE)
      lastStampAt = performance.now()
    }

    // Lay stamps from the stroke's previous point to (x, y), with no gaps.
    function strokeTo(stroke, x, y, t) {
      const prev = stroke.last
      stroke.last = { x, y, t }
      const pad = BRUSH_MAX * 1.5
      const near = (px, py) => px > -pad && py > -pad && px < rect.w + pad && py < rect.h + pad
      if (!prev) {
        if (near(x, y)) stamp(x, y, base)
        return
      }
      if (!near(x, y) && !near(prev.x, prev.y)) return
      const dx = x - prev.x
      const dy = y - prev.y
      const dist = Math.hypot(dx, dy)
      const speed = dist / Math.max(t - prev.t, 1) // px per ms
      const r = base * (1 + Math.min(speed * 0.12, SPEED_BOOST))
      const n = Math.max(1, Math.ceil(dist / (r * SPACING)))
      for (let i = 1; i <= n; i++) stamp(prev.x + (dx * i) / n, prev.y + (dy * i) / n, r)
    }

    function frame(now) {
      box = null
      const dt = Math.min(now - lastFrame, 100)
      lastFrame = now

      if (sweepStart) {
        const t = Math.min(1, (now - sweepStart) / SWEEP_MS)
        const [ax, ay] = sweepPoint(easeInOut(t))
        strokeTo(sweeper, (ax / ART.width) * rect.w, (ay / ART.height) * rect.h, now)
        if (t >= 1) {
          sweepStart = 0
          sweeper.last = null
        }
      }

      decayAcc += dt
      const fade = 1 - Math.exp(-decayAcc / TAU)
      if (fade >= MIN_DECAY_STEP) {
        tctx.globalCompositeOperation = 'destination-out'
        tctx.globalAlpha = fade
        tctx.fillRect(0, 0, trail.width, trail.height)
        tctx.globalCompositeOperation = 'source-over'
        decayAcc = 0
      }

      if (!sweepStart && now - lastStampAt > FADE_MS) {
        // trail is empty: clear and stop until the pointer moves again
        reset()
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!art) {
        raf = requestAnimationFrame(frame)
        return
      }
      ctx.globalAlpha = 1
      ctx.drawImage(art, 0, 0)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.globalAlpha = MAX_OPACITY
      ctx.drawImage(trail, 0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      drawInk()

      raf = requestAnimationFrame(frame)
    }

    function toLocal(e) {
      if (!box) box = canvas.getBoundingClientRect()
      return [((e.clientX - box.left) * rect.w) / box.width, ((e.clientY - box.top) * rect.h) / box.height]
    }

    function onMove(e) {
      if (!rect || !inView) return
      const [x, y] = toLocal(e)
      strokeTo(pointer, x, y, e.timeStamp)
      if (lastStampAt > -Infinity) start()
    }
    function onDown(e) {
      if (e.pointerType !== 'mouse') pointer.last = null
    }
    function onEnd() {
      pointer.last = null
    }

    function maybeSweep() {
      if (!sweepPending || !rect || !inView || !pageVisible) return
      sweepPending = false
      onSweepStartRef.current?.()
      sweepStart = performance.now()
      sweeper.last = null
      lastStampAt = sweepStart
      start()
    }

    const ro = new ResizeObserver(() => layout()) // fires once on observe, too
    ro.observe(host)
    document.fonts?.ready.then(() => layout())

    if (reduced) {
      ctrl.current = null
      return () => {
        disposed = true
        ro.disconnect()
        art?.close?.()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (!inView) reset()
      else maybeSweep()
    })
    io.observe(host)

    function onVisibility() {
      pageVisible = !document.hidden
      if (!pageVisible) reset()
      else maybeSweep()
    }
    function onScroll() {
      box = null
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerdown', onDown, { passive: true })
    host.addEventListener('pointerleave', onEnd, { passive: true })
    host.addEventListener('pointerup', onEnd, { passive: true })
    host.addEventListener('pointercancel', onEnd, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', onScroll, { passive: true })

    ctrl.current = {
      sweep(delay = 450) {
        clearTimeout(sweepTimer)
        sweepTimer = setTimeout(() => {
          sweepPending = true
          maybeSweep()
        }, delay)
      },
    }

    return () => {
      ctrl.current = null
      disposed = true
      clearTimeout(sweepTimer)
      reset()
      art?.close?.()
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerleave', onEnd)
      host.removeEventListener('pointerup', onEnd)
      host.removeEventListener('pointercancel', onEnd)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
    }
  }, [hostRef, canvasRef, nameRef, inkRef, image, reduced])

  useEffect(() => {
    if (sweep && image && !reduced) ctrl.current?.sweep()
  }, [sweep, image, reduced])
}
