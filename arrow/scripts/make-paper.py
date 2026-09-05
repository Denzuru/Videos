"""
Generates the paper background as a PNG.

A sheet of slightly toothy drawing paper: a warm off-white base, fine grain,
a soft low-frequency mottle so it is not perfectly even, a scatter of darker
fibres, and a gentle vignette. Everything is procedural so the project has no
binary assets that cannot be regenerated.

    python3 scripts/make-paper.py public/paper.png
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

W, H = 1080, 1920
rng = np.random.default_rng(7)

base = np.full((H, W), 232.0)

# Fine tooth.
grain = rng.normal(0, 1, (H, W))
grain = gaussian_filter(grain, 0.6) * 6.5

# Low frequency mottle, two octaves.
mottle = gaussian_filter(rng.normal(0, 1, (H, W)), 40) * 240
mottle += gaussian_filter(rng.normal(0, 1, (H, W)), 12) * 60

# Fibres: short dark streaks, slightly blurred.
fibres = np.zeros((H, W))
for _ in range(2600):
    x, y = rng.integers(0, W), rng.integers(0, H)
    ang = rng.uniform(0, np.pi)
    length = rng.uniform(4, 22)
    n = int(length)
    xs = (x + np.cos(ang) * np.arange(n)).astype(int)
    ys = (y + np.sin(ang) * np.arange(n)).astype(int)
    ok = (xs >= 0) & (xs < W) & (ys >= 0) & (ys < H)
    fibres[ys[ok], xs[ok]] = rng.uniform(4, 14)
fibres = gaussian_filter(fibres, 0.8)

# Vignette.
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
vignette = np.clip(r - 0.55, 0, None) ** 2 * 34

img = base + grain + mottle - fibres - vignette
img = np.clip(img, 0, 255)

# Very slight warm tint so it reads as paper, not screen grey.
rgb = np.stack([img + 2, img + 1, img - 3], axis=-1)
rgb = np.clip(rgb, 0, 255).astype(np.uint8)
Image.fromarray(rgb, 'RGB').save(sys.argv[1] if len(sys.argv) > 1 else 'public/paper.png', optimize=True)
print('wrote', sys.argv[1] if len(sys.argv) > 1 else 'public/paper.png')
