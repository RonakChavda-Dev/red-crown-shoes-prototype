import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Build } from "@/data/products";

/**
 * Procedural, original Red Tape shoe.
 *
 * Everything is generated from one parametric description of the foot:
 * `u` runs heel (0) → toe (1) and `v` wraps around the upper from the
 * lateral sole edge (0) over the top (π/2) to the medial sole edge (π).
 * Every panel (heel counter, side tape, toe cap, tongue, laces) is a patch
 * on that same surface, so parts always sit flush.
 *
 * To replace this with an authored GLB later, return equivalent meshes
 * from `ShoeModel` and keep the zone → material mapping.
 */

export interface ShoeGeometry {
  upper: THREE.BufferGeometry;
  lining: THREE.BufferGeometry;
  shade: THREE.BufferGeometry;
  accent: THREE.BufferGeometry;
  midsole: THREE.BufferGeometry;
  outsole: THREE.BufferGeometry;
  laces: THREE.BufferGeometry;
  hardware: THREE.BufferGeometry;
  insole: THREE.BufferGeometry;
  dispose: () => void;
}

const LENGTH = 3;
const X0 = -LENGTH / 2;
const HALF_PI = Math.PI / 2;

type Keys = [number, number][];

/** Smooth (Catmull-Rom) interpolation through keyframes sorted by u. */
function curve(keys: Keys, u: number) {
  const x = Math.min(1, Math.max(0, u));
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)][1];
  const p1 = keys[i][1];
  const p2 = keys[i + 1][1];
  const p3 = keys[Math.min(keys.length - 1, i + 2)][1];
  const t = (x - keys[i][0]) / (keys[i + 1][0] - keys[i][0] || 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

const roundEnd = (a: number) => Math.sqrt(Math.max(0, 1 - (1 - Math.min(1, a)) ** 2));
const endRound = (u: number, heel = 0.09, toe = 0.15) => roundEnd(u / heel) * roundEnd((1 - u) / toe);

const WIDTH: Keys = [
  [0, 0.34],
  [0.16, 0.39],
  [0.38, 0.37],
  [0.62, 0.5],
  [0.8, 0.49],
  [0.93, 0.42],
  [1, 0.34],
];

const SOLE_THICKNESS: Record<Build["sole"], Keys> = {
  runner: [
    [0, 0.4],
    [0.3, 0.37],
    [0.72, 0.26],
    [1, 0.23],
  ],
  court: [
    [0, 0.34],
    [1, 0.31],
  ],
  trail: [
    [0, 0.44],
    [0.3, 0.41],
    [0.72, 0.31],
    [1, 0.28],
  ],
};

const OUTSOLE: Record<Build["sole"], number> = { runner: 0.06, court: 0.07, trail: 0.1 };

const FOREFOOT: Keys = [
  [0.56, 0.62],
  [0.7, 0.47],
  [0.82, 0.38],
  [0.9, 0.31],
  [0.96, 0.21],
  [1, 0.06],
];

const HEIGHT: Record<Build["collar"], Keys> = {
  low: [[0, 0.84], [0.12, 0.9], [0.3, 0.9], [0.42, 0.8], ...FOREFOOT],
  high: [[0, 1.36], [0.12, 1.4], [0.3, 1.3], [0.44, 0.98], ...FOREFOOT],
};

const OPENING: Record<Build["collar"], { from: number; to: number; depth: number }> = {
  low: { from: 0.03, to: 0.41, depth: 0.88 },
  high: { from: 0.03, to: 0.43, depth: 0.62 },
};

/** Toe spring and heel bevel, applied to every part so they stay aligned. */
function bend(x: number) {
  let y = 0;
  if (x > 0.45) y += 0.22 * ((x - 0.45) / (LENGTH / 2 - 0.45)) ** 2;
  if (x < -1.2) y += 0.06 * ((-1.2 - x) / 0.3) ** 2;
  return y;
}

function createShape(build: Build) {
  const soleKeys = SOLE_THICKNESS[build.sole];
  const heightKeys = HEIGHT[build.collar];
  const opening = OPENING[build.collar];

  const width = (u: number) => curve(WIDTH, u) * endRound(u);
  const soleTop = (u: number) => curve(soleKeys, u);
  const height = (u: number) => curve(heightKeys, u);

  /** Top edge of each side wall, in v radians (π/2 = closed over the top). */
  const vmax = (u: number) => {
    if (u <= opening.from || u >= opening.to) return HALF_PI;
    const mid = (opening.from + opening.to) / 2;
    const r = (opening.to - opening.from) / 2;
    const k = Math.sqrt(Math.max(0, 1 - ((u - mid) / r) ** 2));
    // Skew so the back of the collar stays taller than the ankle dip.
    const skew = 0.75 + 0.25 * Math.min(1, (u - opening.from) / (r * 1.2));
    return HALF_PI - opening.depth * k * skew;
  };

  const base = (u: number, v: number, out: THREE.Vector3) => {
    const c = Math.cos(v);
    const s = Math.max(0, Math.sin(v));
    const lift = s ** 0.68;
    // Achilles curve: the upper heel leans forward as it rises.
    const x = X0 + LENGTH * u + 0.11 * lift ** 1.6 * Math.max(0, 1 - u / 0.3);
    const z = width(u) * Math.sign(c) * Math.abs(c) ** 0.85 * (1 - 0.1 * lift);
    const y = soleTop(u) + height(u) * lift;
    return out.set(x, y + bend(x), z);
  };

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const du = new THREE.Vector3();
  const dv = new THREE.Vector3();
  const normal = new THREE.Vector3();

  /** Point on the upper surface pushed `offset` along the outward normal. */
  const point = (u: number, v: number, offset = 0, out = new THREE.Vector3()) => {
    base(u, v, out);
    if (offset === 0) return out;
    const e = 0.002;
    du.subVectors(base(Math.min(1, u + e), v, a), base(Math.max(0, u - e), v, b));
    dv.subVectors(base(u, v + e, a), base(u, v - e, b));
    normal.crossVectors(du, dv).normalize();
    // Make sure we push away from the shoe's centre line.
    const ref = a.set(0, soleTop(u) + height(u) * 0.35 + bend(out.x), 0);
    if (normal.dot(b.subVectors(out, ref).setX(0)) < 0) normal.negate();
    if (!Number.isFinite(normal.x)) return out;
    return out.addScaledVector(normal, offset);
  };

  return { width, soleTop, height, vmax, point, outsole: OUTSOLE[build.sole], opening };
}

/** Build an indexed grid from a parametric function over [0,1]². */
function grid(nu: number, nv: number, fn: (s: number, t: number, out: THREE.Vector3) => THREE.Vector3) {
  const positions = new Float32Array((nu + 1) * (nv + 1) * 3);
  const uvs = new Float32Array((nu + 1) * (nv + 1) * 2);
  const v = new THREE.Vector3();
  let p = 0;
  let q = 0;
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      fn(i / nu, j / nv, v);
      positions[p++] = v.x;
      positions[p++] = v.y;
      positions[p++] = v.z;
      uvs[q++] = i / nu;
      uvs[q++] = j / nv;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = (i + 1) * (nv + 1) + j;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** Flip winding when the averaged normal points the wrong way. */
function orient(geometry: THREE.BufferGeometry, reference: (p: THREE.Vector3) => THREE.Vector3) {
  const pos = geometry.getAttribute("position");
  const nor = geometry.getAttribute("normal");
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  let score = 0;
  for (let i = 0; i < pos.count; i += 7) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    score += Math.sign(n.dot(reference(p)));
  }
  if (score < 0) {
    const index = geometry.getIndex()!;
    const arr = index.array as Uint16Array | Uint32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const tmp = arr[i + 1];
      arr[i + 1] = arr[i + 2];
      arr[i + 2] = tmp;
    }
    index.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  return geometry;
}

const sideways = (p: THREE.Vector3) => new THREE.Vector3(0, 0.15, Math.sign(p.z) || 1);
const upwards = () => new THREE.Vector3(0, 1, 0);

function merge(parts: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Shoe geometry merge failed");
  return merged;
}

/** A closed, rounded slab following the footprint (midsole / outsole). */
function slab(
  grow: number,
  bottom: (u: number) => number,
  top: (u: number) => number,
  extend: number,
) {
  return grid(140, 40, (s, t, out) => {
    const x = X0 - extend + (LENGTH + extend * 2) * s;
    const u = (x - X0) / LENGTH;
    const w = (curve(WIDTH, u) * 1.06 + grow) * endRound(s, 0.07, 0.11);
    const phi = t * Math.PI * 2;
    const c = Math.cos(phi);
    const sn = Math.sin(phi);
    const y0 = bottom(u);
    const y1 = top(u);
    const z = w * Math.sign(c) * Math.abs(c) ** 0.35;
    const y = (y0 + y1) / 2 + ((y1 - y0) / 2) * Math.sign(sn) * Math.abs(sn) ** 0.35;
    return out.set(x, y + bend(x), z);
  });
}

function tube(points: THREE.Vector3[], radius: number, closed = false, segments = 48) {
  const path = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  return new THREE.TubeGeometry(path, segments, radius, 7, closed);
}

export function buildShoeGeometry(build: Build): ShoeGeometry {
  const shape = createShape(build);
  const { point, vmax, soleTop, width, opening } = shape;

  // ── Upper side walls (lateral = A, medial = B) ──
  const sideA = () => grid(120, 34, (s, t, out) => point(s, t * vmax(s), 0, out));
  const sideB = () => grid(120, 34, (s, t, out) => point(s, Math.PI - t * vmax(s), 0, out));
  const wallA = orient(sideA(), sideways);
  const wallB = orient(sideB(), sideways);

  // Padded collar following the opening edge.
  const collarPts: THREE.Vector3[] = [];
  const steps = 36;
  for (let i = 0; i <= steps; i++) {
    const u = opening.from + ((opening.to - opening.from) * i) / steps;
    collarPts.push(point(u, vmax(u) - 0.02, -0.01));
  }
  for (let i = steps - 1; i > 0; i--) {
    const u = opening.from + ((opening.to - opening.from) * i) / steps;
    collarPts.push(point(u, Math.PI - vmax(u) + 0.02, -0.01));
  }
  const collar = tube(collarPts, 0.055, true, 160);

  const upper = merge([wallA, wallB, collar]);
  const lining = merge([orient(sideA(), sideways), orient(sideB(), sideways)]);

  // ── Shade panels: toe cap, eyestays, tongue ──
  const toeCap = orient(
    grid(30, 48, (s, t, out) => point(0.82 + 0.18 * s, t * Math.PI, 0.008, out)),
    (p) => new THREE.Vector3(1, 0.4, p.z * 2),
  );
  const throatFrom = 0.42;
  const throatTo = 0.75;
  const eyestay = (side: 1 | -1) =>
    orient(
      grid(40, 6, (s, t, out) => point(throatFrom + (throatTo - throatFrom) * s, HALF_PI - side * (0.24 + 0.24 * t), 0.01, out)),
      sideways,
    );
  const tongueLift = build.collar === "high" ? 0.2 : 0.11;
  const tongue = grid(24, 14, (s, t, out) => {
    const u = 0.47 - 0.11 * s;
    point(u, HALF_PI + (t - 0.5) * 1.05, 0.006, out);
    out.y += tongueLift * s ** 1.4;
    out.x -= 0.05 * s ** 1.4;
    return out;
  });
  const shade = merge([toeCap, eyestay(1), eyestay(-1), orient(tongue, upwards)]);

  // ── Accent: heel counter, side tape, pull tab ──
  const heelTop = (u: number) => Math.min(vmax(u) - 0.06, (build.collar === "high" ? 1.05 : 1.18) - 2.5 * u);
  const heel = (side: 1 | -1) =>
    orient(
      grid(26, 18, (s, t, out) => {
        const u = s * 0.25;
        const v = t * Math.max(0.05, heelTop(u));
        return point(u, side === 1 ? v : Math.PI - v, 0.012, out);
      }),
      (p) => new THREE.Vector3(-1, 0, p.z * 3),
    );
  const tape = (side: 1 | -1) =>
    orient(
      grid(10, 24, (s, t, out) => {
        const u = 0.5 + 0.085 * s - 0.15 * t;
        const v = 0.04 + t * 1.0;
        return point(u, side === 1 ? v : Math.PI - v, 0.014, out);
      }),
      sideways,
    );
  const tab = new THREE.BoxGeometry(0.05, 0.26, 0.15, 1, 1, 1);
  const tabTop = point(0, HALF_PI);
  tab.rotateZ(-0.22);
  tab.translate(tabTop.x - 0.03, tabTop.y - 0.04, 0);
  const accent = merge([heel(1), heel(-1), tape(1), tape(-1), tab]);

  // ── Sole unit ──
  const midsole = slab(0.04, () => shape.outsole, (u) => soleTop(u) + 0.02, 0.05);
  const outsoleParts = [slab(0.05, () => 0, () => shape.outsole + 0.02, 0.06)];
  if (build.sole === "trail") {
    for (let i = 0; i < 13; i++) {
      const u = 0.06 + i * 0.07;
      const x = X0 + LENGTH * u;
      for (const z of [-1, 1]) {
        const lug = new THREE.BoxGeometry(0.13, 0.07, 0.12);
        lug.translate(x, -0.025 + bend(x), z * width(u) * 0.55);
        outsoleParts.push(lug);
      }
    }
  }
  const outsole = merge(outsoleParts);

  const insole = orient(
    grid(40, 8, (s, t, out) => {
      const u = 0.02 + 0.62 * s;
      const x = X0 + LENGTH * u;
      return out.set(x, soleTop(u) + 0.015 + bend(x), (t * 2 - 1) * width(u) * 0.86);
    }),
    upwards,
  );

  // ── Laces and eyelets ──
  const laceParts: THREE.BufferGeometry[] = [];
  const hardwareParts: THREE.BufferGeometry[] = [];
  const count = 6;
  const eyelets: { a: THREE.Vector3; b: THREE.Vector3; u: number }[] = [];
  for (let k = 0; k < count; k++) {
    const u = 0.45 + (k * (0.72 - 0.45)) / (count - 1);
    eyelets.push({ u, a: point(u, HALF_PI - 0.34, 0.022), b: point(u, HALF_PI + 0.34, 0.022) });
  }
  const arch = (from: THREE.Vector3, to: THREE.Vector3, u: number, lift = 0.05) => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const top = point(u, HALF_PI, 0.03);
    mid.y = Math.max(mid.y, top.y) + lift * 0.4;
    return tube([from, mid, to], 0.022, false, 16);
  };
  for (let k = 0; k < count - 1; k++) {
    const e0 = eyelets[k];
    const e1 = eyelets[k + 1];
    const u = (e0.u + e1.u) / 2;
    laceParts.push(arch(e0.a, e1.b, u), arch(e0.b, e1.a, u, 0.07));
  }
  laceParts.push(arch(eyelets[count - 1].a, eyelets[count - 1].b, eyelets[count - 1].u));
  // A simple bow at the top eyelets.
  const knot = point(eyelets[0].u - 0.01, HALF_PI, 0.06);
  for (const side of [1, -1]) {
    laceParts.push(
      tube(
        [
          knot,
          knot.clone().add(new THREE.Vector3(-0.1, 0.1, side * 0.12)),
          knot.clone().add(new THREE.Vector3(-0.24, 0.04, side * 0.2)),
          knot.clone().add(new THREE.Vector3(-0.12, -0.02, side * 0.06)),
          knot,
        ],
        0.02,
        false,
        24,
      ),
      tube(
        [knot, knot.clone().add(new THREE.Vector3(0.02, -0.12, side * 0.16)), knot.clone().add(new THREE.Vector3(-0.02, -0.3, side * 0.24))],
        0.02,
        false,
        16,
      ),
    );
  }
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (const { a, b, u } of eyelets) {
    for (const [p, v] of [
      [a, HALF_PI - 0.34],
      [b, HALF_PI + 0.34],
    ] as const) {
      const ring = new THREE.TorusGeometry(0.032, 0.011, 6, 14);
      const n = point(u, v, 0.05).sub(point(u, v, 0)).normalize();
      ring.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(zAxis, n));
      ring.translate(p.x, p.y, p.z);
      hardwareParts.push(ring);
    }
  }

  const laces = merge(laceParts);
  const hardware = merge(hardwareParts);

  const all = { upper, lining, shade, accent, midsole, outsole, laces, hardware, insole };
  return {
    ...all,
    dispose: () => Object.values(all).forEach((g) => g.dispose()),
  };
}

/** Length used to frame the camera; height comes from the built geometry. */
export const SHOE_LENGTH = LENGTH + 0.2;
