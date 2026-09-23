import * as THREE from "three";
import { siteConfig } from "@/config/site";
import { layerRect } from "./geometry";
import type { LayerSpec } from "./ui-layers";

/* ------------------------------------------------------------------ */
/* Ahoy blueprint screen                                                */
/* ------------------------------------------------------------------ */

// Same aspect as the real screenshots (1320 x 2868).
const BW = 720;
const BH = Math.round(BW * (2868 / 1320));

type Box = { x0: number; x1: number; y0: number; y1: number };

/** Wireframe boxes on the blueprint screen (normalised, y from the top). */
const BOX = {
  header: { x0: 0.055, x1: 0.945, y0: 0.056, y1: 0.114 },
  hero: { x0: 0.055, x1: 0.945, y0: 0.134, y1: 0.45 },
  stamp: { x0: 0.09, x1: 0.53, y0: 0.4, y1: 0.434 },
  rows: { x0: 0.055, x1: 0.945, y0: 0.5, y1: 0.806 },
  tabs: { x0: 0.17, x1: 0.83, y0: 0.912, y1: 0.97 },
} satisfies Record<string, Box>;

const R = (b: Box) => ({ x: b.x0 * BW, y: b.y0 * BH, w: (b.x1 - b.x0) * BW, h: (b.y1 - b.y0) * BH });
const toSrcPx = (px: number) => (px * 1320) / BW;

/** The blueprint's exploded layers: the wireframe boxes lift off. */
export const AHOY_LAYERS: LayerSpec[] = [
  { ...BOX.hero, radius: toSrcPx(34), lift: 0.26 },
  { ...BOX.stamp, radius: toSrcPx(((BOX.stamp.y1 - BOX.stamp.y0) * BH) / 2), lift: 0.5, parent: 0 },
  { ...BOX.header, radius: toSrcPx(20), lift: 0.2 },
  { ...BOX.rows, radius: toSrcPx(26), lift: 0.24 },
  { ...BOX.tabs, radius: toSrcPx(((BOX.tabs.y1 - BOX.tabs.y0) * BH) / 2), lift: 0.36 },
];

const INK = "#CFE6FF";
const LINE = "rgba(110,184,255,0.95)";
const LINE_SOFT = "rgba(110,184,255,0.45)";
const FILL = "rgba(30,144,240,0.08)";
const YELLOW = "#FFD23F";

function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

function box(ctx: CanvasRenderingContext2D, b: Box, r: number, fill = FILL) {
  const { x, y, w, h } = R(b);
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.stroke();
}

/** Placeholder "text" bar, the wireframe way. */
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h = 12, a = 0.5) {
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = `rgba(150,200,255,${a})`;
  ctx.fill();
}

