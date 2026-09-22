/**
 * Procedural particle targets for the Signal field.
 *
 * Every shape is a Float32Array of `n * 3` positions. Particle `i` in one
 * shape morphs into particle `i` in the next, so all shapes share the same
 * count. The first `sparkCount` indices are the yellow "sparks": in the
 * lightbulb they become the filament, elsewhere they mark highlights
 * (camera, city lights, synapses, the orbit ring).
 */

export const SHAPE_COUNT = 6;

export type SignalShapes = {
  count: number;
  shapes: Float32Array[];
  dir: Float32Array;
  seed: Float32Array;
  spark: Float32Array;
};

type Rng = () => number;

function mulberry32(a: number): Rng {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: Rng) {
  // Box-Muller, one value.
  const u = Math.max(1e-6, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function set(out: Float32Array, i: number, x: number, y: number, z: number) {
  out[i * 3] = x;
  out[i * 3 + 1] = y;
  out[i * 3 + 2] = z;
}

/* ---------------------------------------------------------------- bulb */

function bulbRadius(y: number) {
  if (y >= -0.05) return Math.sqrt(Math.max(0, 1 - (y - 0.6) ** 2));
  if (y >= -0.7) {
    const t = (y + 0.7) / 0.65;
    const s = t * t * (3 - 2 * t);
    return 0.46 + 0.3 * s;
  }
  if (y >= -1.25) return 0.44 + 0.035 * Math.abs(Math.sin(y * 26));
  const t = (y + 1.45) / 0.2;
  return 0.12 + 0.3 * t;
}

function bulb(n: number, sparks: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const yShift = -0.08;

  for (let i = 0; i < n; i++) {
    if (i < sparks) {
      // Filament: a coil across the middle, fed by two support wires.
      const u = rng();
      if (u < 0.62) {
        const k = rng();
        const x = -0.22 + 0.44 * k;
        const y = 0.42 + 0.07 * Math.sin(k * Math.PI * 12);
        const z = 0.07 * Math.cos(k * Math.PI * 12);
        set(out, i, x, y + yShift, z);
      } else {
        const side = rng() < 0.5 ? -1 : 1;
        const k = rng();
        const y = -0.62 + k * 1.02;
        const x = side * (0.1 + 0.12 * k);
        set(out, i, x, y + yShift, 0);
      }
      continue;
    }

    // Surface of revolution, area-weighted by radius (rejection).
    let y = 0;
    let r = 0;
    for (let tries = 0; tries < 12; tries++) {
      y = -1.45 + rng() * 3.05;
      r = bulbRadius(y);
      if (rng() < r) break;
    }
    const theta = rng() * Math.PI * 2;
    const rr = r * (1 - rng() * 0.035);
    set(out, i, rr * Math.cos(theta), y + yShift, rr * Math.sin(theta));
  }
  return out;
}

/* --------------------------------------------------------------- phone */

type Rect = [x0: number, y0: number, x1: number, y1: number];

function roundedRectPoint(
  w: number,
  h: number,
  r: number,
  t: number,
): [number, number] {
  // Walk the perimeter of a rounded rectangle, t in [0, 1).
  const straightW = w - 2 * r;
  const straightH = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const total = 2 * straightW + 2 * straightH + 4 * arc;
  let d = t * total;
  const hw = w / 2;
  const hh = h / 2;

  const segs: Array<[number, (s: number) => [number, number]]> = [
    [straightW, (s) => [-hw + r + s, hh]],
    [arc, (s) => corner(hw - r, hh - r, Math.PI / 2 - s / r)],
    [straightH, (s) => [hw, hh - r - s]],
    [arc, (s) => corner(hw - r, -hh + r, -s / r)],
    [straightW, (s) => [hw - r - s, -hh]],
    [arc, (s) => corner(-hw + r, -hh + r, -Math.PI / 2 - s / r)],
    [straightH, (s) => [-hw, -hh + r + s]],
    [arc, (s) => corner(-hw + r, hh - r, Math.PI - s / r)],
  ];
  function corner(cx: number, cy: number, a: number): [number, number] {
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  for (const [len, fn] of segs) {
    if (d <= len) return fn(d);
    d -= len;
  }
  return [-hw + r, hh];
}

function phone(n: number, sparks: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const W = 1.3;
  const H = 2.62;
  const R = 0.2;
  const D = 0.07;

  // Screen UI blocks in screen-space units (inset from the body).
  const sw = W - 0.14;
  const sh = H - 0.14;
  const sx = (u: number) => -sw / 2 + u * sw;
  const sy = (v: number) => -sh / 2 + v * sh;
  const blocks: Rect[] = [
    [sx(0.08), sy(0.62), sx(0.92), sy(0.88)], // hero card
    [sx(0.08), sy(0.54), sx(0.6), sy(0.575)], // title bar
    [sx(0.08), sy(0.5), sx(0.42), sy(0.52)], // subtitle
  ];
  for (let row = 0; row < 4; row++) {
    const top = 0.44 - row * 0.085;
    blocks.push([sx(0.08), sy(top - 0.055), sx(0.2), sy(top)]); // avatar
    blocks.push([sx(0.26), sy(top - 0.022), sx(0.86), sy(top)]); // line 1
    blocks.push([sx(0.26), sy(top - 0.05), sx(0.62), sy(top - 0.034)]); // line 2
  }
  for (let tab = 0; tab < 4; tab++) {
    const cx = 0.17 + tab * 0.22;
    blocks.push([sx(cx - 0.035), sy(0.04), sx(cx + 0.035), sy(0.075)]);
  }
  const areas = blocks.map(([a, b, c, d]) => (c - a) * (d - b));
  const totalArea = areas.reduce((s, v) => s + v, 0);

  const pickBlock = () => {
    let k = rng() * totalArea;
    for (let b = 0; b < blocks.length; b++) {
      if (k < areas[b]) return blocks[b];
      k -= areas[b];
    }
    return blocks[0];
  };

  for (let i = 0; i < n; i++) {
    if (i < sparks) {
      if (rng() < 0.45) {
        // Dynamic-island pill.
        const [px, py] = roundedRectPoint(0.36, 0.09, 0.045, rng());
        set(out, i, px, H / 2 - 0.16 + py, D + 0.01);
      } else {
        // Highlights on the hero card.
        const b = blocks[0];
        set(
          out,
          i,
          b[0] + rng() * (b[2] - b[0]),
          b[1] + rng() * (b[3] - b[1]),
          D + 0.02,
        );
      }
      continue;
    }
    const u = rng();
    if (u < 0.3) {
      const [px, py] = roundedRectPoint(W, H, R, rng());
      set(out, i, px, py, D);
    } else if (u < 0.4) {
      const [px, py] = roundedRectPoint(W, H, R, rng());
      set(out, i, px, py, -D);
    } else if (u < 0.5) {
      const [px, py] = roundedRectPoint(W, H, R, rng());
      set(out, i, px, py, (rng() * 2 - 1) * D);
    } else {
      const b = pickBlock();
      set(
        out,
        i,
        b[0] + rng() * (b[2] - b[0]),
        b[1] + rng() * (b[3] - b[1]),
        D + 0.005,
      );
    }
  }
  return out;
}

/* --------------------------------------------------------------- globe */

function globe(n: number, sparks: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const R = 1.45;
  const meridians = 12;
  const parallels = 9;

  // City-light clusters.
  const cities: Array<[number, number, number]> = [];
  for (let c = 0; c < 26; c++) {
    const z = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    cities.push([s * Math.cos(a), z, s * Math.sin(a)]);
  }

  const onSphere = (x: number, y: number, z: number, r: number) => {
    const l = Math.hypot(x, y, z) || 1;
    return [(x / l) * r, (y / l) * r, (z / l) * r] as const;
  };

  for (let i = 0; i < n; i++) {
    if (i < sparks) {
      const c = cities[i % cities.length];
      const [x, y, z] = onSphere(
        c[0] + gauss(rng) * 0.05,
        c[1] + gauss(rng) * 0.05,
        c[2] + gauss(rng) * 0.05,
        R * 1.01,
      );
      set(out, i, x, y, z);
      continue;
    }
    const u = rng();
    if (u < 0.3) {
      const lon = (Math.floor(rng() * meridians) / meridians) * Math.PI;
      const a = rng() * Math.PI * 2;
      const x = Math.cos(a) * Math.cos(lon);
      const z = Math.cos(a) * Math.sin(lon);
      set(out, i, x * R, Math.sin(a) * R, z * R);
    } else if (u < 0.55) {
      const lat =
        ((Math.floor(rng() * parallels) + 1) / (parallels + 1)) * Math.PI -
        Math.PI / 2;
      const a = rng() * Math.PI * 2;
      const r = Math.cos(lat) * R;
      set(out, i, Math.cos(a) * r, Math.sin(lat) * R, Math.sin(a) * r);
    } else {
      const z = rng() * 2 - 1;
      const a = rng() * Math.PI * 2;
      const s = Math.sqrt(1 - z * z);
      const r = R * (0.985 + rng() * 0.03);
      set(out, i, s * Math.cos(a) * r, z * r, s * Math.sin(a) * r);
    }
  }
  return out;
}

/* --------------------------------------------------------------- brain */

function brain(n: number, sparks: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const hemis: Array<[number, number, number, number, number, number]> = [
    [-0.52, 0.05, 0, 0.82, 0.95, 1.1],
    [0.52, 0.05, 0, 0.82, 0.95, 1.1],
  ];

  // Nodes inside the two hemispheres.
  const nodes: Array<[number, number, number]> = [];
  while (nodes.length < 36) {
    const h = hemis[nodes.length % 2];
    const x = rng() * 2 - 1;
    const y = rng() * 2 - 1;
    const z = rng() * 2 - 1;
    if (x * x + y * y + z * z > 1) continue;
    nodes.push([h[0] + x * h[3] * 0.9, h[1] + y * h[4] * 0.9, h[2] + z * h[5] * 0.9]);
  }
  // Each node links to its three nearest neighbours.
  const edges: Array<[number, number]> = [];
  nodes.forEach((a, ai) => {
    const near = nodes
      .map((b, bi) => [bi, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])] as const)
      .filter(([bi]) => bi !== ai)
      .sort((p, q) => p[1] - q[1])
      .slice(0, 3);
    for (const [bi] of near) if (ai < bi) edges.push([ai, bi]);
  });

  for (let i = 0; i < n; i++) {
    if (i < sparks) {
      const c = nodes[i % nodes.length];
      set(
        out,
        i,
        c[0] + gauss(rng) * 0.035,
        c[1] + gauss(rng) * 0.035,
        c[2] + gauss(rng) * 0.035,
      );
      continue;
    }
    const u = rng();
    if (u < 0.22) {
      const c = nodes[Math.floor(rng() * nodes.length)];
      set(
        out,
        i,
        c[0] + gauss(rng) * 0.08,
        c[1] + gauss(rng) * 0.08,
        c[2] + gauss(rng) * 0.08,
      );
    } else if (u < 0.6) {
      const [a, b] = edges[Math.floor(rng() * edges.length)];
      const t = rng();
      const pa = nodes[a];
      const pb = nodes[b];
      set(
        out,
        i,
        pa[0] + (pb[0] - pa[0]) * t + gauss(rng) * 0.012,
        pa[1] + (pb[1] - pa[1]) * t + gauss(rng) * 0.012,
        pa[2] + (pb[2] - pa[2]) * t + gauss(rng) * 0.012,
      );
    } else {
      // Folded cortex shell.
      const h = hemis[rng() < 0.5 ? 0 : 1];
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(rng() * 2 - 1);
      const fold = 1 + 0.07 * Math.sin(theta * 7) * Math.sin(phi * 9);
      const x = Math.sin(phi) * Math.cos(theta) * h[3] * fold;
      const y = Math.cos(phi) * h[4] * fold;
      const z = Math.sin(phi) * Math.sin(theta) * h[5] * fold;
      // Flatten the inner face so the hemispheres read as two halves.
      const inner = Math.sign(h[0]) * x < -h[3] * 0.72 ? 0.72 : 1;
      set(out, i, h[0] + x * inner, h[1] + y, h[2] + z);
    }
  }
  return out;
}

/* --------------------------------------------------------------- torus */

function torus(n: number, sparks: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const R = 1.2;
  const r = 0.34;
  const ringR = 1.85;
  const tilt = 1.12;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  const put = (i: number, x: number, y: number, z: number) => {
    // Tilt around X so the ring reads as an ellipse facing the camera.
    set(out, i, x, y * ct - z * st, y * st + z * ct);
  };

  for (let i = 0; i < n; i++) {
    if (i < sparks || rng() < 0.12) {
      const a = rng() * Math.PI * 2;
      const rr = ringR + gauss(rng) * 0.015;
      put(i, Math.cos(a) * rr, gauss(rng) * 0.01, Math.sin(a) * rr);
      continue;
    }
    const u = rng() * Math.PI * 2;
    const v = rng() * Math.PI * 2;
    const rr = r * (0.97 + rng() * 0.06);
    put(
      i,
      (R + rr * Math.cos(v)) * Math.cos(u),
      rr * Math.sin(v),
      (R + rr * Math.cos(v)) * Math.sin(u),
    );
  }
  return out;
}

/* ---------------------------------------------------------------- wave */

function wave(n: number, rng: Rng) {
  const out = new Float32Array(n * 3);
  const cols = Math.round(Math.sqrt(n * 2.2));
  const rows = Math.ceil(n / cols);
  const tilt = 0.42;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = -5.5 + (c / (cols - 1)) * 11 + (rng() - 0.5) * 0.02;
    const z = -3.2 + (r / Math.max(1, rows - 1)) * 5.2;
    const y = 0.22 * Math.sin(x * 0.85) + 0.18 * Math.cos(z * 1.3 + x * 0.4);
    // Tilt the plane toward the camera, then drop it below centre.
    set(out, i, x, y * ct - z * st - 0.9, y * st + z * ct);
  }
  return out;
}

/* ----------------------------------------------------------------- all */

export function buildShapes(n: number): SignalShapes {
  const rng = mulberry32(20260922);
  const sparkCount = Math.round(n * 0.035);

  const dir = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const spark = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const z = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    dir[i * 3] = s * Math.cos(a);
    dir[i * 3 + 1] = z;
    dir[i * 3 + 2] = s * Math.sin(a);
    seed[i] = rng();
    spark[i] = i < sparkCount ? 1 : 0;
  }

  const shapes = [
    bulb(n, sparkCount, rng),
    phone(n, sparkCount, rng),
    globe(n, sparkCount, rng),
    brain(n, sparkCount, rng),
    torus(n, sparkCount, rng),
    wave(n, rng),
  ];

  // Wave sparks: scatter the yellow indices across the grid instead of
  // bunching them in the first rows.
  const w = shapes[5];
  for (let i = 0; i < sparkCount; i++) {
    const j = sparkCount + Math.floor(rng() * (n - sparkCount));
    for (let k = 0; k < 3; k++) {
      const tmp = w[i * 3 + k];
      w[i * 3 + k] = w[j * 3 + k];
      w[j * 3 + k] = tmp;
    }
  }

  return { count: n, shapes, dir, seed, spark };
}
