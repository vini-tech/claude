#!/usr/bin/env python3
"""Draws the item textures of Create: Synthesis (16x16, in the style of Create and vanilla).

Run from the create-addon folder:  python tools/textures.py [--preview out.png]
Writes src/main/resources/assets/create_synthesis/textures/item/<name>.png.

How a texture is made:
1. a hand-drawn silhouette (a grid of '#');
2. volume shading computed from the silhouette: light from the top-left, like every Create item;
   only the bottom/right border gets the darkest tone (the shadow side), the lit border stays light;
3. hand-placed details (stitches, grooves, specks), recolored by the shade of the pixel under them.

Each material has a ramp of tones, darkest first. Outlines are the darkest tone of the material, never black.
"""
import math
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/main/resources/assets/create_synthesis/textures/item"
N = 16
NEIGHBORS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def ramp(*colors):
    return [rgb(c) for c in colors]


# ---------------------------------------------------------------- palettes (darkest first)

STRAW = ramp("#5a2f12", "#7d4a17", "#a0681e", "#c08a2b", "#dcaf45", "#f0d06c", "#fff0b0")
HUSK = ramp("#3f4a12", "#556318", "#6b7d21", "#83962c", "#9aae3a", "#b2c452", "#c8d873")
FEED = ramp("#4a1f14", "#6e3420", "#94512c", "#b5703a", "#d0904c", "#e6b46a", "#f8dc9c")
FISH = ramp("#4a1810", "#74261a", "#9e3a22", "#c4532b", "#df7337", "#ef9a4f", "#f8c07a")
FLAKE_GREEN = ramp("#22401a", "#2f5a22", "#3f742b", "#548f36", "#6caa42", "#88c254", "#a8d873")
FLAKE_YELLOW = ramp("#5a4210", "#7d5d17", "#a17b20", "#c49a2c", "#dcb43e", "#ecce5e", "#f7e494")
STONE = ramp("#35322d", "#4f4b44", "#69645b", "#837d72", "#9d978b", "#b6b0a4", "#cdc8bd")
BONE = ramp("#5e4234", "#8a6c56", "#ad9478", "#c9b694", "#ddd0b0", "#eee6cf", "#fffbee")
LEATHER = ramp("#4a1612", "#6e2416", "#93361c", "#b44f27", "#cf6d36", "#e5904f", "#f8bb7c")
TANNED = ramp("#3a1210", "#561c12", "#742916", "#933b1d", "#ad5228", "#c66e38", "#de9254")
WET = ramp("#1c0c05", "#2e150a", "#422011", "#562c18", "#6b3a21", "#7f4b2d", "#94603d")
WATER = ramp("#1d3a52", "#2a5272", "#3b6d92", "#5289b0", "#70a5c9", "#95c3df", "#c6e3f3")
HOLLOW = ramp("#2a3638", "#3f5053", "#58696b", "#728383", "#8c9d9b", "#a8b8b5", "#c7d5d1")
IRON = ramp("#2a2e33", "#454b52", "#646b73", "#868d95", "#a8aeb5", "#c9ced3", "#eceff1")
NACRE = ramp("#5c5468", "#7d7489", "#9d95a9", "#bbb4c6", "#d4cedd", "#e8e4ef", "#fbf9ff")
PINK = ramp("#6e4c5c", "#8e6074", "#b07a91", "#cf98ad", "#e5b5c8", "#f2cfdc", "#fbe8f0")
CYAN = ramp("#40626a", "#527c85", "#6a99a1", "#86b5bb", "#a3cdd1", "#c2e2e3", "#e2f4f3")
GOLD = ramp("#62301a", "#8e4f1c", "#b77322", "#d9a12e", "#f0c844", "#fbe372", "#fff8c4")
CLAY = ramp("#3d4350", "#555d6c", "#6f7889", "#8a93a4", "#a3acbb", "#bcc3cf", "#d3d8e1")
DISC = ramp("#0d0d10", "#17171b", "#212126", "#2b2b31", "#36363d", "#43434b", "#55555e")
GLOSS = ramp("#0b0b10", "#15151c", "#1f1f29", "#2a2a36", "#373745", "#4b4b5c", "#9a9ab4")
TERRACOTTA = ramp("#561c16", "#76301e", "#984426", "#b55a2f", "#cc753f", "#e09456", "#f2b97c")
SOIL = ramp("#1e130a", "#2f1e11", "#412a18", "#54371f", "#674628", "#7b5734", "#906a42")
MOSS = ramp("#26340f", "#3a4d16", "#4e661d", "#638026", "#789932", "#8fb043", "#a8c75c")
SEED = ramp("#5a3a10", "#7d541a", "#a17226", "#c49236", "#dcae4c", "#ecc86c", "#f7e29c")
STEEL = ramp("#1f2329", "#353b44", "#4d5560", "#67717d", "#848e99", "#a5aeb7", "#c9d0d6")
GEM = ramp("#0f4a48", "#16706c", "#1f938d", "#2bb5ad", "#4ad1c8", "#7de8df", "#c8fbf6")
STRING = ramp("#5e5648", "#857b69", "#a89e8a", "#c4bba6", "#dad2be", "#ebe5d4", "#f8f5ec")


