#!/usr/bin/env python3
"""Draws the item textures of Create: Synthesis (16x16, Create-like style).

Run from the create-addon folder:  python tools/textures.py [--preview out.png]
Writes src/main/resources/assets/create_synthesis/textures/item/<name>.png.

Style rules (taken from Create's own items): objects seen slightly from above, light from the
top-left, a 5-tone ramp per material, outlines in the darkest tone of the material (never black).
"""
import colorsys
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/main/resources/assets/create_synthesis/textures/item"
N = 16


# ---------------------------------------------------------------- colors

def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def ramp(*colors):
    """5 tones, darkest first: outline, dark, mid, light, highlight."""
    return [hexrgb(c) + (255,) for c in colors]


def auto_ramp(base, hue_shift=0.03):
    """Ramp from one mid color: darker tones shift to warmer hue and more saturation, like Create."""
    r, g, b = [c / 255 for c in hexrgb(base)]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    tones = []
    for dv, ds, dh in ((-0.52, 0.18, hue_shift), (-0.28, 0.10, hue_shift / 2), (0, 0, 0),
                       (0.16, -0.10, -hue_shift / 2), (0.30, -0.22, -hue_shift)):
        rr, gg, bb = colorsys.hsv_to_rgb((h + dh) % 1, min(1, max(0, s + ds)), min(1, max(0, v + dv)))
        tones.append((round(rr * 255), round(gg * 255), round(bb * 255), 255))
    return tones


# ---------------------------------------------------------------- canvas

class Tex:
    def __init__(self):
        self.px = [[None] * N for _ in range(N)]

    def set(self, x, y, c):
        if 0 <= x < N and 0 <= y < N:
            self.px[y][x] = c

    def get(self, x, y):
        return self.px[y][x] if 0 <= x < N and 0 <= y < N else None

    def grid(self, rows, colors, ox=0, oy=0):
        """Paint a character grid; '.' or ' ' is skipped."""
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch not in ". " and ch in colors:
                    self.set(ox + x, oy + y, colors[ch])

    def image(self):
        im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
        for y in range(N):
            for x in range(N):
                if self.px[y][x]:
                    im.putpixel((x, y), self.px[y][x])
        return im


def mask_polygon(points):
    im = Image.new("1", (N, N), 0)
    ImageDraw.Draw(im).polygon(points, fill=1)
    return {(x, y) for y in range(N) for x in range(N) if im.getpixel((x, y))}


def mask_ellipse(box):
    im = Image.new("1", (N, N), 0)
    ImageDraw.Draw(im).ellipse(box, fill=1)
    return {(x, y) for y in range(N) for x in range(N) if im.getpixel((x, y))}


def shift(mask, dx, dy):
    return {(x + dx, y + dy) for x, y in mask}


def solid(tex, top, thickness, r, light_bias=0):
    """An object seen from above: `top` face plus `thickness` pixels of side below it.

    Outline in r[0], side in r[1], top shaded from r[4] (top-left rim) to r[2] (bottom-right).
    """
    side = set()
    for t in range(1, thickness + 1):
        side |= shift(top, 0, t)
    side -= top
    shape = top | side
    def inside(p, m):
        return p in m
    for (x, y) in shape:
        edge = any((x + dx, y + dy) not in shape for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if edge:
            tex.set(x, y, r[0])
        elif (x, y) in side:
            tex.set(x, y, r[1])
        else:
            up_left = (x - 1, y) not in top or (x, y - 1) not in top
            down_right = (x + 1, y) not in top or (x, y + 1) not in top
            if up_left:
                tex.set(x, y, r[4])
            elif down_right:
                tex.set(x, y, r[2])
            else:
                # soft diagonal gradient across the face
                xs = [p[0] for p in top]
                ys = [p[1] for p in top]
                t = ((x - min(xs)) / max(1, max(xs) - min(xs)) + (y - min(ys)) / max(1, max(ys) - min(ys))) / 2
                tex.set(x, y, r[3] if t + light_bias < 0.55 else r[2])
    return shape


def speckle(tex, region, colors, density, seed):
    rnd = random.Random(seed)
    for p in sorted(region):
        if rnd.random() < density:
            tex.set(*p, rnd.choice(colors))


def outline_mask(mask):
    return {(x, y) for (x, y) in mask
            if any((x + dx, y + dy) not in mask for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))}


# ---------------------------------------------------------------- shapes reused by several items

def pile(tex, r, seed, grains=None, density=0.0):
    """A heap of powder/grains, like Create's flours."""
    top = mask_ellipse((2, 5, 13, 13)) | mask_ellipse((4, 3, 11, 9))
    top = {p for p in top if p[1] <= 12}
    shape = solid(tex, top, 1, r)
    if grains:
        inner = shape - outline_mask(shape)
        speckle(tex, inner, grains, density, seed)
    return shape