function drawBlueprint(ctx: CanvasRenderingContext2D) {
  const app = siteConfig.apps.find((a) => a.name === "Ahoy") ?? siteConfig.apps[2];
  const display = fontFamily("--font-bricolage", "'Arial Black', Arial, sans-serif");
  const body = fontFamily("--font-dm-sans", "Arial, sans-serif");

  // Paper
  const bg = ctx.createLinearGradient(0, 0, 0, BH);
  bg.addColorStop(0, "#061a36");
  bg.addColorStop(1, "#04112a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, BW, BH);

  // Drafting grid: minor and major lines.
  ctx.lineWidth = 1;
  for (let x = 0; x <= BW; x += 18) {
    ctx.strokeStyle = x % 90 === 0 ? "rgba(30,144,240,0.2)" : "rgba(30,144,240,0.08)";
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, BH);
    ctx.stroke();
  }
  for (let y = 0; y <= BH; y += 18) {
    ctx.strokeStyle = y % 90 === 0 ? "rgba(30,144,240,0.2)" : "rgba(30,144,240,0.08)";
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(BW, y + 0.5);
    ctx.stroke();
  }

  // Status bar
  bar(ctx, 64, 30, 70, 14, 0.55);
  bar(ctx, BW - 150, 30, 26, 14, 0.4);
  bar(ctx, BW - 116, 30, 26, 14, 0.4);
  rr(ctx, BW - 80, 28, 40, 18, 6);
  ctx.strokeStyle = LINE_SOFT;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header: wordmark + avatar
  box(ctx, BOX.header, 20);
  {
    const { x, y, w, h } = R(BOX.header);
    ctx.fillStyle = INK;
    ctx.font = `800 54px ${display}`;
    ctx.textBaseline = "middle";
    ctx.fillText(app.name, x + 26, y + h / 2 + 2);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + w - 46, y + h / 2, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w - 46, y + h / 2 - 5, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Hero card: category, ship drawing, sun, waves, status stamp.
  box(ctx, BOX.hero, 34, "rgba(30,144,240,0.1)");
  {
    const { x, y, w, h } = R(BOX.hero);
    ctx.save();
    rr(ctx, x, y, w, h, 34);
    ctx.clip();

    ctx.fillStyle = "rgba(207,230,255,0.8)";
    ctx.font = `700 20px ${body}`;
    ctx.textBaseline = "alphabetic";
    const cat = app.category.toUpperCase().split("").join(String.fromCharCode(8202));
    ctx.fillText(cat, x + 32, y + 50);

    // Sun
    const sunX = x + w * 0.76;
    const sunY = y + h * 0.3;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = LINE_SOFT;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ship (line drawing)
    const sx = x + w * 0.16;
    const sy = y + h * 0.66;
    const sw = w * 0.62;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.beginPath(); // hull
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + sw, sy);
    ctx.lineTo(sx + sw * 0.9, sy + 52);
    ctx.lineTo(sx + sw * 0.08, sy + 52);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); // hull stripe
    ctx.moveTo(sx + sw * 0.04, sy + 18);
    ctx.lineTo(sx + sw * 0.97, sy + 18);
    ctx.stroke();
    rr(ctx, sx + sw * 0.12, sy - 50, sw * 0.7, 50, 6); // deck 1
    ctx.stroke();
    rr(ctx, sx + sw * 0.22, sy - 92, sw * 0.46, 42, 6); // deck 2
    ctx.stroke();
    rr(ctx, sx + sw * 0.52, sy - 150, 40, 58, 5); // funnel
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + sw * 0.52, sy - 132);
    ctx.lineTo(sx + sw * 0.52 + 40, sy - 132);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(sx + sw * 0.18 + i * sw * 0.09, sy - 25, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      rr(ctx, sx + sw * 0.27 + i * sw * 0.1, sy - 80, sw * 0.06, 18, 3);
      ctx.stroke();
    }

    // Waves
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let row = 0; row < 3; row++) {
      const wy = sy + 74 + row * 30;
      ctx.globalAlpha = 1 - row * 0.25;
      ctx.beginPath();
      for (let px = x + 10; px <= x + w - 10; px += 6) {
        const yy = wy + Math.sin((px + row * 50) / 26) * 7;
        if (px === x + 10) ctx.moveTo(px, yy);
        else ctx.lineTo(px, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Dimension line down the right side of the card.
    const dx = x + w + 18;
    ctx.strokeStyle = LINE_SOFT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx, y);
    ctx.lineTo(dx, y + h);
    ctx.moveTo(dx - 8, y);
    ctx.lineTo(dx + 8, y);
    ctx.moveTo(dx - 8, y + h);
    ctx.lineTo(dx + 8, y + h);
    ctx.stroke();
  }

  // "In development" stamp (the app's real status).
  {
    const { x, y, w, h } = R(BOX.stamp);
    rr(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = "rgba(255,210,63,0.14)";
    ctx.fill();
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 3;
    ctx.stroke();
    rr(ctx, x + 6, y + 6, w - 12, h - 12, (h - 12) / 2);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = YELLOW;
    ctx.font = `700 22px ${body}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const label = app.status.toUpperCase().split("").join(String.fromCharCode(8202));
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    ctx.textAlign = "left";
  }

  // List rows
  box(ctx, BOX.rows, 26, "rgba(30,144,240,0.05)");
  {
    const { x, y, w, h } = R(BOX.rows);
    const rowH = h / 3;
    for (let i = 0; i < 3; i++) {
      const ry = y + i * rowH;
      if (i > 0) {
        ctx.strokeStyle = LINE_SOFT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 24, ry);
        ctx.lineTo(x + w - 24, ry);
        ctx.stroke();
      }
      const ic = rowH * 0.52;
      rr(ctx, x + 28, ry + (rowH - ic) / 2, ic, ic, 16);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 3;
      ctx.stroke();
      // Cross in the image placeholder
      ctx.strokeStyle = LINE_SOFT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 28, ry + (rowH - ic) / 2);
      ctx.lineTo(x + 28 + ic, ry + (rowH + ic) / 2);
      ctx.moveTo(x + 28 + ic, ry + (rowH - ic) / 2);
      ctx.lineTo(x + 28, ry + (rowH + ic) / 2);
      ctx.stroke();
      bar(ctx, x + 56 + ic, ry + rowH * 0.34, w * (0.42 - i * 0.06), 16, 0.7);
      bar(ctx, x + 56 + ic, ry + rowH * 0.56, w * (0.3 + i * 0.04), 12, 0.35);
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w - 46, ry + rowH / 2 - 12);
      ctx.lineTo(x + w - 34, ry + rowH / 2);
      ctx.lineTo(x + w - 46, ry + rowH / 2 + 12);
      ctx.stroke();
    }
  }

  // Tab bar
  {
    const { x, y, w, h } = R(BOX.tabs);
    rr(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = "rgba(30,144,240,0.12)";
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const cx = x + (w / 4) * (i + 0.5);
      ctx.beginPath();
      ctx.arc(cx, y + h / 2, 16, 0, Math.PI * 2);
      if (i === 0) {
        ctx.fillStyle = "rgba(30,144,240,0.55)";
        ctx.fill();
      }
      ctx.stroke();
    }
  }

  // Home indicator
  bar(ctx, BW / 2 - 90, BH - 22, 180, 8, 0.6);

  // Corner registration marks
  ctx.strokeStyle = LINE_SOFT;
  ctx.lineWidth = 2;
  for (const [cx, cy] of [
    [28, 76],
    [BW - 28, 76],
    [28, BH - 60],
    [BW - 28, BH - 60],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  }
}

/** Canvas texture of the Ahoy blueprint screen; repaints once fonts load. */
export function createBlueprintTexture(onUpdate?: () => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = BW;
  canvas.height = BH;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (!ctx) return texture;
  drawBlueprint(ctx);
  document.fonts?.ready.then(() => {
    drawBlueprint(ctx);
    texture.needsUpdate = true;
    onUpdate?.();
  });
  return texture;
}

/* ------------------------------------------------------------------ */
/* Glows and shadows                                                    */
/* ------------------------------------------------------------------ */

/** Soft white radial falloff, tinted per phone for the screen light spill. */
export function createSpillTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (let i = 0; i <= 10; i++) {
      const f = i / 10;
      // Gaussian-like falloff, zero at the rim.
      const a = Math.exp(-f * f * 4.2) * (1 - f);
      g.addColorStop(f, `rgba(255,255,255,${a.toFixed(3)})`);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Shadow padding around a lifted layer, in phone units. */
export const SHADOW_PAD = 0.09;

/**
 * Blurred rounded-rect shadow for one lifted layer, drawn at the layer's own
 * aspect so the blur stays even on wide elements like tab bars.
 */
export function createLayerShadowTexture(l: LayerSpec): THREE.CanvasTexture {
  const { w, h, r } = layerRect(l);
  const ppu = 220;
  const cw = Math.ceil((w + SHADOW_PAD * 2) * ppu);
  const ch = Math.ceil((h + SHADOW_PAD * 2) * ppu);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const off = 4000;
    ctx.shadowColor = "rgba(0,0,0,1)";
    ctx.shadowBlur = SHADOW_PAD * ppu * 0.55;
    ctx.shadowOffsetX = off;
    rr(ctx, SHADOW_PAD * ppu - off, SHADOW_PAD * ppu, w * ppu, h * ppu, r * ppu);
    ctx.fillStyle = "#000";
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