# ---------------------------------------------------------------- canvas

class Tex:
    def __init__(self):
        self.color = {}
        self.shade = {}  # pixel -> tone index, so details can be recolored by the light they receive

    def put(self, p, ramp_, idx):
        idx = max(0, min(len(ramp_) - 1, idx))
        self.color[p] = ramp_[idx]
        self.shade[p] = idx

    def paint(self, m, ramp_, shades):
        for p in m:
            self.put(p, ramp_, shades[p])

    def recolor(self, pixels, ramp_, offset=0):
        """Paint pixels with another material, keeping the light they already receive."""
        for p in pixels:
            if p in self.shade:
                self.put(p, ramp_, self.shade[p] + offset)

    def erase(self, pixels):
        for p in pixels:
            self.color.pop(p, None)
            self.shade.pop(p, None)

    def grid(self, rows, palette, ox=0, oy=0):
        """palette: char -> (ramp, index)."""
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch in palette:
                    self.put((ox + x, oy + y), *palette[ch])

    def image(self):
        im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
        for (x, y), c in self.color.items():
            if 0 <= x < N and 0 <= y < N:
                im.putpixel((x, y), c)
        return im


def mask(rows, ox=0, oy=0, ch="#"):
    return {(ox + x, oy + y) for y, row in enumerate(rows) for x, c in enumerate(row) if c == ch}


def volume(m, levels=7, light=(-0.6, -0.75, 0.55), roundness=1.0, cap=4, top_bias=0.12, lift=0.0):
    """Tone index per pixel, as if the silhouette were a rounded object lit from the top-left."""
    dist = {}
    queue = deque()
    for p in m:
        if any((p[0] + dx, p[1] + dy) not in m for dx, dy in NEIGHBORS):
            dist[p] = 1
            queue.append(p)
    while queue:
        p = queue.popleft()
        for dx, dy in NEIGHBORS:
            q = (p[0] + dx, p[1] + dy)
            if q in m and q not in dist:
                dist[q] = dist[p] + 1
                queue.append(q)
    h = {p: min(d, cap) ** 0.75 for p, d in dist.items()}
    lx, ly, lz = light
    ln = math.sqrt(lx * lx + ly * ly + lz * lz)
    lx, ly, lz = lx / ln, ly / ln, lz / ln
    ys = [p[1] for p in m]
    y0, y1 = min(ys), max(ys)
    light_of = {}
    for (x, y) in m:
        gx = (h.get((x + 1, y), 0) - h.get((x - 1, y), 0)) / 2 * roundness
        gy = (h.get((x, y + 1), 0) - h.get((x, y - 1), 0)) / 2 * roundness
        nx, ny, nz = -gx, -gy, 1.0
        nn = math.sqrt(nx * nx + ny * ny + nz * nz)
        s = (nx * lx + ny * ly + nz * lz) / nn
        light_of[(x, y)] = s - top_bias * ((y - y0) / max(1, y1 - y0) - 0.5) + lift
    # hand out the tones by proportion, brightest first: a few highlights, mostly mid tones
    order = sorted(light_of, key=lambda p: (-light_of[p], p[1], p[0]))
    shares = [(levels - 1, 0.07), (levels - 2, 0.18), (levels - 3, 0.28), (levels - 4, 0.27), (levels - 5, 0.20)]
    out = {}
    i = 0
    for idx, share in shares:
        n = round(share * len(order))
        for p in order[i:i + n]:
            out[p] = idx
        i += n
    for p in order[i:]:
        out[p] = levels - 5
    for (x, y) in m:
        if (x + 1, y) not in m or (x, y + 1) not in m:
            out[(x, y)] = 0 if out[(x, y)] <= 3 else 1  # shadow side border
    return out


def flat(m, levels=7, base=4, spread=2):
    """A flat sheet lit from the top-left: lit rim on top/left, shadow rim on bottom/right."""
    xs = [p[0] for p in m]
    ys = [p[1] for p in m]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    out = {}
    for (x, y) in m:
        t = ((x - x0) / max(1, x1 - x0) + (y - y0) / max(1, y1 - y0)) / 2  # 0 top-left .. 1 bottom-right
        idx = base + (1 if t < 0.35 else (-1 if t > 0.7 else 0))
        if (x - 1, y) not in m or (x, y - 1) not in m:
            idx = base + spread
        if (x + 1, y) not in m or (x, y + 1) not in m:
            idx = 1
        out[(x, y)] = max(0, min(levels - 1, idx))
    return out


def solid(t, m, ramp_, **kw):
    t.paint(m, ramp_, volume(m, len(ramp_), **kw))


