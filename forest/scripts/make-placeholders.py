"""
Stand-in art so the film can be rendered before the real illustrations are in
place: one moody vertical gradient per shot, with grain, named exactly as the
shots expect. Overwrite them with the real images.
"""
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

W, H = 1080, 1920
rng = np.random.default_rng(1)
palettes = {
    '01-redwoods': ((28, 34, 22), (150, 92, 48)),
    '02-moonlit-deer': ((8, 12, 18), (40, 52, 66)),
    '03-summit-stars': ((12, 28, 52), (48, 50, 56)),
    '04-mist-walker': ((30, 58, 56), (10, 18, 20)),
    '05-rain-forest': ((10, 40, 28), (4, 14, 10)),
}
for name, (top, bottom) in palettes.items():
    yy = np.linspace(0, 1, H)[:, None, None]
    img = np.array(top)[None, None, :] * (1 - yy) + np.array(bottom)[None, None, :] * yy
    img = np.repeat(img, W, axis=1)
    img += gaussian_filter(rng.normal(0, 1, (H, W)), 30)[:, :, None] * 40
    img += rng.normal(0, 1, (H, W, 1)) * 6
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(f'public/art/{name}.jpg', quality=88)
    print('wrote', name)
