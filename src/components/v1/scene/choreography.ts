import { Vector2 } from "three";

/**
 * Scroll choreography for the Filament bulb.
 *
 * Each page section owns a "pose" for the bulb. While a section is on
 * stage the bulb holds that pose; between sections it eases from one pose
 * to the next. Everything is measured in world units at z = 0 for a camera
 * at CAM_Z with FOV, so poses scale with the viewport.
 */

export const FOV = 35;
export const CAM_Z = 6;

/** Model height (screw tip to glass crown) and width including the rays. */
export const BULB_H = 2.9;
export const BULB_W = 3.3;
/** Height of the model's vertical centre above the screw tip origin. */
export const MODEL_CENTER = 0.81;
/** Glass sphere centre relative to the model centre. */
export const GLASS_OFFSET = 0.47;

/** Section ids, in page order, that anchor a bulb pose. */
export const SECTION_IDS = [
  "top",
  "services",
  "work",
  "approach",
  "founder",
  "contact",
] as const;

export type Pose = {
  x: number;
  y: number;
  z: number;
  s: number;
  rx: number;
  rz: number;
  /** 0..1 — how far the 3D phones have risen into view. */
  phones: number;
  /** 0..1 — studio backdrop fades from offwhite to black. */
  dark: number;
  /** multiplier on the warm backdrop glow. */
  glow: number;
  /** 0..1 — contact shadow under the bulb. */
  shadow: number;
};

const KEYS: (keyof Pose)[] = [
  "x",
  "y",
  "z",
  "s",
  "rx",
  "rz",
  "phones",
  "dark",
  "glow",
  "shadow",
];

export type Stop = { start: number; end: number };

const base: Pose = {
  x: 0,
  y: 0,
  z: 0,
  s: 1,
  rx: 0,
  rz: 0,
  phones: 0,
  dark: 0,
  glow: 1,
  shadow: 0,
};

export function makePose(p: Partial<Pose> = {}): Pose {
  return { ...base, ...p };
}

export function copyPose(out: Pose, from: Pose): Pose {
  for (const k of KEYS) out[k] = from[k];
  return out;
}