def slab(t, top, ramp_, thickness=1, base=4, spread=2):
    """A flat object with a visible edge below its top face."""
    side = {(x, y + d) for (x, y) in top for d in range(1, thickness + 1)} - top
    t.paint(top, ramp_, flat(top, base=base, spread=spread))
    # the edge: lighter just under the top face, darkest at the bottom
    t.paint(side, ramp_, {p: (0 if (p[0], p[1] + 1) not in side else (2 if (p[0], p[1] - 1) in top else 1))
                          for p in side})


# ---------------------------------------------------------------- the items

TEXTURES = {}


def texture(fn):
    TEXTURES[fn.__name__] = fn
    return fn


HEAP = [
    "................",
    "................",
    "................",
    "................",
    "......####......",
    "....########....",
    "...##########...",
    "..############..",
    "..############..",
    ".##############.",
    ".##############.",
    ".##############.",
    "..############..",
    "...##########...",
    "................",
    "................",
]


@texture
def fodder():
    """Chopped seeds and husks: a loose golden heap with bits of straw."""
    t = Tex()
    heap = mask(HEAP) | {(7, 3), (8, 2), (12, 5), (13, 4), (3, 6), (2, 5)}  # stalks poking out
    solid(t, heap, STRAW, lift=0.05)
    # short chopped stalks lying on the heap: a lit pixel with its shadow below
    for x, y in ((5, 6), (6, 5), (9, 7), (10, 6), (4, 9), (5, 8), (11, 10), (12, 9), (7, 10), (8, 9), (9, 12), (10, 11)):
        t.put((x, y), STRAW, 6)
        if (x, y + 1) in t.shade and t.shade[(x, y + 1)] > 1:
            t.put((x, y + 1), STRAW, 2)
    t.recolor({(7, 7), (3, 10), (12, 7), (6, 12)}, HUSK)
    t.put((7, 3), STRAW, 5)
    t.put((8, 2), STRAW, 6)
    t.put((13, 4), STRAW, 5)
    t.put((2, 5), STRAW, 5)
    return t


@texture
def animal_feed():
    """A burlap sack of feed, tied at the neck, with pellets showing at the open top."""
    t = Tex()
    sack = mask([
        "................",
        "................",
        "................",
        "................",
        "......####......",
        ".....######.....",
        "....########....",
        "...##########...",
        "..############..",
        "..############..",
        "..############..",
        "..############..",
        "..############..",
        "...##########...",
        "................",
        "................",
    ])
    solid(t, sack, BURLAP, roundness=1.1)
    # the weave: every other pixel a shade darker, only where the cloth is lit
    for (x, y) in sack:
        if (x + y) % 2 == 0 and 2 <= t.shade[(x, y)] <= 5:
            t.put((x, y), BURLAP, t.shade[(x, y)] - 1)
    for x, idx in ((5, 5), (6, 4), (7, 4), (8, 3), (9, 3), (10, 2)):  # string tied around the neck
        t.put((x, 5), STRING, idx)
    # pellets heaped at the open top
    t.grid([
        "..ab.ab..",
        ".abcabcab",
        "abcbcbcbc",
    ], {"a": (FEED, 6), "b": (FEED, 4), "c": (FEED, 1)}, 4, 2)
    # a stencilled brass tag, the Create touch
    t.grid(["ab", "bc"], {"a": (BRASS, 6), "b": (BRASS, 4), "c": (BRASS, 1)}, 10, 9)
    return t


@texture
def fish_feed():
    """A copper tin of fish food, banded like Create's copper gear, colorful flakes on the open top."""
    t = Tex()
    body = mask([
        "................",
        "................",
        "................",
        "................",
        "....########....",
        "...##########...",
        "...##########...",
        "...##########...",
        "...##########...",
        "...##########...",
        "...##########...",
        "...##########...",
        "...##########...",
        "....########....",
        "................",
        "................",
    ])
    # a cylinder lit from the left: tone by column
    columns = {3: 4, 4: 6, 5: 5, 6: 5, 7: 4, 8: 4, 9: 3, 10: 3, 11: 2, 12: 1}
    for (x, y) in body:
        t.put((x, y), COPPER, columns.get(x, 3))
    for (x, y) in body:
        if y == 13 or (x, y + 1) not in body:
            t.put((x, y), COPPER, 0)
    for y in (6, 12):  # andesite bands
        for x in range(3, 13):
            t.put((x, y), CASING, {3: 5, 4: 6, 5: 6, 11: 2, 12: 1}.get(x, 4))
    # paper label with a little fish
    t.grid([
        "wwwww",
        "wbbww",
        "wwwww",
    ], {"w": (STRING, 5), "b": (WATER, 3)}, 5, 8)
    t.put((7, 9), WATER, 5)
    # the open top: rim and the flakes inside
    t.grid([
        ".aaaaaaaa.",
        "agyrgoyrga",
        ".bbbbbbbb.",
    ], {"a": (CASING, 6), "b": (CASING, 2), "g": (FLAKE_GREEN, 4), "y": (FLAKE_YELLOW, 5),
        "r": (FISH, 3), "o": (FISH, 5)}, 3, 3)
    return t


