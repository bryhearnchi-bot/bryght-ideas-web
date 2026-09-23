import { PHONE_H } from "../phone-dims";

/**
 * Pure pose maths for the showcase: showcase.t -> target transform and
 * effect amounts for each phone. No three.js objects, no side effects.
 *
 * Phone i: 0 = KGAY Travel, 1 = BetweenActs, 2 = Ahoy (also its ring index:
 * app i is front and centre at t = 2 + i).
 */

export type Layout = {
  mobile: boolean;
  /** Visible world size at z = 0. */
  W: number;
  H: number;
  /** Centre of the carousel once the app panels show (t >= INTRO_END + 0.4). */
  cx: number;
  cy: number;
  /** World height of the front phone once the app panels show. */
  hFront: number;
  /**
   * Carousel centre / front height while the (taller) intro panel is up. The
   * carousel pose blends from these to cy / hFront just after INTRO_END.
   */
  cyI: number;
  hFrontI: number;
  /** Fan centre and phone height (the fan only ever shows with the intro panel). */
  cyFan: number;
  hFan: number;
  spread: number;
  fanDepth: number;
  /** Carousel ring radii (x across, z into the screen). */
  rx: number;
  rz: number;
};

export type Target = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  /** Materialise amount 0..1. */
  reveal: number;
  /** Exploded-UI amount 0..1. */
  explode: number;
  /** 1 = present, 0 = gone (exit). */
  fade: number;
  /** 1 when this phone is front and centre in the carousel. */
  front: number;
  /** Exit progress 0..1. */
  exit: number;
};

export const newTarget = (): Target => ({
  x: 0,
  y: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  s: 1,
  reveal: 0,
  explode: 0,
  fade: 1,
  front: 0,
  exit: 0,
});

