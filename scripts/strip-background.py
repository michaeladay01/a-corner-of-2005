"""Strip a baked-in transparency checkerboard, whatever shades it uses."""
import sys
from collections import Counter, deque
from PIL import Image, ImageFilter


def strip(src, dest, max_size=512):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    px = im.load()

    # Learn the background shades from the border instead of assuming them:
    # the checkerboard is whatever neutral greys dominate the outer edge.
    edge = Counter()
    for x in range(w):
        for y in (0, 1, h - 2, h - 1):
            edge[px[x, y]] += 1
    for y in range(h):
        for x in (0, 1, w - 2, w - 1):
            edge[px[x, y]] += 1

    shades = []
    for (r, g, b), _ in edge.most_common(8):
        if max(r, g, b) - min(r, g, b) <= 6:
            v = (r + g + b) / 3
            if not any(abs(v - s) <= 6 for s in shades):
                shades.append(v)
        if len(shades) >= 3:
            break
    if not shades:
        raise SystemExit('no neutral background shades found on the border')

    def is_bg(p):
        r, g, b = p
        if max(r, g, b) - min(r, g, b) > 7:
            return False
        v = (r + g + b) / 3
        return any(abs(v - s) <= 7 for s in shades)

    keep = Image.new('L', (w, h), 255)
    kp = keep.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(px[x, y]):
            continue
        kp[x, y] = 0
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))

    # Grow the kept region, then soften only its outer edge, so the inside of
    # the icon stays fully opaque and does not look washed out.
    keep = keep.filter(ImageFilter.MaxFilter(3))
    soft = keep.filter(ImageFilter.GaussianBlur(0.7)).point(lambda v: min(255, int(v * 1.9)))

    out = im.convert('RGBA')
    out.putalpha(soft)
    out = out.crop(out.getbbox())
    out.thumbnail((max_size, max_size), Image.LANCZOS)
    out.save(dest)

    a = list(out.getchannel('A').getdata())
    p = out.load()
    cw, ch = out.size
    print(f'{dest}: {cw}x{ch}  shades={[round(s) for s in shades]}  '
          f'clear={sum(1 for v in a if v < 10)} partial={sum(1 for v in a if 10 <= v < 245)} '
          f'solid={sum(1 for v in a if v >= 245)}')
    print('  corners:', p[0, 0], p[cw - 1, 0], p[0, ch - 1], p[cw - 1, ch - 1])


def strip_flat(src, dest, max_size=512, spread=60):
    """For a logo on flat white whose letters have holes in them.

    An edge flood-fill would leave the counters of letters like o and g as
    white blobs, so every near-white pixel goes instead. Alpha comes from how
    far the pixel sits from white, and the colour is un-blended from the white
    it was composited over, which keeps the antialiased edges clean.
    """
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    px = im.load()
    out = Image.new('RGBA', (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            alpha = max(0, min(255, int((255 - min(r, g, b)) * 255 / spread)))
            if alpha == 0:
                continue
            if alpha >= 250:
                op[x, y] = (r, g, b, 255)
            else:
                f = alpha / 255
                op[x, y] = (
                    max(0, min(255, int((r - 255 * (1 - f)) / f))),
                    max(0, min(255, int((g - 255 * (1 - f)) / f))),
                    max(0, min(255, int((b - 255 * (1 - f)) / f))),
                    alpha,
                )
    out = out.crop(out.getbbox())
    out.thumbnail((max_size, max_size), Image.LANCZOS)
    out.save(dest)
    a = list(out.getchannel('A').getdata())
    print(f'{dest}: {out.size[0]}x{out.size[1]}  flat-white mode  '
          f'clear={sum(1 for v in a if v < 10)} partial={sum(1 for v in a if 10 <= v < 245)} '
          f'solid={sum(1 for v in a if v >= 245)}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--flat' in sys.argv:
        strip_flat(args[0], args[1])
    else:
        strip(args[0], args[1])
