import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CORNER, DEPTH, PHONE_H, PHONE_W, SCREEN_CORNER, SCREEN_H, SCREEN_W } from "../phone-dims";
import type { LayerSpec } from "./ui-layers";

/** Radius of the rounded frame edge (the bevel of the extruded body). */
export const EDGE = 0.034;
/** Front of the phone body (glass level). */
export const FRONT = DEPTH / 2;
/** z of the screen surface in phone-local space. */
export const SCREEN_Z = FRONT + 0.003;

/** Dynamic island, sized and placed like an iPhone 15 Pro's (centre y). */
export const ISLAND = { w: 0.358, h: 0.104, y: SCREEN_H / 2 - 0.084 };

/** Screenshot pixels (1320 wide) -> phone units. */
export const PX = SCREEN_W / 1320;

export function roundedRectShape(w: number, h: number, r: number, cx = 0, cy = 0) {
  const rr = Math.min(r, w / 2, h / 2);
  const s = new THREE.Shape();
  const x = cx - w / 2;
  const y = cy - h / 2;
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - rr);
  s.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  s.lineTo(x + rr, y + h);
  s.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + rr);
  s.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return s;
}

/**
 * Flat rounded rectangle whose UVs map to a sub-rectangle [u0,u1] x [v0,v1]
 * of a texture (defaults to the whole texture).
 */
export function roundedPlane(w: number, h: number, r: number, segments: number, uv = [0, 1, 0, 1]) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), segments);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  const [u0, u1, v0, v1] = uv;
  for (let i = 0; i < pos.count; i++) {
    const fx = (pos.getX(i) + w / 2) / w;
    const fy = (pos.getY(i) + h / 2) / h;
    uvs.setXY(i, u0 + fx * (u1 - u0), v0 + fy * (v1 - v0));
  }
  uvs.needsUpdate = true;
  return geo;
}

/** Where a normalised screenshot rectangle sits on the screen, in phone-local units. */
export function layerRect(l: LayerSpec) {
  const w = (l.x1 - l.x0) * SCREEN_W;
  const h = (l.y1 - l.y0) * SCREEN_H;
  const x = -SCREEN_W / 2 + ((l.x0 + l.x1) / 2) * SCREEN_W;
  const y = SCREEN_H / 2 - ((l.y0 + l.y1) / 2) * SCREEN_H;
  const r = Math.min(l.radius * PX, w / 2, h / 2);
  return { w, h, x, y, r };
}

/** Plane textured with exactly the screenshot pixels under `l`. */
export function layerGeometry(l: LayerSpec, segments: number) {
  const { w, h, r } = layerRect(l);
  // Texture v runs bottom-up; the specs are measured top-down.
  return roundedPlane(w, h, r, segments, [l.x0, l.x1, 1 - l.y1, 1 - l.y0]);
}

