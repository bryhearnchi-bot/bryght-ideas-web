/**
 * The founder photo and how every view of it is cropped. The HTML image, the
 * WebGL photo card and the particle halftone all use the same 4:5 cover crop
 * centred on the face, so they line up exactly.
 */

export const PHOTO = {
  src: "/bryan-hearn.jpg",
  /** Source size (a landscape selfie). */
  width: 4032,
  height: 3024,
  /**
   * Horizontal crop position as a CSS object-position fraction: the crop
   * starts at FOCUS_X * (1 - cropWidth), which centres his face (at ~47% of
   * the frame) in the 4:5 card.
   */
  focusX: 0.425,
};

/** Card aspect (width / height). */
export const CARD_ASPECT = 4 / 5;

/** The cover crop as fractions of the source: x0, y0, width, height. */
export function photoCrop(imgW = PHOTO.width, imgH = PHOTO.height) {
  const src = imgW / imgH;
  if (src > CARD_ASPECT) {
    const w = CARD_ASPECT / src;
    return { x: (1 - w) * PHOTO.focusX, y: 0, w, h: 1 };
  }
  const h = src / CARD_ASPECT;
  return { x: 0, y: (1 - h) * 0.5, w: 1, h };
}

/** CSS object-position that reproduces photoCrop(). */
export const PHOTO_OBJECT_POSITION = `${PHOTO.focusX * 100}% 50%`;

/** The source is large: always load it through the Next image optimiser. */
export const optimisedPhoto = (w: number) => `/_next/image?url=${encodeURIComponent(PHOTO.src)}&w=${w}&q=75`;

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Soft head-and-shoulders mask in crop coordinates (u right, v down, 0..1).
 * The background is a busy red and white stripe; the halftone keeps only a
 * ghost of it so his silhouette reads first.
 */
function subjectMask(u: number, v: number) {
  // Head (a little taller than wide, in crop pixels).
  const hx = (u - 0.49) / 0.2;
  const hy = (v - 0.455) / 0.205;
  const head = 1 - smooth(0.82, 1.08, Math.hypot(hx, hy));
  // Neck and shoulders: everything below a shallow curve.
  const top = 0.6 + 0.55 * (u - 0.49) * (u - 0.49);
  const body = smooth(top - 0.03, top + 0.04, v);
  const neck = (1 - smooth(0.1, 0.16, Math.abs(u - 0.47))) * smooth(0.56, 0.62, v);
  return Math.max(head, body, neck);
}

// Halftone tuning.
const SHARPEN = 0.45;
const GAMMA = 0.85;
const FLOOR = 0.2;
const GHOST = 0.2;
const RIM = 0.12;

/**
 * Sample the photo into a cols x rows halftone tone map (row-major from the
 * top-left, 0 = dark, 1 = bright). Resolves null if the image fails.
 */
export async function sampleTones(cols: number, rows: number): Promise<Float32Array | null> {
  const img = new Image();
  img.decoding = "async";
  img.src = optimisedPhoto(384);
  try {
    await img.decode();
  } catch {
    return null;
  }
  const crop = photoCrop(img.naturalWidth, img.naturalHeight);
  // Draw at 2x and average 2x2 blocks: a smoother tone per halftone cell.
  const canvas = document.createElement("canvas");
  canvas.width = cols * 2;
  canvas.height = rows * 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    crop.x * img.naturalWidth,
    crop.y * img.naturalHeight,
    crop.w * img.naturalWidth,
    crop.h * img.naturalHeight,
    0,
    0,
    cols * 2,
    rows * 2,
  );
  const px = ctx.getImageData(0, 0, cols * 2, rows * 2).data;
  const W2 = cols * 2;

  const n = cols * rows;
  const lum = new Float32Array(n);
  const mask = new Float32Array(n);
  const inside: number[] = [];
  for (let k = 0; k < n; k++) {
    const cx = (k % cols) * 2;
    const cy = Math.floor(k / cols) * 2;
    let l = 0;
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const o = ((cy + dy) * W2 + cx + dx) * 4;
        // Linearise roughly (gamma 2) before averaging, back after.
        const r = px[o] / 255;
        const g = px[o + 1] / 255;
        const b = px[o + 2] / 255;
        l += (0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b) / 4;
      }
    }
    lum[k] = Math.sqrt(l);
    const u = ((k % cols) + 0.5) / cols;
    const v = (Math.floor(k / cols) + 0.5) / rows;
    mask[k] = subjectMask(u, v);
    if (mask[k] > 0.9) inside.push(lum[k]);
  }
  // Stretch the subject's own range so the face uses the whole scale.
  inside.sort((a, b) => a - b);
  const lo = inside[Math.floor(inside.length * 0.04)] ?? 0;
  const hi = inside[Math.floor(inside.length * 0.99)] ?? 1;

  // Gentle unsharp mask: features (glasses, smile) survive the coarse pitch.
  const blur = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let s = 0;
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          s += lum[yy * cols + xx];
          c++;
        }
      }
      blur[y * cols + x] = s / c;
    }
  }

  const out = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const sharp = lum[k] + SHARPEN * (lum[k] - blur[k]);
    const t = Math.pow(Math.min(1, Math.max(0, (sharp - lo) / Math.max(0.05, hi - lo))), GAMMA);
    const m = mask[k];
    // The subject sits on a floor so the whole silhouette (shoulders too)
    // reads as lit; its outline gets a faint rim; the stripes stay a ghost.
    const subject = FLOOR + (1 - FLOOR) * t;
    const rim = 4 * m * (1 - m);
    out[k] = Math.min(1, m * subject + (1 - m) * t * GHOST + rim * RIM);
  }
  return out;
}
