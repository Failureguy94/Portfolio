/**
 * Closed, smooth blob path through `radii.length` points around (cx, cy).
 * Every path with the same number of radii has the same command structure,
 * so SVG can morph between them.
 */
export function blobPath(radii, cx = 100, cy = 100, rot = 0) {
  const n = radii.length
  const pts = radii.map((r, i) => {
    const a = rot + (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
  const t = 0.2
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t]
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return `${d}Z`
}
