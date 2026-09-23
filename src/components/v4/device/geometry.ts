import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CORNER, DEPTH, PHONE_H, PHONE_W, SCREEN_CORNER, SCREEN_H, SCREEN_W } from "../phone-dims";
import { SHOT_W, type LayerSpec } from "./ui-layers";

/** Radius of the rounded frame edge (the bevel of the extruded body). */
export const EDGE = 0.034;
/** Front of the phone body (glass level). */
export const FRONT = DEPTH / 2;
/** z of the screen surface in phone-local space. */
export const SCREEN_Z = FRONT + 0.003;

/** Dynamic island, sized and placed like an iPhone 15 Pro's (centre y). */
export const ISLAND = { w: 0.358, h: 0.104, y: SCREEN_H / 2 - 0.084 };

/** Screenshot pixels (921 wide) -> phone units. */
export const PX = SCREEN_W / SHOT_W;

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

/**
 * The part of a child layer's footprint that lies on its parent layer, in the
 * child's local space: the cavity it leaves in the parent when it lifts. A
 * child can overhang its parent (MyCruiseCard's pill hangs off the card), and
 * that overhang must not leave a floating patch in mid-air. Clamping the
 * child's convex outline to the parent's bounds gives exactly the overlap.
 */
export function clippedLayerGeometry(child: LayerSpec, parent: LayerSpec) {
  const c = layerRect(child);
  const p = layerRect(parent);
  const xMin = p.x - p.w / 2 - c.x;
  const xMax = p.x + p.w / 2 - c.x;
  const yMin = p.y - p.h / 2 - c.y;
  const yMax = p.y + p.h / 2 - c.y;
  const pts = roundedRectShape(c.w, c.h, c.r)
    .getSpacedPoints(128)
    .map((v) => new THREE.Vector2(THREE.MathUtils.clamp(v.x, xMin, xMax), THREE.MathUtils.clamp(v.y, yMin, yMax)));
  return new THREE.ShapeGeometry(new THREE.Shape(pts));
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
