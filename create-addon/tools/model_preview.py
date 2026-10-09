#!/usr/bin/env python3
"""Isometric preview of a block model JSON of this mod (only the faces seen from the south-east, above).

Run from the create-addon folder:  python tools/model_preview.py <block/name or item/name> <out.png> [scale]
Textures are read from src/main/resources (this mod) or from the Create jar in the Gradle cache.
"""
import glob
import io
import json
import os
import sys
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / "src/generated/resources/assets/create_synthesis/models"
TEX = ROOT / "src/main/resources/assets/create_synthesis/textures"
SCALE = int(sys.argv[3]) if len(sys.argv) > 3 else 16  # pixels per model unit in the preview


def load_texture(ref):
    ns, path = ref.split(":") if ":" in ref else ("minecraft", ref)
    if ns == "create_synthesis":
        return Image.open(TEX / f"{path}.png").convert("RGBA")
    jar = [p for p in glob.glob(os.path.expanduser(
        "~/.gradle/caches/modules-2/files-2.1/com.simibubi.create/create-fabric/*/*/*.jar")) if "sources" not in p][0]
    return Image.open(io.BytesIO(zipfile.ZipFile(jar).read(f"assets/{ns}/textures/{path}.png"))).convert("RGBA")


def project(x, y, z):
    """Model units -> preview pixels; camera looks from the south-east, from above."""
    return ((x - z) * SCALE * 0.866 + 400, (x + z) * SCALE * 0.5 - y * SCALE + 300)


def face_quad(frm, to, face):
    x0, y0, z0 = frm
    x1, y1, z1 = to
    if face == "up":
        return [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]
    if face == "south":
        return [(x0, y1, z1), (x1, y1, z1), (x1, y0, z1), (x0, y0, z1)]
    if face == "east":
        return [(x1, y1, z1), (x1, y1, z0), (x1, y0, z0), (x1, y0, z1)]
    raise ValueError(face)


def main():
    model = json.loads((GEN / f"{sys.argv[1]}.json").read_text())
    textures = {k: v for k, v in model["textures"].items()}
    canvas = Image.new("RGBA", (800, 600), (60, 60, 60, 255))
    shade = {"up": 1.0, "south": 0.8, "east": 0.6}
    faces = []
    for el in model["elements"]:
        for face in ("up", "south", "east"):
            if face in el["faces"]:
                quad = face_quad(el["from"], el["to"], face)
                depth = sum(p[0] + p[2] + p[1] for p in quad) / 4
                faces.append((depth, el, face, quad))
    for _, el, face, quad in sorted(faces, key=lambda f: f[0]):
        spec = el["faces"][face]
        ref = spec["texture"].lstrip("#")
        tex = load_texture(textures[ref]).crop((0, 0, 16, 16))
        u0, v0, u1, v1 = spec.get("uv", [0, 0, 16, 16])
        tile = tex.crop((int(u0), int(v0), max(int(u0) + 1, int(u1)), max(int(v0) + 1, int(v1))))
        p = [project(*q) for q in quad]
        w = max(1, round(abs(p[1][0] - p[0][0]) + abs(p[1][1] - p[0][1])))
        h = max(1, round(abs(p[3][0] - p[0][0]) + abs(p[3][1] - p[0][1])))
        tile = tile.resize((w * 4, h * 4), Image.NEAREST)
        # affine map from the quad back into the tile
        ax, ay = p[0]
        bx, by = p[1][0] - ax, p[1][1] - ay
        cx, cy = p[3][0] - ax, p[3][1] - ay
        det = bx * cy - by * cx
        if abs(det) < 1e-6:
            continue
        tw, th = tile.size
        a = cy / det * tw
        b = -cx / det * tw
        d = -by / det * th
        e = bx / det * th
        coeffs = (a, b, -(a * ax + b * ay), d, e, -(d * ax + e * ay))
        warped = tile.transform(canvas.size, Image.AFFINE, coeffs, Image.NEAREST)
        dark = Image.new("RGBA", canvas.size, (0, 0, 0, round(255 * (1 - shade[face]))))
        mask = warped.split()[3]
        canvas.paste(warped, (0, 0), mask)
        canvas.paste(dark, (0, 0), Image.eval(mask, lambda v: round(v * (1 - shade[face]))))
    canvas.save(sys.argv[2])


if __name__ == "__main__":
    main()
