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
      P(-0.5, -0.2, 0.2, 0.05, 0.4, 0.1, 0.34),
      P(0.04, -0.13, -0.4, 0, -0.08, -0.04, 0.36),
      P(0.56, -0.24, -1.1, 0.05, -0.42, -0.1, 0.33),
    ];
  }
  return [
    P(0.3, -0.08, 0.6, 0.08, 0.42, 0.1, 0.6),
    P(0.58, 0.07, -0.4, 0, -0.12, -0.05, 0.64),
    P(0.86, -0.14, -1.6, 0.06, -0.5, -0.1, 0.6),
  ];
}

function fanPoses(layout: Layout): Pose[] {
  if (layout === "mobile") {
    return [
      P(-0.56, 0.36, -0.4, 0, 0.5, 0.14, 0.36),
      P(0, 0.42, 0.3, 0, 0, 0, 0.38),
      P(0.56, 0.36, -0.4, 0, -0.5, -0.14, 0.36),
    ];
  }
  return [
    P(0.24, -0.04, -0.2, 0, 0.55, 0.16, 0.56),
    P(0.52, 0.04, 0.5, 0, 0, 0, 0.6),
    P(0.8, -0.04, -0.2, 0, -0.55, -0.16, 0.56),
  ];
}

function appPoses(layout: Layout, active: number): Pose[] {
  const out: Pose[] = [];
  for (let i = 0; i < PHONES; i++) {
    const d = i - active;
    if (layout === "mobile") {
      if (d === 0) out.push(P(0, 0.37, 0.5, 0.04, -0.14, 0, 0.5));
      else if (d > 0) out.push(P(1.1 + 0.2 * (d - 1), 0.3, -2 - d, 0.15, -1.15, 0.2, 0.42));
      else out.push(P(-1.1 + 0.2 * (d + 1), 0.5, -2.5 + d, -0.15, 1.2, -0.2, 0.4));
    } else {
      if (d === 0) out.push(P(0.42, 0, 1, 0.04, -0.2, 0, 0.72));
      else if (d > 0) out.push(P(0.84 + 0.14 * (d - 1), -0.72, -2.4 - d, 0.2, -1.2, 0.25, 0.56));
      else out.push(P(0.86 + 0.1 * (d + 1), 0.92, -3 + d, -0.2, 1.3, -0.22, 0.52));
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
