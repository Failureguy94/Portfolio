"""Lift the blood pool out of the draft hero mock-up into a transparent PNG.

Usage: python3 scripts/extract-blood-pool.py <draft-hero.png> art/blood-pool.png
The draft is a 1900px-wide screenshot. The hero name, buttons and slide label are drawn over the
pool there; those pixels are masked out and filled from the surrounding blood (inpainting).
Long drips below the pool are cut off. Prints the crop's position in draft-screen pixels.
"""
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src, cv2.IMREAD_COLOR)  # BGR
H, W = img.shape[:2]
b, g, r = [img[:, :, i].astype(np.int32) for i in range(3)]

FRAME_TOP, FRAME_BOTTOM = 70, 721  # paper area of the hero in the draft
ZONE = (60, 66, 900, 712)  # x0, y0, x1, y1 around the pool (excludes drips and the slide's own drop)

hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
hue, sat, val = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
red = ((hue < 12) | (hue > 165)) & (sat > 70) & (val > 60)
pinkish = (r > 150) & (r > g + 25) & (b >= g - 4)  # pale gloss streaks on the blood
# pale gloss only counts in the top of the pool; lower down, pale-pink pixels are the anti-aliased
# edges of the name's letters and the tops of the drips
yy = np.arange(H)[:, None]
blood = red | (pinkish & (yy < 330))

zone = np.zeros((H, W), bool)
x0, y0, x1, y1 = ZONE
zone[y0:y1, x0:x1] = True
blood &= zone
# the slide label (and its red "OPEN TO INTERNSHIPS") is not blood
label = np.zeros((H, W), bool)
label[120:380, 722:900] = True
blood &= ~label

m = blood.astype(np.uint8) * 255
n, lab, stats, cents = cv2.connectedComponentsWithStats(m)
big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
pool = (lab == big).astype(np.uint8) * 255
# small droplets outside the pool stay as they are
drops = np.zeros_like(pool)
for i in range(1, n):
    if i != big and 12 < stats[i, cv2.CC_STAT_AREA] < 900:
        drops[lab == i] = 255

# Rebuild the outline in polar form from edge points that touch bare paper. Where the edge is
# hidden (nav bar, name, label) the radius is interpolated around the circle, then given a little
# organic wobble. Narrow drips disappear in the median filter.
M = cv2.moments(cv2.morphologyEx(pool, cv2.MORPH_CLOSE, np.ones((41, 41), np.uint8)))
cx, cy = M["m10"] / M["m00"], M["m01"] / M["m00"]
paper = (np.abs(r - 237) < 14) & (np.abs(g - 227) < 14) & (np.abs(b - 206) < 16)
paper_near = cv2.dilate(paper.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
cnts, _ = cv2.findContours(pool, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
pts = max(cnts, key=cv2.contourArea)[:, 0, :]
NAME_BAND = (330, 580)
BINS = 360
radius = np.full(BINS, np.nan)
for x, y in pts:
    if not paper_near[y, x] or y < FRAME_TOP + 6 or NAME_BAND[0] < y < NAME_BAND[1]:
        continue
    if 700 < x and y < 390:  # behind the slide label
        continue
    k = int((np.degrees(np.arctan2(y - cy, x - cx)) % 360) / (360 / BINS))
    d = np.hypot(x - cx, y - cy)
    radius[k] = d if np.isnan(radius[k]) else max(radius[k], d)
known = ~np.isnan(radius)
idx = np.arange(BINS)
radius = np.interp(idx, np.concatenate([idx[known] - BINS, idx[known], idx[known] + BINS]),
                   np.tile(radius[known], 3))
pad = np.concatenate([radius[-12:], radius, radius[:12]])
radius = np.array([np.median(pad[i:i + 25]) for i in range(BINS)])
pad = np.concatenate([radius[-10:], radius, radius[:10]])
radius = np.convolve(pad, np.exp(-np.linspace(-2, 2, 21) ** 2) / np.exp(-np.linspace(-2, 2, 21) ** 2).sum(), "valid")
rng = np.random.default_rng(7)
t = np.radians(idx * 360 / BINS)
radius += 6 * np.sin(5 * t + 1.3) + 4 * np.sin(9 * t + 0.4) + 2.5 * np.sin(17 * t + 2.0)
radius += np.convolve(rng.normal(0, 2.2, BINS + 4), np.ones(5) / 5, "valid")
poly = np.stack([cx + radius * np.cos(t), cy + radius * np.sin(t)], 1).astype(np.int32)
main = np.zeros_like(pool)
cv2.fillPoly(main, [poly], 255, lineType=cv2.LINE_AA)
shape = np.maximum(main, drops)
blood |= drops > 0
# pixels inside the pool that are not blood (letters, buttons, label edge) get inpainted
# everything that is not blood counts as unknown, so the fill only ever samples blood
clean_blood = cv2.erode(blood.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
holes = (~clean_blood).astype(np.uint8) * 255
filled = cv2.inpaint(img, holes, 15, cv2.INPAINT_TELEA)
# smooth the filled areas so they read as liquid, not smears
smooth = cv2.GaussianBlur(filled, (0, 0), 9)
hmask = cv2.GaussianBlur(holes, (0, 0), 4).astype(np.float32)[:, :, None] / 255
filled = (filled * (1 - hmask) + smooth * hmask).astype(np.uint8)
# keep the pool's dark rim where the edge was rebuilt
edge = cv2.GaussianBlur((shape > 0).astype(np.float32), (0, 0), 6)
rim = np.clip((1 - edge) * 2.2, 0, 1)[:, :, None] * (hmask > 0.5)
filled = (filled * (1 - 0.45 * rim)).astype(np.uint8)

alpha = cv2.GaussianBlur(shape, (0, 0), 1.1)
ys, xs = np.where(alpha > 0)
cy0, cy1, cx0, cx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
rgba = cv2.cvtColor(filled, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = alpha
cv2.imwrite(out, rgba[cy0:cy1, cx0:cx1], [cv2.IMWRITE_PNG_COMPRESSION, 9])
print(f"crop x={cx0} y={cy0} w={cx1 - cx0} h={cy1 - cy0}; pool centre ({cx:.0f}, {cy:.0f}), mean radius {radius.mean():.0f}; frame top {FRAME_TOP}")