PELT = [
    "................",
    "................",
    "....##.....##...",
    "....###...###...",
    ".....#######....",
    "....#########...",
    "....#########...",
    "...##########...",
    "...##########...",
    "...#########....",
    "....#######.....",
    "...###...###....",
    "...##.....##....",
    "................",
]


def pelt_top():
    """A hide lying flat, seen from above: rounded body, four short leg flaps, slightly skewed."""
    return {(x + (2 - y // 4), y) for y, row in enumerate(PELT) for x, ch in enumerate(row) if ch == "#"}


# ---------------------------------------------------------------- the items

TEXTURES = {}


def texture(fn):
    TEXTURES[fn.__name__] = fn
    return fn


@texture
def fodder():
    t = Tex()
    r = ramp("#4a3b12", "#8a7426", "#b9a03c", "#d8c35e", "#eadf8c")
    pile(t, r, 1, grains=[hexrgb("#7d8f2e") + (255,), hexrgb("#a5b54a") + (255,), hexrgb("#f2e7a8") + (255,)], density=0.35)
    return t


@texture
def animal_feed():
    t = Tex()
    r = ramp("#3d220f", "#6e3f1c", "#9a5f2c", "#bf8445", "#d9a868")
    shape = pile(t, r, 2)
    inner = shape - outline_mask(shape)
    # pellets: little 2x2 cylinders with a lit corner and a dark seam
    rnd = random.Random(7)
    for y in range(3, 13, 2):
        for x in range(2 + (y // 2) % 2, 14, 2):
            if {(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)} <= inner:
                tone = rnd.choice((3, 3, 2, 4))
                t.set(x, y, r[min(4, tone + 1)])
                t.set(x + 1, y, r[tone])
                t.set(x, y + 1, r[tone])
                t.set(x + 1, y + 1, r[1])
    return t


@texture
def fish_feed():
    t = Tex()
    r = ramp("#4a1f14", "#8c3a22", "#c45a33", "#e68350", "#f6b37c")
    shape = pile(t, r, 3)
    inner = shape - outline_mask(shape)
    flakes = [hexrgb(c) + (255,) for c in ("#6d9b3a", "#9ec45a", "#f2d36b", "#e8e0c4", "#b8432c")]
    speckle(t, inner, flakes, 0.45, 11)
    return t


@texture
def fossil_fragment():
    t = Tex()
    r = ramp("#3d3a35", "#635f57", "#878278", "#a39e93", "#bab5aa")
    top = mask_polygon([(2, 6), (6, 3), (12, 3), (14, 7), (12, 11), (5, 12), (2, 10)])
    solid(t, top, 2, r)
    bone = {"o": hexrgb("#6b5536") + (255,), "s": hexrgb("#d9c9a3") + (255,), "h": hexrgb("#f6eedb") + (255,)}
    t.grid([
        ".hh.....",
        "hssho...",
        ".shhho..",
        "..ohhso.",
        "...ohssh",
        "....ossh",
        ".....hh.",
    ], bone, 3, 3)
    speckle(t, {(3, 10), (11, 9), (9, 11), (12, 5), (6, 10)}, [r[1]], 1.0, 0)
    return t


@texture
def stretched_hide():
    t = Tex()
    r = ramp("#4a2410", "#7d3f1c", "#a85a2c", "#c77b45", "#de9c66")
    solid(t, pelt_top(), 1, r)
    return t


@texture
def hollow_hide():
    t = Tex()
    r = ramp("#2c3a3d", "#4f6669", "#7a9396", "#a1b8b8", "#c8dcda")
    shape = solid(t, pelt_top(), 1, r)
    # torn through: holes show what is behind, with a dark torn rim
    for hole in ({(6, 6), (7, 6), (7, 7)}, {(10, 8), (10, 9)}, {(8, 4)}):
        for (x, y) in hole:
            t.set(x, y, None)
            for dx, dy in ((1, 0), (0, 1)):
                if (x + dx, y + dy) in shape and (x + dx, y + dy) not in hole:
                    t.set(x + dx, y + dy, r[0])
    return t


@texture
def soaked_hide():
    t = Tex()
    r = ramp("#2a1408", "#4f2812", "#6b3a1c", "#86502a", "#9c6a40")
    shape = solid(t, pelt_top(), 1, r)
    water = [hexrgb("#6fa8d6") + (255,), hexrgb("#a9d4f0") + (255,)]
    for x, y in ((5, 7), (9, 5), (11, 8), (7, 10)):
        t.set(x, y, water[1])
        t.set(x, y + 1, water[0])
    return t


@texture
def tanned_leather():
    t = Tex()
    r = ramp("#3b1608", "#6e2c12", "#9a4520", "#bb6233", "#d6884f")
    # a rolled hide: a cylinder lying diagonally, the spiral end facing the viewer
    body = mask_polygon([(2, 9), (10, 3), (14, 7), (6, 13)])
    solid(t, body, 1, r)
    end = mask_ellipse((2, 8, 7, 13))
    for (x, y) in end:
        t.set(x, y, r[2])
    for (x, y) in outline_mask(end):
        t.set(x, y, r[0])
    t.grid([".44.", "4..3", "4.3.", ".3.."], {"4": r[4], "3": r[3]}, 3, 9)
    # stitched edge along the roll
    for x, y in ((8, 6), (10, 5), (12, 6)):
        t.set(x, y, hexrgb("#e9d9b4") + (255,))
    return t


@texture
def saddle_frame():
    t = Tex()
    leather = ramp("#3b1608", "#6e2c12", "#9a4520", "#bb6233", "#d6884f")
    iron = ramp("#3a3d42", "#6b7078", "#a2a8b0", "#c9cdd2", "#eef0f2")
    t.grid([
        "................",
        "................",
        "..........0000..",
        "...00....04430..",
        "..0430..0433310.",
        "..03330033333210",
        "..0233333333210.",
        "...022333332110.",
        "....0011222110..",
        "......000000....",
    ], {"0": leather[0], "1": leather[1], "2": leather[2], "3": leather[3], "4": leather[4]})
    # chains hanging from the seat, iron sheet stirrups at the ends
    t.grid([
        "a......a",
        "b......b",
        "a......b",
        "b......a",
        "aaa..aaa",
        "cdd..ddc",
    ], {"a": iron[1], "b": iron[3], "c": iron[0], "d": iron[2]}, 4, 9)
    return t


@texture
def horn_blank():
    t = Tex()
    r = ramp("#5c5547", "#958c78", "#c2b9a3", "#ddd5c1", "#f1ecdf")
    top = set()
    centers = []
    for i in range(41):
        k = i / 40
        # quadratic curve from the wide base (bottom-left) to the tip (top-right)
        x = (1 - k) ** 2 * 3.5 + 2 * (1 - k) * k * 12 + k * k * 12.5
        y = (1 - k) ** 2 * 11.5 + 2 * (1 - k) * k * 12 + k * k * 2.5
        rad = 2.6 * (1 - k) + 0.5
        centers.append((x, y))
        top |= mask_ellipse((x - rad, y - rad, x + rad, y + rad))
    shape = solid(t, top, 1, r)
    # rough growth rings: it is still an uncarved blank
    for k in (0.18, 0.36, 0.55):
        cx, cy = centers[int(k * 40)]
        for d in (-2, -1, 0, 1, 2):
            p = (round(cx + d * 0.6), round(cy - d * 0.8))
            if p in top and p not in outline_mask(shape):
                t.set(*p, r[1])
    return t


@texture
def nacre():
    t = Tex()
    r = ramp("#4f4a5c", "#8b8399", "#c4bccf", "#e2dcea", "#fbf8ff")
    top = mask_polygon([(3, 4), (9, 2), (14, 6), (12, 12), (5, 13), (2, 9)])
    shape = solid(t, top, 1, r)
    sheen = [hexrgb(c) + (255,) for c in ("#f4c6dc", "#bfe6ef", "#d9f2d0", "#fbf8ff")]
    inner = top - outline_mask(shape)
    for (x, y) in sorted(inner):
        d = x + y
        if d in (9, 10):
            t.set(x, y, sheen[0])
        elif d in (14, 15):
            t.set(x, y, sheen[1])
        elif d == 18:
            t.set(x, y, sheen[2])
    return t


@texture
def rough_bell():
    t = Tex()
    gold = ramp("#5e3b0c", "#a8701a", "#d6a02e", "#f0c84a", "#fbe58a")
    clay = ramp("#3f4652", "#6b7484", "#959eae", "#b4bcc9", "#cdd3dd")
    t.grid([
        "................",
        "................",
        "......0000......",
        ".....043320.....",
        ".....0433210....",
        "....04332210....",
        "....04332210....",
        "....04332210....",
        "...0433322110...",
        "...0433322110...",
        "..043333221110..",
        "..001111111100..",
        "...0000000000...",
        "................",
    ], {"0": gold[0], "1": gold[1], "2": gold[2], "3": gold[3], "4": gold[4]}, 0, 1)
    # bits of the clay mould still stuck to the casting, and no polish
    for x, y, c in ((6, 5, 2), (7, 5, 3), (9, 8, 1), (10, 9, 2), (5, 10, 3), (6, 11, 2), (11, 11, 1)):
        t.set(x, y, clay[c])
    return t


def disc(t, r):
    top = mask_ellipse((1, 3, 14, 12))
    shape = solid(t, top, 1, r)
    hole = {(7, 7), (8, 7)}
    for p in hole:
        t.set(*p, r[0])
    return top, shape


@texture
def blank_disc():
    t = Tex()
    r = ramp("#141416", "#262629", "#38383c", "#47474c", "#56565c")
    top, shape = disc(t, r)
    inner = top - outline_mask(shape)
    speckle(t, inner - {(7, 7), (8, 7)}, [r[1], r[3]], 0.25, 5)
    return t


@texture
def polished_blank_disc():
    t = Tex()
    r = ramp("#0e0e12", "#1d1d24", "#2c2c36", "#3e3e4a", "#6a6a7c")
    top, shape = disc(t, r)
    # grooves ready to be engraved, and a glossy reflection
    ring = mask_ellipse((3, 5, 12, 10)) - mask_ellipse((4, 6, 11, 9))
    for p in ring:
        if p in top:
            t.set(*p, r[1])
    for x, y in ((4, 5), (5, 4), (6, 4), (10, 9), (11, 8)):
        t.set(x, y, hexrgb("#a9a9c0") + (255,))
    t.set(5, 5, hexrgb("#dcdcef") + (255,))
    return t


@texture
def clay_tablet():
    t = Tex()
    r = ramp("#3f4652", "#6b7484", "#959eae", "#b4bcc9", "#cdd3dd")
    solid(t, mask_polygon([(1, 8), (8, 3), (15, 7), (8, 12)]), 2, r)
    return t


@texture
def blank_sherd():
    t = Tex()
    r = ramp("#4a1e10", "#8a3c20", "#b45a33", "#cf7a4c", "#e29c6e")
    top = mask_polygon([(2, 7), (7, 3), (13, 4), (14, 9), (9, 13), (4, 12)])
    shape = solid(t, top, 2, r)
    # a slightly curved surface, like a piece of a pot
    for x in range(4, 13):
        y = 6 + abs(x - 8) // 3
        if (x, y) in top and (x, y) not in outline_mask(shape):
            t.set(x, y, r[4])
    return t


@texture
def ancient_soil():
    t = Tex()
    r = ramp("#241509", "#45291a", "#5f3c26", "#7a5236", "#94694a")
    top = mask_polygon([(2, 7), (6, 3), (11, 3), (14, 7), (12, 12), (4, 12)])
    shape = solid(t, top, 1, r)
    inner = top - outline_mask(shape)
    moss = [hexrgb(c) + (255,) for c in ("#4f6b22", "#6e8d2e", "#8fae45")]
    speckle(t, inner, moss, 0.3, 21)
    # an old seed half buried
    t.grid(["ab", "bc"], {"a": hexrgb("#f0d78c") + (255,), "b": hexrgb("#c9a453") + (255,),
                          "c": hexrgb("#7a5b25") + (255,)}, 8, 7)
    return t


@texture
def blank_template():
    t = Tex()
    r = ramp("#2b2f36", "#4c535d", "#727b86", "#959ea8", "#bcc4cc")
    t.grid([
        "................",
        "..000000000000..",
        "..044444444430..",
        "..043333333320..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043222222120..",
        "..043111111120..",
        "..032222222210..",
        "..000000000000..",
        "................",
    ], {"0": r[0], "1": r[1], "2": r[2], "3": r[3], "4": r[4]})
    # the diamond set in the middle (copying a template costs diamonds)
    t.grid([".a.", "abc", ".c."], {"a": hexrgb("#a5f3eb") + (255,), "b": hexrgb("#4ad9d0") + (255,),
                                    "c": hexrgb("#1f8f8a") + (255,)}, 6, 6)
    return t


# ---------------------------------------------------------------- main

def preview(images, path, scale=10, cols=6):
    rows = (len(images) + cols - 1) // cols
    cell = N * scale + 12
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (60, 60, 60, 255))
    for i, (_, im) in enumerate(images):
        sheet.alpha_composite(im.resize((N * scale, N * scale), Image.NEAREST), ((i % cols) * cell + 6, (i // cols) * cell + 6))
    sheet.save(path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    images = []
    for name, fn in TEXTURES.items():
        im = fn().image()
        im.save(OUT / f"{name}.png")
        images.append((name, im))
    if "--preview" in sys.argv:
        preview(images, sys.argv[sys.argv.index("--preview") + 1])
    print(f"{len(images)} textures")


if __name__ == "__main__":
    main()