@texture
def fossil_fragment():
    """A lump of sediment rock with a fossilised bone set into it."""
    t = Tex()
    rock = mask([
        "................",
        "................",
        "................",
        ".....####.......",
        "...#########....",
        "..############..",
        "..#############.",
        ".##############.",
        ".##############.",
        ".#############..",
        "..############..",
        "..###########...",
        "...########.....",
        "................",
        "................",
        "................",
    ])
    solid(t, rock, STONE)
    for p in ((6, 6), (7, 7), (11, 9), (12, 10), (4, 10), (5, 11)):  # cracks between the lumps
        t.put(p, STONE, 1)
    bone = mask([
        "##......",
        "###.....",
        ".###....",
        "..###...",
        "...###..",
        "....###.",
        ".....##.",
    ], 3, 4)
    t.recolor(bone, BONE, 1)  # raised a bit above the rock
    for p in ((3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9)):
        t.put(p, BONE, 6)
    for p in ((5, 7), (6, 8), (7, 9), (8, 10), (9, 10)):
        t.put(p, BONE, 2)
    return t


SHEET = [
    "................",
    "................",
    "................",
    "..##.......##...",
    "..####...####...",
    "...##########...",
    "...###########..",
    "..############..",
    "..############..",
    "..###########...",
    "...##########...",
    "...####...####..",
    "...##.......##..",
    "................",
    "................",
    "................",
]


def hide_sheet(t, ramp_):
    """A hide pressed flat: the four leg flaps pulled out to the corners."""
    m = mask(SHEET)
    slab(t, m, ramp_)
    return m


@texture
def stretched_hide():
    t = Tex()
    hide_sheet(t, LEATHER)
    for p in ((5, 6), (6, 7), (10, 6), (9, 7), (5, 10), (6, 9), (10, 10), (9, 9)):  # stretch marks
        t.put(p, LEATHER, 5)
    for p in ((7, 8), (8, 8)):
        t.put(p, LEATHER, 3)
    return t


@texture
def hollow_hide():
    """The stretched hide after haunting: pale, thin, torn through in places."""
    t = Tex()
    hide_sheet(t, HOLLOW)
    holes = [{(6, 7), (7, 7)}, {(10, 9), (10, 10)}]
    for hole in holes:
        t.erase(hole)
    every_hole = set().union(*holes)
    for (x, y) in every_hole:  # the torn rim catches the light on the far side
        for q, idx in (((x + 1, y), 6), ((x, y + 1), 6), ((x - 1, y), 1), ((x, y - 1), 1)):
            if q in t.shade and q not in every_hole:
                t.put(q, HOLLOW, idx)
    for p in ((4, 8), (5, 9), (9, 5), (11, 7), (12, 8)):  # veins, like a phantom's wing
        t.put(p, HOLLOW, 3)
    return t


PELT = [
    "................",
    "................",
    "...##......##...",
    "...###....###...",
    "....########....",
    "...##########...",
    "..############..",
    "..############..",
    "..############..",
    "..############..",
    "...##########...",
    "...####..####...",
    "...###....###...",
    "................",
    "................",
    "................",
]


@texture
def soaked_hide():
    """Leather soaked in tannin: dark, heavy, dripping."""
    t = Tex()
    solid(t, mask(PELT), WET, roundness=0.6)
    for p in ((5, 6), (6, 5), (9, 7), (4, 9), (10, 10)):  # wet sheen
        t.put(p, WATER, 5)
    for p in ((6, 6), (10, 7), (5, 9)):
        t.put(p, WATER, 3)
    for p in ((4, 13), (11, 13), (8, 11)):  # drops falling
        t.put(p, WATER, 4)
    t.put((4, 14), WATER, 2)
    return t


@texture
def tanned_leather():
    """A finished hide rolled up and tied with string."""
    t = Tex()
    roll = mask([
        "................",
        ".........####...",
        "........######..",
        ".......########.",
        "......#########.",
        ".....#########..",
        "....#########...",
        "...#########....",
        "..#########.....",
        ".#########......",
        ".########.......",
        ".#######........",
        ".######.........",
        "..####..........",
        "................",
        "................",
    ])
    solid(t, roll, TANNED, roundness=1.3)
    t.grid([  # the spiral at the open end
        ".23.",
        "2541",
        "3412",
        ".21.",
    ], {"1": (TANNED, 1), "2": (TANNED, 2), "3": (TANNED, 3), "4": (TANNED, 4), "5": (TANNED, 6)}, 1, 10)
    for p, idx in (((6, 5), 6), ((7, 6), 5), ((8, 7), 4), ((9, 8), 3), ((10, 9), 1)):
        if p in t.shade:  # string tied around the roll
            t.put(p, STRING, idx)
    return t


