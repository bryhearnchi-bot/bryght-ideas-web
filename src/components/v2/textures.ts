import * as THREE from "three";
import { siteConfig } from "@/config/site";

const BLUE = "#1E90F0";
const BLACK = "#111111";
const YELLOW = "#FFD23F";
const OFFWHITE = "#F7FAFF";

// Same aspect as the real screenshots (1320 x 2868), at half resolution.
const W = 660;
const H = 1434;

function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawAhoy(ctx: CanvasRenderingContext2D) {
  const app = siteConfig.apps.find((a) => a.name === "Ahoy") ?? siteConfig.apps[2];
  const display = fontFamily("--font-bricolage", "'Arial Black', Arial, sans-serif");
  const body = fontFamily("--font-dm-sans", "Arial, sans-serif");

  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, W, H);

  // Sun
  ctx.lineWidth = 6;
  ctx.strokeStyle = BLACK;
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(486, 420, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Category
  ctx.fillStyle = BLACK;
  ctx.font = `700 26px ${body}`;
  ctx.textBaseline = "alphabetic";
  const cat = app.category.toUpperCase().split("").join(String.fromCharCode(8202));
  ctx.fillText(cat, 56, 176);

  // Name
  ctx.font = `800 196px ${display}`;
  ctx.fillText(app.name, 44, 370);

  // Ship: hull, cabin, funnel
  const sx = 150;
  const sy = 700;
  ctx.lineWidth = 6;
  ctx.fillStyle = OFFWHITE;
  roundRect(ctx, sx + 70, sy - 110, 230, 80, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = BLACK;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(sx + 112 + i * 50, sy - 70, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = YELLOW;
  roundRect(ctx, sx + 210, sy - 190, 60, 82, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(sx - 10, sy - 30);
  ctx.lineTo(sx + 380, sy - 30);
  ctx.lineTo(sx + 330, sy + 50);
  ctx.lineTo(sx + 40, sy + 50);
  ctx.closePath();
  ctx.fill();

  // Waves
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let row = 0; row < 5; row++) {
    const y = sy + 60 + row * 52;
    ctx.beginPath();
    for (let x = 30; x <= W - 30; x += 6) {
      const yy = y + Math.sin((x + row * 40) / 34) * 12;
      if (x === 30) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Description
  ctx.fillStyle = BLACK;
  ctx.font = `500 34px ${body}`;
  wrap(ctx, app.description, W - 112).forEach((line, i) => {
    ctx.fillText(line, 56, 1060 + i * 46);
  });

  // Status pill
  ctx.font = `700 28px ${body}`;
  const label = app.status.toUpperCase();
  const pw = ctx.measureText(label).width + 64;
  roundRect(ctx, 56, 1260, pw, 72, 36);
  ctx.fillStyle = BLACK;
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.fillText(label, 88, 1306);
}

/**
 * Ahoy has no screenshot yet, so its phone shows a designed
 * "in development" screen painted into a canvas.
 */
export function createAhoyTexture(onUpdate?: () => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (!ctx) return texture;
  drawAhoy(ctx);
  // Repaint once the web fonts are ready so the name renders in Bricolage.
  document.fonts?.ready.then(() => {
    drawAhoy(ctx);
    texture.needsUpdate = true;
    onUpdate?.();
  });
  return texture;
}

/** Soft diagonal glare that sits over each screen like glass. */
export function createGlareTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 64, 128);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(0.32, "rgba(255,255,255,0.12)");
    g.addColorStop(0.33, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
