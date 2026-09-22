/**
 * Where each phone sits in each scroll state.
 *
 * x / y are fractions of the half-viewport at z = 0 (so 1 = right/top edge),
 * z is world units toward the camera, s is the phone's height as a fraction of
 * the viewport height. Rotations are radians.
 */
export type Pose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
};

export type Layout = "desktop" | "mobile";

const P = (
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  s: number,
): Pose => ({ x, y, z, rx, ry, rz, s });

const PHONES = 3;

function heroPoses(layout: Layout): Pose[] {
  if (layout === "mobile") {
    return [
      P(-0.44, -0.13, 0.2, 0.05, 0.36, 0.08, 0.29),
      P(0.03, -0.08, -0.4, 0, -0.1, -0.03, 0.31),
      P(0.48, -0.16, -1.1, 0.05, -0.38, -0.08, 0.28),
    ];
  }
  return [
    P(0.34, -0.07, 0.5, 0.06, 0.38, 0.08, 0.5),
    P(0.6, 0.04, -0.3, 0, -0.16, -0.04, 0.54),
    P(0.84, -0.1, -1.2, 0.05, -0.44, -0.08, 0.48),
  ];
}

function fanPoses(layout: Layout): Pose[] {
  if (layout === "mobile") {
    return [
      P(-0.46, 0.34, -0.4, 0, 0.5, 0.12, 0.31),
      P(0, 0.4, 0.3, 0, 0, 0, 0.35),
      P(0.46, 0.34, -0.4, 0, -0.5, -0.12, 0.31),
    ];
  }
  return [
    P(0.22, -0.04, -0.2, 0, 0.55, 0.16, 0.54),
    P(0.49, 0.03, 0.5, 0, 0, 0, 0.58),
    P(0.75, -0.04, -0.2, 0, -0.55, -0.16, 0.54),
  ];
}

function appPoses(layout: Layout, active: number): Pose[] {
  const out: Pose[] = [];
  for (let i = 0; i < PHONES; i++) {
    const d = i - active;
    if (layout === "mobile") {
      // Inactive phones wait fully below the fold (next) or leave above it (done).
      if (d === 0) out.push(P(0, 0.37, 0.5, 0.04, -0.14, 0, 0.5));
      else if (d > 0) out.push(P(0.35 + 0.2 * d, -2.4 - 0.4 * d, -2, 0.4, -0.6, 0.2, 0.42));
      else out.push(P(-0.35 + 0.2 * d, 2.6 - 0.4 * d, -2, -0.4, 0.6, -0.2, 0.4));
    } else {
      // Inactive phones wait fully below the fold (next) or leave above it (done),
      // so nothing ever peeks in at the viewport edge.
      if (d === 0) out.push(P(0.44, 0, 0.8, 0.04, -0.22, 0, 0.72));
      else if (d > 0) out.push(P(0.62 + 0.1 * d, -2.3 - 0.4 * d, -2, 0.4, -0.7, 0.2, 0.56));
      else out.push(P(0.3 + 0.1 * d, 2.5 - 0.4 * d, -2, -0.4, 0.7, -0.2, 0.52));
    }
  }
  return out;
}

/** poses[state][phone] */
export function buildPoses(layout: Layout): Pose[][] {
  return [heroPoses(layout), fanPoses(layout), appPoses(layout, 0), appPoses(layout, 1), appPoses(layout, 2)];
}

const ease = (f: number) => f * f * (3 - 2 * f);

/** Blend between the two states either side of t (eased). Writes into `out`. */
export function poseAt(poses: Pose[][], t: number, phone: number, out: Pose): Pose {
  const max = poses.length - 1;
  const c = Math.min(Math.max(t, 0), max);
  const k = Math.min(Math.floor(c), max - 1);
  const f = ease(c - k);
  const a = poses[k][phone];
  const b = poses[k + 1][phone];
  out.x = a.x + (b.x - a.x) * f;
  out.y = a.y + (b.y - a.y) * f;
  out.z = a.z + (b.z - a.z) * f;
  out.rx = a.rx + (b.rx - a.rx) * f;
  out.ry = a.ry + (b.ry - a.ry) * f;
  out.rz = a.rz + (b.rz - a.rz) * f;
  out.s = a.s + (b.s - a.s) * f;
  return out;
}

/** Same breakpoint the CSS uses: narrow or portrait screens get the stacked layout. */
export function layoutFor(width: number, height: number): Layout {
  return width < 768 || width / height < 0.9 ? "mobile" : "desktop";
}