@texture
def saddle_frame():
    """The saddle before stitching: a leather seat on its tree, chains and iron stirrups hanging."""
    t = Tex()
    seat = mask([
        "................",
        "................",
        "..........###...",
        ".........#####..",
        "..##.....#####..",
        "..###...######..",
        "..############..",
        "...###########..",
        "...##########...",
        "....########....",
    ])
    solid(t, seat, TANNED, roundness=1.1)
    for x in range(4, 12):  # the iron tree under the seat
        t.put((x, 9), IRON, 2 if x < 8 else 1)
    t.grid([
        "ab....ab",
        "ba....ba",
        "ab....ab",
        "cdc..cdc",
        "beb..beb",
    ], {"a": (IRON, 5), "b": (IRON, 2), "c": (IRON, 4), "d": (IRON, 6), "e": (IRON, 1)}, 4, 10)
    return t


@texture
def horn_blank():
    """An uncarved horn: bone and calcite pressed into a rough curved blank."""
    t = Tex()
    horn = mask([
        "................",
        "...........##...",
        "...........###..",
        "............###.",
        "............###.",
        "...........####.",
        "..........#####.",
        ".........#####..",
        "........######..",
        ".......######...",
        ".....########...",
        "...#########....",
        "..#########.....",
        "..########......",
        "...#####........",
        "................",
    ])
    solid(t, horn, BONE, roundness=1.3)
    # growth ridges across the horn, following its curve
    for ridge in (((12, 4), (13, 4), (14, 4)), ((10, 7), (11, 7), (12, 7), (13, 6)),
                  ((7, 10), (8, 10), (9, 9), (10, 9)), ((4, 12), (5, 12), (6, 11), (7, 11))):
        for p in ridge:
            if p in t.shade and t.shade[p] > 1:
                t.put(p, BONE, t.shade[p] - 2)
    t.grid([".ab", "abc", "bc."], {"a": (BONE, 3), "b": (BONE, 1), "c": (BONE, 0)}, 2, 12)  # the hollow core
    return t


@texture
def nacre():
    """Mother of pearl: a smooth pearly plate with soft rainbow sheens."""
    t = Tex()
    plate = mask([
        "................",
        "................",
        "................",
        ".....#####......",
        "...########.....",
        "..##########....",
        "..###########...",
        ".#############..",
        ".##############.",
        ".##############.",
        "..#############.",
        "...###########..",
        ".....#######....",
        "................",
        "................",
        "................",
    ])
    solid(t, plate, NACRE, roundness=0.6, lift=0.1)
    # growth lines: arcs around the hinge at the bottom-left, with the rainbow sheen between them
    for (x, y) in sorted(plate):
        if t.shade[(x, y)] == 0:
            continue
        r = math.hypot(x - 2, y - 13)
        if 6.5 <= r < 7.5 or 10.5 <= r < 11.5:
            t.put((x, y), NACRE, t.shade[(x, y)] - 2)
        elif 7.5 <= r < 9:
            t.recolor({(x, y)}, PINK)
        elif 11.5 <= r < 13:
            t.recolor({(x, y)}, CYAN)
    for p in ((5, 5), (6, 4), (4, 6), (3, 7)):
        t.put(p, NACRE, 6)
    return t


@texture
def rough_bell():
    """A freshly cast bell, still matte and with bits of its clay mould stuck to it."""
    t = Tex()
    bell = mask([
        "................",
        ".......##.......",
        "......#..#......",
        "......####......",
        ".....######.....",
        "....########....",
        "....########....",
        "....########....",
        "....########....",
        "....########....",
        "...##########...",
        "..############..",
        ".##############.",
        ".##############.",
        "..############..",
        "................",
    ])
    solid(t, bell, GOLD, roundness=1.4, light=(-0.9, -0.3, 0.5), lift=-0.05)
    for x in range(2, 14):  # the lip of the bell
        t.put((x, 12), GOLD, 5 if x < 8 else 4)
        t.put((x, 13), GOLD, 2 if x < 9 else 1)
    t.recolor({(6, 6), (7, 6), (6, 7), (10, 9), (9, 10), (10, 10), (4, 11), (5, 11), (11, 12)}, CLAY)
    for p in ((7, 8), (8, 9), (6, 10)):  # casting seams
        t.put(p, GOLD, 2)
    return t


DISC_SHAPE = [
    "................",
    "................",
    "................",
    ".....######.....",
    "...##########...",
    "..############..",
    ".##############.",
    ".##############.",
    ".##############.",
    "..############..",
    "...##########...",
    ".....######.....",
    "................",
    "................",
    "................",
    "................",
]


def disc_base(t, ramp_):
    slab(t, mask(DISC_SHAPE), ramp_, base=3, spread=1)
    for p in ((7, 7), (8, 7)):  # spindle hole
        t.put(p, ramp_, 0)


@texture
def blank_disc():
    """Pressed but not yet smooth: matte, with a rough surface."""
    t = Tex()
    disc_base(t, DISC)
    for p in ((4, 6), (10, 5), (12, 8), (5, 9), (9, 10), (3, 8)):
        t.put(p, DISC, 5)
    for p in ((6, 5), (11, 7), (7, 9)):
        t.put(p, DISC, 1)
    return t


