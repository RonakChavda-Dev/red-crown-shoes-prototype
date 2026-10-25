"""Final recolour masks for the Red Crown shoe, from mesh parts + texture colour.

Usage: build_masks.py <shoe.glb> <extracted-images-dir> <out-dir>
Writes zones-a.png (R upper, G accent, B laces), zones-b.png (R midsole, G outsole,
B lining), detail.jpg, normal.jpg, orm.jpg and zone-preview.png.
"""
import sys, json, struct
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

glb, src, out = sys.argv[1:4]
S = 2048

# ── mesh parts ─────────────────────────────────────────────────────────────
b = open(glb, "rb").read()
jlen = struct.unpack("<I", b[12:16])[0]
j = json.loads(b[20:20 + jlen])
bin_start = 20 + jlen + 8
prim = j["meshes"][0]["primitives"][0]

def acc(i):
    a = j["accessors"][i]
    bv = j["bufferViews"][a["bufferView"]]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3}[a["type"]]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a["componentType"]]
    arr = np.frombuffer(b, dt, a["count"] * n, bin_start + bv.get("byteOffset", 0) + a.get("byteOffset", 0))
    return arr.reshape(-1, n) if n > 1 else arr

pos = acc(prim["attributes"]["POSITION"])
uv = acc(prim["attributes"]["TEXCOORD_0"])
tri = acc(prim["indices"]).astype(np.int64).reshape(-1, 3)

_, weld = np.unique(np.round(pos * 1e4).astype(np.int64), axis=0, return_inverse=True)
weld = weld.ravel()
parent = np.arange(weld.max() + 1)
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
for t in tri:
    r = find(weld[t[0]])
    for k in t[1:]:
        parent[find(weld[k])] = r
roots = np.array([find(weld[t[0]]) for t in tri])

# Identify parts by size/position (stable for this asset).
parts = {}
for r in np.unique(roots):
    sel = tri[roots == r]
    v = pos[np.unique(sel)]
    parts[r] = {"tris": len(sel), "min": v.min(0), "max": v.max(0)}

def kind(p):
    n, lo, hi = p["tris"], p["min"], p["max"]
    if n > 2000 and hi[1] < -0.2:
        return "sole"
    if n > 4000:
        return "body"
    if n > 2500:
        return "tongue"
    if n > 1500:
        return "lining"
    width = hi[2] - lo[2]
    if n == 640:
        return "tape"
    if lo[0] < -0.6:
        return "body"  # heel pull loop / heel tab
    return "laces"  # lace segments and eyelets

part_kind = {r: kind(p) for r, p in parts.items()}
print({k: sum(1 for v in part_kind.values() if v == k) for k in set(part_kind.values())})

# Face normals decide outsole (ground-facing) vs midsole on the sole part.
a, b2, c = pos[tri[:, 0]], pos[tri[:, 1]], pos[tri[:, 2]]
fn = np.cross(b2 - a, c - a)
fn /= np.linalg.norm(fn, axis=1, keepdims=True) + 1e-9

CODES = {"auto": 1, "accent": 2, "laces": 3, "midsole": 4, "outsole": 5, "lining": 6}
img = Image.new("L", (S, S), 0)
draw = ImageDraw.Draw(img)
for i, t in enumerate(tri):
    k = part_kind[roots[i]]
    if k == "sole":
        code = CODES["outsole"] if fn[i][1] < -0.8 else CODES["midsole"]
    elif k == "tape":
        code = CODES["accent"]
    elif k == "laces":
        code = CODES["laces"]
    elif k == "lining":
        code = CODES["lining"]
    else:
        code = CODES["auto"]
    draw.polygon([(uv[q][0] * S, uv[q][1] * S) for q in t], fill=code)
# Grow islands a few pixels so mip-mapping never samples empty texels.
part_map = np.asarray(img.filter(ImageFilter.MaxFilter(7))).astype(np.int32)