/** Slot in the fan (-1 left, 0 centre, +1 right) — matches the ring so nothing crosses. */
const FAN_SLOT = [0, 1, -1];
/** Order in which the phones materialise. */
const REVEAL_ORDER = [0, 1, 2];
/** How far (radians) each phone turns for its exploded beat (+ = screen turns right). */
const TURN = [0.52, -0.4, 0.48];

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const smoother = (x: number) => {
  const c = clamp01(x);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Stacked (text below) layout on narrow or portrait screens. */
export function isStacked(pxW: number, pxH: number) {
  return pxW < 768 || pxW / Math.max(1, pxH) < 0.9;
}

/** showcase.tsx switches the intro card for the (shorter) app panel at this t. */
export const INTRO_END = 1.6;

/*
 * Page chrome the phones must clear, in CSS px (measured on /v4). The fixed
 * nav is h-16 (64px) below md and h-20 (80px) from md, plus a 1px border.
 * Stacked: the text card is pinned 52px above the bottom; with that offset
 * the intro card reaches 383px up and the app panel 297px. Side by side: the
 * copy column is left: 40px, width: min(540px, 38%) of the 1440px container.
 */
const GAP = 16; // 12px asked for + a few px for damping overshoot
const STACK_INTRO_PX = 383;
const STACK_APPS_PX = 297;
const COPY_CLEAR = 40;

/*
 * How far the whole cluster reaches from its centre, in units of the front
 * phone's height: every phone, the lifted UI layers at full lift, the Ahoy
 * blueprint's drafting marks, the idle float/sway (and, side by side, the
 * pointer parallax), sampled over every t by projecting the real poses.
 * Up / down for the stacked layout; left / right for side by side.
 */
const REACH_UP = 0.645;
const REACH_DOWN = 0.615;
const FAN_UP = 0.6;
const FAN_DOWN = 0.62;
const FAN_RATIO = 0.76;
const REACH_LEFT = 0.845;
const REACH_RIGHT = 0.745;
/** Side-by-side ring radius across, in front-phone heights. */
const RING_X = 0.62;

/** Largest height whose [c - up*h, c + down*h] fits [lo, hi], and the centre that centres it there. */
function fitBand(lo: number, hi: number, up: number, down: number, cap: number) {
  const h = Math.min(cap, (hi - lo) / (up + down));
  return { h, c: (lo + up * h + hi - down * h) / 2 };
}

export function computeLayout(W: number, H: number, pxW: number, pxH: number): Layout {
  const wPerPx = W / Math.max(1, pxW);
  const hPerPx = H / Math.max(1, pxH);
  const nav = (pxW >= 768 ? 81 : 65) + GAP;

  if (!isStacked(pxW, pxH)) {
    // 3D to the right of the copy column, clear of it by COPY_CLEAR px.
    const container = Math.min(pxW, 1440);
    const copyRight = Math.max(0, (pxW - 1440) / 2) + 40 + Math.min(540, 0.38 * container);
    const lo = -W / 2 + (copyRight + COPY_CLEAR) * wPerPx;
    const hi = W / 2;
    // Front phone as tall as before (0.56 H / 0.4 W), smaller only if the ring would not fit.
    const cap = Math.min(0.56 * H, 0.4 * W);
    // fitBand works top-down; mirror x so "up" is the left reach.
    const fit = fitBand(-hi, -lo, REACH_RIGHT, REACH_LEFT, cap);
    const hFront = fit.h;
    const cx = -fit.c;
    const hFan = 0.86 * hFront;
    const cy = -0.01 * H;
    return {
      mobile: false,
      W,
      H,
      cx,
      cy,
      hFront,
      cyI: cy,
      hFrontI: hFront,
      cyFan: cy,
      hFan,
      spread: Math.min(0.185 * W, hFan * 0.62),
      fanDepth: 0.32 * hFan,
      rx: RING_X * hFront,
      rz: 0.55 * hFront,
    };
  }

  // Stacked: the 3D sits between the nav and the text card below it.
  const top = H / 2 - nav * hPerPx;
  const bottomApps = H / 2 - (pxH - STACK_APPS_PX - GAP) * hPerPx;
  const bottomIntro = H / 2 - (pxH - STACK_INTRO_PX - GAP) * hPerPx;
  const cap = Math.min(0.42 * H, 0.92 * W);
  // fitBand's axis runs top-down: negate y.
  const apps = fitBand(-top, -bottomApps, REACH_UP, REACH_DOWN, cap);
  const intro = fitBand(-top, -bottomIntro, REACH_UP, REACH_DOWN, cap);
  const fan = fitBand(-top, -bottomIntro, FAN_UP, FAN_DOWN, FAN_RATIO * apps.h);
  const hFront = apps.h;
  return {
    mobile: true,
    W,
    H,
    cx: 0,
    cy: -apps.c,
    hFront,
    cyI: -intro.c,
    hFrontI: intro.h,
    cyFan: -fan.c,
    hFan: fan.h,
    spread: 0.265 * W,
    fanDepth: 0.3 * fan.h,
    rx: 0.34 * W,
    rz: 0.5 * hFront,
  };
}

/** Reduced motion: snap to the nearest stage, phones present whenever in view. */
export function snapStage(t: number) {
  if (t >= 4.75) return 5;
  return Math.min(4, Math.max(1, Math.round(t)));
}

/** Front app (continuous ring index) for t >= 2: holds, then turns over the last quarter. */
function ringIndex(t: number) {
  if (t >= 4) return 2;
  const k = Math.min(1, Math.floor(t - 2));
  const u = t - 2 - k;
  return k + smoother((u - 0.75) / 0.25);
}

export function computeTargets(t: number, L: Layout, cam: { x: number; y: number; z: number }, out: Target[]) {
  const exit = smooth((t - 4.7) / 0.3);
  const fade = 1 - smooth((t - 4.72) / 0.26);
  const toFan = t < 1 ? 0 : smoother(t - 1);
  const c = t < 2 ? 0 : ringIndex(t);
  // The carousel grows into the room the shorter app panel leaves.
  const kb = smooth((t - INTRO_END) / 0.4);
  const hF = lerp(L.hFrontI, L.hFront, kb);
  const cyR = lerp(L.cyI, L.cy, kb);

  for (let i = 0; i < out.length; i++) {
    const o = out[i];

    // --- fan pose ---
    const d = FAN_SLOT[i];
    const ad = Math.abs(d);
    const fx = L.cx + d * L.spread;
    const fy = L.cyFan - ad * 0.035 * L.hFan;
    const fz = -ad * L.fanDepth;
    const fry = -d * 0.34;
    const frz = -d * 0.05;
    const fs = (L.hFan * (1 - 0.06 * ad)) / PHONE_H;

    // --- carousel pose ---
    const phi = ((i - c) * Math.PI * 2) / 3;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    const back = (1 - cos) / 2; // 0 front, 1 directly behind
    const cxp = L.cx + L.rx * sin;
    const cyp = cyR + 0.07 * hF * back;
    const czp = -L.rz * (1 - cos);
    const cry = -0.42 * sin;
    const cs = (hF * (1 - 0.16 * back)) / PHONE_H;

    o.x = lerp(fx, cxp, toFan);
    o.y = lerp(fy, cyp, toFan);
    o.z = lerp(fz, czp, toFan);
    o.rx = 0;
    o.ry = lerp(fry, cry, toFan);
    o.rz = lerp(frz, 0, toFan);
    o.s = lerp(fs, cs, toFan);
    o.front = toFan * Math.pow(Math.max(0, cos), 6);

    // Face the camera (so screens read straight on), then add the pose's own turn.
    o.ry += Math.atan2(cam.x - o.x, cam.z - o.z);
    o.rx += Math.atan2(o.y - cam.y, cam.z - o.z);

    // --- materialise ---
    o.reveal = clamp01((t - 0.15 - REVEAL_ORDER[i] * 0.17) / 0.51);

    // --- exploded UI beat for this app (t in [2+i, 2.9+i], peak ~2.45+i) ---
    const u = t - (2 + i);
    const e = u < 0 ? 0 : smooth((u - 0.04) / 0.28) * (1 - smooth((u - 0.58) / 0.24));
    o.explode = e;
    o.ry += TURN[i] * e;
    o.rx -= 0.1 * e;
    o.x -= TURN[i] * 0.07 * hF * e;
    o.s *= 1 + 0.03 * e;

    // --- exit: rise and dissolve ---
    o.exit = exit;
    o.fade = fade;
    o.y += exit * 0.5 * L.H;
    o.rx -= 0.35 * exit;
  }
}