@texture
def polished_blank_disc():
    """Sanded smooth: fine grooves ready for engraving and a glossy shine."""
    t = Tex()
    disc_base(t, GLOSS)
    groove = mask([
        "....######....",
        "..##......##..",
        ".#..........#.",
        "..##......##..",
        "....######....",
    ], 1, 5)
    for p in groove:
        t.put(p, GLOSS, 1)
    for p, idx in (((4, 5), 6), ((5, 4), 6), ((6, 4), 5), ((3, 6), 5), ((11, 10), 5), ((12, 9), 4)):
        t.put(p, GLOSS, idx)
    return t


@texture
def clay_tablet():
    """A slab of clay flattened by the press."""
    t = Tex()
    top = mask([
        "................",
        "................",
        "................",
        "................",
        ".......###......",
        ".....#######....",
        "...###########..",
        ".##############.",
        "..############..",
        "....########....",
        "......####......",
        "................",
        "................",
        "................",
        "................",
        "................",
    ])
    slab(t, top, CLAY, thickness=2)
    for p in ((6, 7), (7, 7), (10, 8)):  # finger marks
        t.put(p, CLAY, 3)
    return t


@texture
def blank_sherd():
    """A fired, still undecorated piece of pottery."""
    t = Tex()
    m = mask([
        "................",
        "................",
        "...#########....",
        "...##########...",
        "...###########..",
        "..############..",
        "..#############.",
        "..#############.",
        "...############.",
        "...###########..",
        "....#########...",
        "....######......",
        ".....###........",
        "................",
        "................",
        "................",
    ])
    t.paint(m, TERRACOTTA, flat(m, base=4, spread=2))
    for x in range(3, 13):  # the thick rim of the pot along the top, and the groove under it
        if (x, 2) in m:
            t.put((x, 2), TERRACOTTA, 6 if x < 9 else 5)
        if (x, 3) in m:
            t.put((x, 3), TERRACOTTA, 2)
    for p in ((4, 6), (5, 7), (6, 8), (5, 5), (7, 9)):  # the curve of the wall catches the light
        t.put(p, TERRACOTTA, 5)
    for p in ((12, 8), (13, 7), (11, 10), (9, 11), (7, 12)):  # fresh broken edge
        t.put(p, TERRACOTTA, 1)
    return t


@texture
def ancient_soil():
    """Old, dark soil with moss on top and a forgotten seed in it."""
    t = Tex()
    m = mask([
        "................",
        "................",
        "................",
        "................",
        ".....#####......",
        "...#########....",
        "..###########...",
        ".#############..",
        ".##############.",
        ".##############.",
        "..#############.",
        "..############..",
        "...#########....",
        "................",
        "................",
        "................",
    ])
    solid(t, m, SOIL)
    t.recolor({(5, 4), (6, 4), (4, 5), (5, 5), (3, 6), (9, 5), (10, 5), (11, 6), (2, 8)}, MOSS)  # moss on top
    t.recolor({(7, 9), (12, 10), (5, 11)}, STONE, 1)  # pebbles
    t.grid(["ab", "bc"], {"a": (SEED, 6), "b": (SEED, 4), "c": (SEED, 2)}, 9, 9)
    return t


@texture
def blank_template():
    """A smithing template plate ready to be stamped, with the diamond that makes a copy."""
    t = Tex()
    t.grid([
        "................",
        ".00000000000000.",
        ".06666666666650.",
        ".06555555555430.",
        ".06522222222430.",
        ".06523333333430.",
        ".06523333333430.",
        ".06523333333430.",
        ".06523333333430.",
        ".06523333333430.",
        ".06523333333430.",
        ".06524444444430.",
        ".06444444444430.",
        ".03333333333330.",
        ".00000000000000.",
        "................",
    ], {str(i): (STEEL, i) for i in range(7)})
    for p in ((5, 5), (10, 5), (5, 10), (10, 10)):  # guide marks for the die
        t.put(p, STEEL, 4)
    t.grid([
        "..a..",
        ".abb.",
        "abbcc",
        ".ccd.",
        "..d..",
    ], {"a": (GEM, 6), "b": (GEM, 4), "c": (GEM, 2), "d": (GEM, 1)}, 5, 5)
    return t


# ---------------------------------------------------------------- press dies and deployer tips

BRASS = ramp("#602f24", "#76462d", "#995a3d", "#b57849", "#d3a155", "#fbcc68", "#ffeb94")
ANDESITE = ramp("#2b3635", "#374141", "#4a5451", "#5e6963", "#6d7d73", "#829789", "#a9afa1")
COPPER = ramp("#6d3421", "#8a4129", "#9c4529", "#c15a36", "#e77c56", "#fc9982", "#fbc3b6")
CASING = ramp("#404543", "#505351", "#60635f", "#686c68", "#828784", "#9aa49d", "#a8b3ab")
PLANKS = ramp("#3a2412", "#4a301a", "#553a1f", "#614b2e", "#70522e", "#7a5a34", "#886539")
BURLAP = ramp("#4e3424", "#6d4f36", "#8c6b48", "#a8875a", "#c2a26f", "#d8bd88", "#ead6a8")