# ── texture colour, for the upper/tongue/heel parts ───────────────────────
load = lambda n: np.asarray(Image.open(f"{src}/{n}").convert("RGB")).astype(np.float32)
orm, mid, nrm, beach, street = (load(f"img{i}.jpg") for i in range(5))
lum = lambda x: x[..., 0] * 0.299 + x[..., 1] * 0.587 + x[..., 2] * 0.114
ys, xs = np.mgrid[0:S, 0:S]
u, v = xs / S, ys / S

variant = np.abs(mid - street).sum(-1) > 60
red = (street[..., 0] - street[..., 1] > 70) & (street[..., 0] > 120)
dark = lum(street) < 110
felt = (u > 0.52) & (v > 0.24)
tab = (xs > 540) & (xs < 660) & (ys > 600) & (ys < 740)

auto = part_map == CODES["auto"]
zones = {
    "upper": auto & variant & ~red & ~tab,
    "accent": (part_map == CODES["accent"]) | (auto & (red | (dark & ~variant & ~felt) | tab)),
    "laces": part_map == CODES["laces"],
    "midsole": (part_map == CODES["midsole"]) | (auto & ~variant & ~dark & ~red & ~tab),
    "outsole": part_map == CODES["outsole"],
    "lining": (part_map == CODES["lining"]) | (auto & dark & ~variant & felt & ~red & ~tab),
}
# Anything left unassigned (padding) defaults to upper.
claimed = np.any(np.stack(list(zones.values())), 0)
zones["upper"] |= ~claimed

# Shading detail: each pixel relative to its zone's local average brightness,
# so fine texture survives but every zone keeps the tone of its new colour.
def box(a, r):
    c = np.cumsum(np.cumsum(np.pad(a, ((r + 1, r), (r + 1, r))), 0), 1)
    return (c[2 * r + 1:, 2 * r + 1:] - c[:-2 * r - 1, 2 * r + 1:] - c[2 * r + 1:, :-2 * r - 1] + c[:-2 * r - 1, :-2 * r - 1])

source = {"upper": beach, "accent": street, "laces": street, "midsole": street, "outsole": street, "lining": street}
detail = np.full((S, S), 0.5, np.float32)
for name, m in zones.items():
    if not m.any():
        continue
    L = lum(source[name]) * m
    w = m.astype(np.float32)
    local = box(box(L, 12), 12) / np.maximum(box(box(w, 12), 12), 1e-3)
    detail[m] = np.clip(L[m] / np.maximum(local[m], 1) * 0.5, 0.05, 0.95)
detail[tab] = 0.5

# Flatten the embossed demo marks in the normal map.
flat = np.array([128, 128, 255], np.float32)
nrm = nrm.copy()
nrm[(xs > 555) & (xs < 640) & (ys > 610) & (ys < 720)] = flat
nrm[(xs > 1730) & (xs < 1810) & (ys > 740) & (ys < 1020)] = flat

soft = lambda m: np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)))
def save_rgb(chans, name, size):
    Image.fromarray(np.stack(chans, -1).astype(np.uint8)).resize((size, size), Image.LANCZOS).save(f"{out}/{name}")

save_rgb([soft(zones["upper"]), soft(zones["accent"]), soft(zones["laces"])], "zones-a.png", 1024)
save_rgb([soft(zones["midsole"]), soft(zones["outsole"]), soft(zones["lining"])], "zones-b.png", 1024)
Image.fromarray((detail * 255).astype(np.uint8)).resize((2048, 2048)).save(f"{out}/detail.jpg", quality=88)
Image.fromarray(nrm.astype(np.uint8)).save(f"{out}/normal.jpg", quality=90)
Image.fromarray(orm.astype(np.uint8)).resize((1024, 1024), Image.LANCZOS).save(f"{out}/orm.jpg", quality=88)

palette = {"upper": (40, 90, 255), "accent": (255, 40, 60), "laces": (40, 220, 90), "midsole": (240, 240, 240), "outsole": (250, 200, 40), "lining": (90, 30, 120)}
prev = np.zeros((S, S, 3), np.uint8)
for name, m in zones.items():
    prev[m] = palette[name]
Image.fromarray(prev).resize((1024, 1024)).save(f"{out}/zone-preview.png")
print({k: int(m.sum()) for k, m in zones.items()})