function bodyGeometry(detail: number) {
  const depth = DEPTH - EDGE * 2;
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(PHONE_W - EDGE * 2, PHONE_H - EDGE * 2, CORNER - EDGE), {
    depth,
    bevelEnabled: true,
    bevelThickness: EDGE,
    bevelSize: EDGE,
    bevelSegments: detail + 1,
    curveSegments: detail * 5,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export type PhoneKit = {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  screen: THREE.BufferGeometry;
  island: THREE.BufferGeometry;
  buttonLong: THREE.BufferGeometry;
  buttonShort: THREE.BufferGeometry;
  buttonAction: THREE.BufferGeometry;
  bump: THREE.BufferGeometry;
  lens: THREE.BufferGeometry;
  lensGlass: THREE.BufferGeometry;
  spill: THREE.BufferGeometry;
  detail: number;
  dispose: () => void;
};

/** Geometry shared by all three phones. */
export function createPhoneKit(detail: number): PhoneKit {
  const seg = detail * 5;
  const kit = {
    body: bodyGeometry(detail),
    glass: roundedPlane(PHONE_W - EDGE * 2 + 0.002, PHONE_H - EDGE * 2 + 0.002, CORNER - EDGE, seg),
    screen: roundedPlane(SCREEN_W, SCREEN_H, SCREEN_CORNER, seg),
    island: roundedPlane(ISLAND.w, ISLAND.h, ISLAND.h / 2, 8),
    buttonLong: new RoundedBoxGeometry(0.03, 0.36, 0.062, 2, 0.012),
    buttonShort: new RoundedBoxGeometry(0.03, 0.21, 0.062, 2, 0.012),
    buttonAction: new RoundedBoxGeometry(0.03, 0.1, 0.062, 2, 0.012),
    bump: new RoundedBoxGeometry(0.64, 0.64, 0.03, detail, 0.1),
    lens: new THREE.CylinderGeometry(0.1, 0.108, 0.05, detail * 8),
    lensGlass: new THREE.CircleGeometry(0.068, detail * 8),
    spill: new THREE.PlaneGeometry(1, 1),
    detail,
  };
  return {
    ...kit,
    dispose: () => {
      Object.values(kit).forEach((g) => {
        if (g instanceof THREE.BufferGeometry) g.dispose();
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* Blueprint wireframe                                                  */
/* ------------------------------------------------------------------ */

type Seg = { a: THREE.Vector3; b: THREE.Vector3; d0: number; d1: number; c: number };

function pushPolyline(out: Seg[], pts: THREE.Vector3[], closed: boolean, delay: number, span: number, c: number) {
  const n = closed ? pts.length : pts.length - 1;
  let total = 0;
  const lens: number[] = [];
  for (let i = 0; i < n; i++) {
    const l = pts[i].distanceTo(pts[(i + 1) % pts.length]);
    lens.push(l);
    total += l;
  }
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const d0 = delay + (acc / total) * span;
    acc += lens[i];
    const d1 = delay + (acc / total) * span;
    out.push({ a: pts[i], b: pts[(i + 1) % pts.length], d0, d1, c });
  }
}

function loop(w: number, h: number, r: number, z: number, divisions: number, startAtTop = true) {
  const pts = roundedRectShape(w, h, r)
    .getSpacedPoints(divisions)
    .slice(0, -1)
    .map((p) => new THREE.Vector3(p.x, p.y, z));
  if (!startAtTop) return pts;
  // Start drawing from the top centre so every contour traces from the same place.
  let best = 0;
  pts.forEach((p, i) => {
    if (p.y > pts[best].y - 1e-4 && Math.abs(p.x) < Math.abs(pts[best].x)) best = i;
  });
  return [...pts.slice(best), ...pts.slice(0, best)];
}

/** Outline of a box on one side of the phone (a button), in the y/z plane. */
function sideRect(x: number, y: number, len: number, depth: number) {
  return [
    new THREE.Vector3(x, y - len / 2, -depth / 2),
    new THREE.Vector3(x, y + len / 2, -depth / 2),
    new THREE.Vector3(x, y + len / 2, depth / 2),
    new THREE.Vector3(x, y - len / 2, depth / 2),
  ];
}

/**
 * Line segments for the blueprint phone. Each segment carries a "draw"
 * distance so the edges trace themselves in (dashSize animates 0 -> DRAW_END),
 * and a brightness (0..1) so construction lines sit quieter than the body.
 */
export const DRAW_END = 1.25;

export function blueprintSegments(detail: number) {
  const segs: Seg[] = [];
  const div = 48 + detail * 24;
  const bright = 1;
  const mid = 0.55;
  const faint = 0.28;

  // Body contours: widest silhouette, front and back caps.
  pushPolyline(segs, loop(PHONE_W, PHONE_H, CORNER, 0, div), true, 0, 0.62, bright);
  pushPolyline(segs, loop(PHONE_W - EDGE * 2, PHONE_H - EDGE * 2, CORNER - EDGE, FRONT, div), true, 0.08, 0.62, bright);
  pushPolyline(segs, loop(PHONE_W - EDGE * 2, PHONE_H - EDGE * 2, CORNER - EDGE, -FRONT, div), true, 0.12, 0.62, mid);
  // Screen and island.
  pushPolyline(segs, loop(SCREEN_W, SCREEN_H, SCREEN_CORNER, SCREEN_Z + 0.001, div), true, 0.22, 0.6, mid);
  pushPolyline(
    segs,
    loop(ISLAND.w, ISLAND.h, ISLAND.h / 2, SCREEN_Z + 0.002, 24).map((p) => p.add(new THREE.Vector3(0, ISLAND.y, 0))),
    true,
    0.6,
    0.25,
    bright,
  );

  // Edge rails joining front and back at the corners and mid-sides.
  const rail = (x: number, y: number) =>
    pushPolyline(segs, [new THREE.Vector3(x, y, -FRONT), new THREE.Vector3(x, y, FRONT)], false, 0.66, 0.12, mid);
  const k = (CORNER - EDGE) * (1 - Math.SQRT1_2);
  const hw = PHONE_W / 2 - EDGE;
  const hh = PHONE_H / 2 - EDGE;
  rail(-hw + k, -hh + k);
  rail(hw - k, -hh + k);
  rail(-hw + k, hh - k);
  rail(hw - k, hh - k);

  // Buttons (left: action, volume up/down; right: side button).
  const sx = PHONE_W / 2 + 0.012;
  pushPolyline(segs, sideRect(-sx, 0.86, 0.1, 0.062), true, 0.72, 0.12, mid);
  pushPolyline(segs, sideRect(-sx, 0.6, 0.21, 0.062), true, 0.74, 0.12, mid);
  pushPolyline(segs, sideRect(-sx, 0.32, 0.21, 0.062), true, 0.76, 0.12, mid);
  pushPolyline(segs, sideRect(sx, 0.48, 0.36, 0.062), true, 0.74, 0.12, mid);

  // Camera bump + lenses on the back.
  const bx = PHONE_W / 2 - 0.4;
  const by = PHONE_H / 2 - 0.4;
  pushPolyline(
    segs,
    loop(0.64, 0.64, 0.1, -FRONT - 0.03, 32).map((p) => p.add(new THREE.Vector3(bx, by, 0))),
    true,
    0.78,
    0.2,
    mid,
  );
  [
    [-0.14, 0.14],
    [-0.14, -0.14],
    [0.14, 0],
  ].forEach(([lx, ly], i) => {
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a < 20; a++) {
      const th = (a / 20) * Math.PI * 2;
      pts.push(new THREE.Vector3(bx + lx + Math.cos(th) * 0.1, by + ly + Math.sin(th) * 0.1, -FRONT - 0.055));
    }
    pushPolyline(segs, pts, true, 0.82 + i * 0.03, 0.14, mid);
  });

  // Construction lines: centre axes overshooting the silhouette, end ticks,
  // and corner registration marks — the drafting scaffold.
  const ox = PHONE_W / 2 + 0.22;
  const oy = PHONE_H / 2 + 0.22;
  const dash = (a: THREE.Vector3, b: THREE.Vector3, n: number, delay: number) => {
    for (let i = 0; i < n; i++) {
      const p0 = a.clone().lerp(b, i / n);
      const p1 = a.clone().lerp(b, (i + 0.55) / n);
      pushPolyline(segs, [p0, p1], false, delay + (i / n) * 0.35, 0.35 / n, faint);
    }
  };
  dash(new THREE.Vector3(0, oy, 0), new THREE.Vector3(0, -oy, 0), 22, 0.02);
  dash(new THREE.Vector3(-ox, 0, 0), new THREE.Vector3(ox, 0, 0), 10, 0.06);
  const tick = 0.07;
  for (const [x, y] of [
    [0, oy],
    [0, -oy],
    [ox, 0],
    [-ox, 0],
  ]) {
    const horiz = x === 0;
    pushPolyline(
      segs,
      [
        new THREE.Vector3(x - (horiz ? tick : 0), y - (horiz ? 0 : tick), 0),
        new THREE.Vector3(x + (horiz ? tick : 0), y + (horiz ? 0 : tick), 0),
      ],
      false,
      0.4,
      0.05,
      mid,
    );
  }
  const cm = 0.09;
  for (const sxn of [-1, 1]) {
    for (const syn of [-1, 1]) {
      const cx = sxn * (PHONE_W / 2 + 0.1);
      const cy = syn * (PHONE_H / 2 + 0.1);
      pushPolyline(
        segs,
        [new THREE.Vector3(cx - cm, cy, 0), new THREE.Vector3(cx + cm, cy, 0)],
        false,
        0.45,
        0.06,
        faint,
      );
      pushPolyline(
        segs,
        [new THREE.Vector3(cx, cy - cm, 0), new THREE.Vector3(cx, cy + cm, 0)],
        false,
        0.45,
        0.06,
        faint,
      );
    }
  }

  const positions = new Float32Array(segs.length * 6);
  const colors = new Float32Array(segs.length * 6);
  const dist = new Float32Array(segs.length * 2);
  segs.forEach((s, i) => {
    positions.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], i * 6);
    colors.set([s.c, s.c, s.c, s.c, s.c, s.c], i * 6);
    dist.set([s.d0, s.d1], i * 2);
  });
  return { positions, colors, dist };
}