def tool(t, segments):
    """A hand tool drawn along the diagonal, like vanilla tools: lit on the top-left, outlined all around.

    segments: list of (ramp, length, width) from the handle end (bottom-left) to the tip (top-right).
    """
    owner = {}
    k = 0
    for ramp_, length, width in segments:
        for _ in range(length):
            cx, cy = 2 + k, 13 - k
            for w in range(width):
                owner[(cx + w, cy)] = ramp_
                if w:
                    owner[(cx, cy - w)] = ramp_
            k += 1
    body = set(owner)
    for (x, y), ramp_ in owner.items():
        if (x - 1, y) not in body or (x, y - 1) not in body:
            t.put((x, y), ramp_, 5)
        elif (x + 1, y) not in body or (x, y + 1) not in body:
            t.put((x, y), ramp_, 2)
        else:
            t.put((x, y), ramp_, 4)
    for (x, y), ramp_ in owner.items():  # outline in the darkest tone of each part
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                q = (x + dx, y + dy)
                if q not in body and q not in t.shade:
                    t.put(q, ramp_, 0)
    return body


@texture
def carving_chisel():
    t = Tex()
    tool(t, [(ANDESITE, 5, 2), (BRASS, 1, 2), (IRON, 4, 2)])
    for p in ((12, 2), (13, 3)):  # the flat, sharpened edge
        t.put(p, IRON, 6)
    return t


@texture
def coral_graft():
    t = Tex()
    tool(t, [(BRASS, 5, 2), (IRON, 1, 2), (IRON, 3, 1)])
    t.grid(["ab", "b."], {"a": (IRON, 6), "b": (IRON, 3)}, 11, 2)  # the hooked tip that lifts the polyps
    t.put((11, 1), IRON, 0)
    t.put((10, 2), IRON, 0)
    return t


DIE_TOP = [
    "................",
    "................",
    "................",
    ".....######.....",
    "...##########...",
    "..############..",
    ".##############.",
    ".##############.",
    ".##############.",
    "..############..",
    "...##########...",
    ".....######.....",
    "................",
    "................",
    "................",
    "................",
]


def die_base():
    t = Tex()
    slab(t, mask(DIE_TOP), BRASS, thickness=2)
    for p in ((3, 5), (12, 5), (3, 10), (12, 10)):  # andesite bolts
        t.put(p, ANDESITE, 5)
        t.put((p[0] + 1, p[1] + 1), ANDESITE, 1)
    return t


@texture
def engraving_die():
    """A brass puck with a spiral groove and the diamond needle that cuts it."""
    t = die_base()
    ring = mask([
        "....######....",
        "..##......##..",
        "..##......##..",
        "....######....",
    ], 1, 5)
    for p in ring:
        t.put(p, BRASS, 2)
    t.grid(["ab", "bc"], {"a": (GEM, 6), "b": (GEM, 4), "c": (GEM, 2)}, 7, 6)
    return t


@texture
def sherd_stamp():
    """A brass stamp with the outline of a pot raised on its face and an iron knob to hold it."""
    t = die_base()
    pot = mask(["..#..", ".###.", ".###.", "..#.."], 3, 5)
    for p in pot:
        t.put(p, BRASS, 6)
    t.grid([".ab.", "abbc", ".cd."], {"a": (IRON, 6), "b": (IRON, 4), "c": (IRON, 2), "d": (IRON, 0)}, 8, 5)
    return t


@texture
def template_die():
    """A brass die with a template-shaped cavity lined with steel."""
    t = die_base()
    cavity = mask([
        "...####...",
        ".########.",
        "..######..",
    ], 3, 6)
    for (x, y) in cavity:
        t.put((x, y), STEEL, 1 if (x, y - 1) not in cavity else 3)
    for p in ((5, 7), (6, 7), (7, 6)):
        t.put(p, STEEL, 5)
    return t


# ---------------------------------------------------------------- fluids (animated strips of 16x16 frames)

FLUID_OUT = ROOT / "src/main/resources/assets/create_synthesis/textures/fluid"
ESSENCE = ramp("#2f6b12", "#4a8f1a", "#6db324", "#93d032", "#bfe84f", "#e2f77f", "#fbffc4")


def fluid_strip(ramp_, frames, flowing):
    """Glowing liquid with slow swirls; loops seamlessly over `frames` frames."""
    strip = Image.new("RGBA", (N, N * frames))
    for f in range(frames):
        a = 2 * math.pi * f / frames
        for y in range(N):
            for x in range(N):
                # tile-able waves: integer frequencies over 16 px, phase moving with the frame
                yy = y + (f * N / frames if flowing else 0)
                v = (math.sin(2 * math.pi * (x + 2 * yy) / N + a) +
                     math.sin(2 * math.pi * (2 * x - yy) / N - a) * 0.7 +
                     math.sin(2 * math.pi * (3 * x + yy) / N + 2 * a) * 0.4)
                idx = 2 + round((v + 2.1) / 4.2 * 3)
                strip.putpixel((x, f * N + y), ramp_[max(1, min(len(ramp_) - 1, idx))])
    return strip


