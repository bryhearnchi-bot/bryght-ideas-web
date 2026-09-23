import * as THREE from "three";
import { layerRect } from "./geometry";
import type { LayerSpec } from "./ui-layers";

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