export function lerpPose(out: Pose, a: Pose, b: Pose, t: number): Pose {
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** Frame-rate independent approach of `out` towards `target`. */
export function dampPose(out: Pose, target: Pose, k: number): Pose {
  for (const k2 of KEYS) out[k2] += (target[k2] - out[k2]) * k;
  return out;
}

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function smoothstep(a: number, b: number, v: number) {
  const t = clamp01((v - a) / (b - a || 1));
  return t * t * (3 - 2 * t);
}

/** World-space size of the viewport at z = 0. */
export function viewportAt(aspect: number) {
  const H = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
  return { W: H * aspect, H };
}

/**
 * The poses, one per SECTION_IDS entry.
 * `wide` is the ≥1024px two-column layout; below that the bulb takes the
 * top of the hero and then docks as a small companion in the bottom-right
 * corner while the reader works through the sections.
 */
export function posesFor(W: number, H: number, wide: boolean): Pose[] {
  const fit = (hFrac: number, wFrac: number) =>
    Math.min((hFrac * H) / BULB_H, (wFrac * W) / BULB_W);

  if (wide) {
    return [
      makePose({ x: 0.24 * W, y: -0.03 * H, s: fit(0.74, 0.46), rz: -0.1, shadow: 1 }),
      makePose({ x: -0.25 * W, y: 0, s: fit(0.62, 0.36), rz: 0.18, rx: 0.08 }),
      makePose({ x: 0.25 * W, y: 0.02 * H, z: 0.9, s: fit(0.34, 0.18), phones: 1, glow: 0.8 }),
      makePose({ x: -0.25 * W, y: -0.02 * H, s: fit(0.6, 0.34), rz: -0.16, rx: -0.06 }),
      makePose({ x: -0.34 * W, y: 0.3 * H, s: fit(0.24, 0.16), rz: 0.08, glow: 0.7 }),
      makePose({ x: 0.25 * W, y: 0, s: fit(0.7, 0.42), rz: -0.06, dark: 1, glow: 0.75 }),
    ];
  }

  // Narrow: the bulb lives in two windows only, the hero and the contact
  // section, and is attached to them (see narrowTarget). The sections in
  // between are opaque, so it is never behind body copy.
  const hero = makePose({ x: 0, y: 0.21 * H, s: fit(0.36, 0.78), shadow: 1 });
  const contact = makePose({ x: 0, y: 0.24 * H, s: fit(0.3, 0.6), dark: 1, glow: 0.7 });
  return [hero, { ...hero }, { ...hero }, { ...hero }, { ...hero }, contact];
}

/**
 * Narrow-layout target: the hero pose scrolls 1:1 with the hero, the
 * contact pose 1:1 with the contact section. `k` is world units per px.
 */
export function narrowTarget(y: number, vh: number, k: number, poses: Pose[], out: Pose) {
  const cTop = bus.tops[5];
  if (cTop !== undefined && y + vh > cTop) {
    copyPose(out, poses[5]);
    out.y += (y - cTop) * k;
    return out;
  }
  copyPose(out, poses[0]);
  out.y += y * k;
  return out;
}

/**
 * Shared, mutable frame state. Written by the DOM listeners and the bulb's
 * frame loop, read by the backdrop and phones. Kept outside React so the
 * scroll-driven animation never triggers a re-render.
 */
export const bus = {
  stops: [] as Stop[],
  switchStart: 0,
  switchEnd: 400,
  pointer: { x: 0, y: 0 },
  /** current (damped) pose, for the backdrop and phones */
  cur: makePose(),
  /** filament brightness 0..1 after flicker */
  light: 0,
  W: 6,
  H: 4,
  workX: 0,
  glowUv: new Vector2(0.7, 0.5),
  /** true while the tab is hidden and frames are advanced by hand */
  snap: false,
  /** document-space top of each SECTION_IDS entry */
  tops: [] as number[],
};

/** Measure section positions into hold ranges on the scroll axis. */
export function measureStops() {
  if (typeof window === "undefined") return;
  const vh = window.innerHeight;
  const sy = window.scrollY;
  const stops: Stop[] = [];
  const tops: number[] = [];

  for (let i = 0; i < SECTION_IDS.length; i++) {
    const el = document.getElementById(SECTION_IDS[i]);
    if (!el) {
      bus.stops = [];
      return;
    }
    const r = el.getBoundingClientRect();
    const top = r.top + sy;
    tops.push(top);
    const h = r.height;
    let start: number;
    let end: number;
    if (i === 0) {
      start = 0;
      end = Math.max(vh * 0.3, h * 0.35);
    } else {
      start = top - vh * 0.35;
      end = top + h - vh * 0.85;
      if (end < start) start = end = (start + end) / 2;
    }
    const prev = stops[i - 1];
    if (prev) {
      start = Math.max(start, prev.end);
      end = Math.max(end, start);
    }
    stops.push({ start, end });
  }

  bus.stops = stops;
  bus.tops = tops;
  bus.switchStart = vh * 0.02;
  // Narrow: the bulb scrolls away with the hero, so it must be fully lit
  // while still on screen.
  bus.switchEnd = window.innerWidth >= 1024 ? stops[0].end : vh * 0.16;
}

/** Target pose for a scroll position. */
export function sampleTrack(y: number, poses: Pose[], out: Pose): Pose {
  const stops = bus.stops;
  if (stops.length !== poses.length || y <= stops[0].end) {
    return copyPose(out, poses[0]);
  }
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (y >= s.start && y <= s.end) return copyPose(out, poses[i]);
    const n = stops[i + 1];
    if (n && y > s.end && y < n.start) {
      return lerpPose(
        out,
        poses[i],
        poses[i + 1],
        easeInOut((y - s.end) / (n.start - s.end)),
      );
    }
  }
  return copyPose(out, poses[poses.length - 1]);
}

/** 0..1 — how far the switch has been thrown, from scroll. */
export function switchAt(y: number) {
  return smoothstep(bus.switchStart, bus.switchEnd, y);
}

/**
 * Brightness from switch position, with two scroll-keyed dips so the
 * filament stutters on like a real bulb rather than a dimmer.
 */
export function flicker(sw: number) {
  const dip = (c: number, w: number, depth: number) =>
    depth * Math.exp(-(((sw - c) / w) ** 2));
  return Math.max(0, sw * (1 - dip(0.42, 0.035, 0.85) - dip(0.56, 0.03, 0.6)));
}