FLUIDS = {
    "experience_essence_still": (ESSENCE, 32, False),
    "experience_essence_flow": (ESSENCE, 32, True),
}


BLOCK_OUT = ROOT / "src/main/resources/assets/create_synthesis/textures/block"


def feed_surface():
    """Animal Feed seen from above in the trough: pellets packed edge to edge, tiling seamlessly."""
    t = Tex()
    for (x, y) in [(x, y) for y in range(N) for x in range(N)]:
        t.put((x, y), FEED, 2)
    pellet = [[5, 4, None], [4, 3, 2], [None, 2, 1]]  # softer than the item: seen from a distance
    for row in range(0, N, 3):
        for col in range(0, N, 3):
            px = (col + (row // 3 % 2) * 1 + (row * 7 + col * 3) % 2) % N
            for dy, line in enumerate(pellet):
                for dx, idx in enumerate(line):
                    if idx is not None:
                        t.put(((px + dx) % N, (row + dy) % N), FEED, idx - (1 if (row + col) % 2 else 0))
    return t


def planks(t, x0, y0, x1, y1, ramp_=None, vertical=True):
    """Dark boards like the inside of Create's andesite casing: seams every 3-4 px, a lit edge per board."""
    ramp_ = ramp_ or PLANKS
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            u, v = (x - x0, y - y0) if vertical else (y - y0, x - x0)
            board = u // 4
            in_board = u % 4
            idx = (3, 5, 4, 3)[in_board] - (board % 2)
            if in_board == 3:
                idx = 1  # the seam
            if (v * 7 + board * 3) % 11 == 0 and in_board in (1, 2):
                idx -= 1  # grain
            t.put((x, y), ramp_, idx)


def frame(t, x0, y0, x1, y1, width=2):
    """Andesite frame, bevelled: lit on the top/left, dark on the bottom/right, like andesite casing."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if x0 + width <= x <= x1 - width and y0 + width <= y <= y1 - width:
                continue
            if y == y0 or x == x0:
                idx = 6
            elif y == y1 or x == x1:
                idx = 1
            elif y == y0 + 1 or x == x0 + 1:
                idx = 4
            else:
                idx = 2
            t.put((x, y), CASING, idx)


def trough_side():
    """Outside wall (top half of the texture is used: 16 x 8)."""
    t = Tex()
    for oy in (0, 8):
        planks(t, 2, oy + 2, 13, oy + 5)
        frame(t, 0, oy, 15, oy + 7)
        for x in (1, 14):  # bolts in the frame corners
            t.put((x, oy + 1), CASING, 0)
    return t


def trough_inner():
    t = Tex()
    planks(t, 0, 0, 15, 15, vertical=False)
    for (x, y), idx in list(t.shade.items()):
        t.put((x, y), PLANKS, idx - 1)  # in the shade of the walls
    return t


def trough_rim():
    t = Tex()
    for y in range(N):
        for x in range(N):
            t.put((x, y), CASING, 5 if y % 8 == 0 else (2 if y % 8 == 7 else 4))
    return t


def write_blocks():
    BLOCK_OUT.mkdir(parents=True, exist_ok=True)
    feed_surface().image().save(BLOCK_OUT / "feed_surface.png")
    trough_side().image().save(BLOCK_OUT / "feeding_trough_side.png")
    trough_inner().image().save(BLOCK_OUT / "feeding_trough_inner.png")
    trough_rim().image().save(BLOCK_OUT / "feeding_trough_rim.png")


def write_fluids():
    FLUID_OUT.mkdir(parents=True, exist_ok=True)
    for name, (ramp_, frames, flowing) in FLUIDS.items():
        fluid_strip(ramp_, frames, flowing).save(FLUID_OUT / f"{name}.png")
        (FLUID_OUT / f"{name}.png.mcmeta").write_text('{\n  "animation": {\n    "frametime": 2\n  }\n}\n')


# ---------------------------------------------------------------- main

def preview(images, path, scale=10, cols=6):
    rows = (len(images) + cols - 1) // cols
    cell = N * scale + 12
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (60, 60, 60, 255))
    for i, (_, im) in enumerate(images):
        sheet.alpha_composite(im.resize((N * scale, N * scale), Image.NEAREST),
                              ((i % cols) * cell + 6, (i // cols) * cell + 6))
    sheet.save(path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    images = []
    for name, fn in TEXTURES.items():
        im = fn().image()
        im.save(OUT / f"{name}.png")
        images.append((name, im))
    write_fluids()
    write_blocks()
    if "--preview" in sys.argv:
        preview(images, sys.argv[sys.argv.index("--preview") + 1])
    print(f"{len(images)} item textures, {len(FLUIDS)} fluid textures")


if __name__ == "__main__":
    main()
