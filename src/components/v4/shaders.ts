/**
 * Signal Orbit particle shaders.
 *
 * Shapes 0-4 and 6 live in the field group's local space (modelMatrix).
 * Shape 5, the phone trio, is in phone-local units and is placed in the
 * world by the anchor matrix of the phone the particle belongs to, so the
 * outlines ride along with the 3D phones wherever the rig puts them.
 * Shape 7, the founder portrait, is in card-local units and is placed by the
 * founder card's anchor (uCardMat) the same way. All are blended in WORLD
 * space:
 *   world = modelMatrix * vec4(sum_{k!=5,7} w_k p_k, sum_{k!=5,7} w_k)
 *         + w5 * (uPhoneMat[phone] * vec4(aP5, 1))
 *         + w7 * (uCardMat * vec4(aP7 + relief, 1))
 *
 * The wave (6) also carries HTML ripples (fx-store.ts): uRipple[i] is
 * (ndc x, ndc y, age in seconds, strength); a ring expands from each one in
 * screen space and lifts and brightens the wave particles it passes.
 */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
uniform float uDim;
uniform vec3 uPointer;
uniform float uPointerStrength;
uniform mat4 uPhoneMat[3];
uniform float uPhoneGlow[3];
uniform float uPhoneSize;
uniform float uPhoneAlpha;
uniform mat4 uCardMat;
uniform float uCardReveal;
uniform float uCardHold;
uniform vec3 uCardHover;
uniform float uCardPx;
uniform float uRelief;
uniform float uCardScale;
uniform vec4 uRipple[4];
uniform float uAspect;

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aP6;
attribute vec3 aP7;
attribute float aTone;
attribute vec3 aDir;
attribute float aSeed;
attribute float aSpark;
attribute float aPhone;
attribute float aKind;

varying vec3 vColor;
varying float vAlpha;
varying float vHard;

// Analytic curl of a sine potential field: divergence-free drift.
vec3 curl(vec3 p, float t) {
  float a1 = 1.7, b1 = 1.3, a2 = 1.9, b2 = 1.1, a3 = 1.5, b3 = 1.7;
  float cx = -b3 * sin(a3 * p.x + t) * sin(b3 * p.y) - a2 * cos(a2 * p.z + t) * cos(b2 * p.x);
  float cy = -b1 * sin(a1 * p.y + t) * sin(b1 * p.z) - a3 * cos(a3 * p.x + t) * cos(b3 * p.y);
  float cz = -b2 * sin(a2 * p.z + t) * sin(b2 * p.x) - a1 * cos(a1 * p.y + t) * cos(b1 * p.z);
  return vec3(cx, cy, cz) * 0.25;
}

void main() {
  // Staggered morph: each particle leaves a little earlier or later.
  float base = floor(uMorph);
  float f = uMorph - base;
  float start = aSeed * 0.35;
  float fs = smoothstep(start, start + 0.65, f);
  float m = base + fs;

  float w0 = clamp(1.0 - abs(m - 0.0), 0.0, 1.0);
  float w1 = clamp(1.0 - abs(m - 1.0), 0.0, 1.0);
  float w2 = clamp(1.0 - abs(m - 2.0), 0.0, 1.0);
  float w3 = clamp(1.0 - abs(m - 3.0), 0.0, 1.0);
  float w4 = clamp(1.0 - abs(m - 4.0), 0.0, 1.0);
  float w5 = clamp(1.0 - abs(m - 5.0), 0.0, 1.0);
  float w6 = clamp(1.0 - abs(m - 6.0), 0.0, 1.0);
  float w7 = clamp(1.0 - abs(m - 7.0), 0.0, 1.0);

  // Group-space part (every shape but the phone trio and the portrait).
  vec3 p = position * w0 + aP1 * w1 + aP2 * w2 + aP3 * w3 + aP4 * w4 + aP6 * w6;
  float wl = 1.0 - w5 - w7;

  // Portrait roles (see TONE in shapes.ts): halftone dot, outline, corner.
  float isGrid = step(-0.5, aTone) * step(aTone, 1.5);
  float isBorder = step(1.5, aTone) * step(aTone, 2.5);
  float isCorner = step(2.5, aTone);
  float tone = clamp(aTone, 0.0, 1.0);
  // Bright dots stand a little proud of the card, dark ones sink: a tilt
  // shows the relief.
  vec3 p7 = aP7;
  p7.z += (tone - 0.5) * uRelief * isGrid;

  // Wave field keeps rolling.
  p.y += w6 * (sin(p.x * 0.9 + uTime * 0.7 + p.z * 0.8) * 0.16 + sin(p.z * 1.7 - uTime * 0.5) * 0.06);

  int ph = int(aPhone + 0.5);
  vec4 world = modelMatrix * vec4(p, wl);
  world.xyz += w5 * (uPhoneMat[ph] * vec4(aP5, 1.0)).xyz;
  // Relief without rest-state parallax: the card sits off-axis, so pull
  // each dot back onto the ray it would have at z = 0. Only a tilt (which
  // turns the relief sideways) shows the depth.
  vec4 card = uCardMat * vec4(p7, 1.0);
  float restDz = (p7.z - aP7.z) * uCardScale;
  card.xy -= (card.xy - cameraPosition.xy) * restDz / max(cameraPosition.z - card.z, 0.1);
  world.xyz += w7 * card.xyz;
  world.w = 1.0;

  // Mid-flight the particles burst outward, then regroup.
  float flight = sin(3.14159265 * fs);
  world.xyz += aDir * flight * (0.35 + aSeed * 0.5);

  // Curl drift, nearly still on the phone outlines and the halftone so
  // they stay crisp.
  float drift = mix(mix(0.05, 0.006, w5), 0.0015, w7);
  world.xyz += curl(world.xyz * 0.9 + aSeed * 3.0, uTime * 0.35) * (drift + 0.25 * flight);

  vec2 d = world.xy - uPointer.xy;
  float dist = length(d);
  float push = uPointerStrength * (1.0 - smoothstep(0.0, 1.1, dist)) * mix(1.0, 0.3, w5) * mix(1.0, 0.1, w7);
  world.xy += (d / max(dist, 0.001)) * push * 0.42;

  // Ripples from the HTML above: a ring that runs outward through the wave.
  float lift = 0.0;
  if (w6 > 0.001) {
    vec4 c0 = projectionMatrix * viewMatrix * world;
    vec2 ndc = c0.xy / max(c0.w, 0.0001);
    for (int i = 0; i < 4; i++) {
      vec4 r = uRipple[i];
      if (r.z < 0.0 || r.z > 1.6) continue;
      float rd = length((ndc - r.xy) * vec2(uAspect, 1.0));
      float k = rd - (0.06 + r.z * 0.62);
      float fade = smoothstep(0.0, 0.12, r.z) * pow(1.0 - r.z / 1.6, 1.3);
      // A soft crest with a faint trough just inside it.
      lift += (exp(-k * k / 0.008) - 0.35 * exp(-(k + 0.1) * (k + 0.1) / 0.005)) * fade * r.w;
    }
    lift *= w6;
    world.y += lift * 0.07;
    world.z += lift * 0.12;
  }

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  // Screen dots are finer than the rim; sparks a touch larger.
  float isInner = step(0.5, aKind) * step(aKind, 1.5);
  float phoneSize = uPhoneSize * mix(1.0, 0.72, isInner);
  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + aSpark * 0.7) * mix(1.0, phoneSize, w5);
  float ps = size * uPixelRatio / max(-mv.z, 0.1) * (1.0 + max(lift, 0.0) * 0.5);
  // Portrait: a true halftone on the card's own pixel pitch, dot size by tone.
  float dotScale = isGrid * mix(0.14, 1.42, pow(tone, 0.9)) + isBorder * 0.9 + isCorner * 1.6;
  gl_PointSize = mix(ps, uCardPx * dotScale, w7);
  vHard = w7 * isGrid;

  vec3 blueBlock = vec3(0.118, 0.565, 0.941);
  vec3 blueInk = vec3(0.082, 0.396, 0.847);
  vec3 ice = vec3(0.72, 0.86, 1.0);
  vec3 yellow = vec3(1.0, 0.824, 0.247);
  float pick = fract(aSeed * 7.13);
  vec3 c = mix(blueInk, blueBlock, smoothstep(0.2, 0.8, pick));
  c = mix(c, ice, step(0.94, pick) * 0.7);
  // The phone rim leans icier so the silhouette reads as a crisp edge.
  float rim = w5 * step(aKind, 0.5);
  c = mix(c, mix(blueBlock, ice, 0.45), rim * 0.6);
  // Portrait palette: a blue halftone hologram with ice-white highlights,
  // the outline a crisp pale blue.
  vec3 c7 = mix(blueInk * 0.8, blueBlock, smoothstep(0.04, 0.5, tone));
  c7 = mix(c7, ice, smoothstep(0.6, 0.98, tone) * 0.8);
  c7 = mix(c7, mix(blueBlock, ice, 0.5), isBorder);
  c = mix(c, c7, w7);
  // Ripple crests catch the light.
  c = mix(c, ice, clamp(lift, 0.0, 1.0) * 0.5);
  vColor = mix(c, yellow, aSpark);

  float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);
  float alpha = (0.4 + 0.4 * fract(aSeed * 3.7)) * twinkle * (1.0 + aSpark * 0.6);
  alpha *= 1.0 + max(lift, 0.0) * 2.4;

  // Phone outline brightness: bright before the phone materialises, a faint
  // aura around the solid phone, gone on exit. Screen dots fade faster so
  // they never haze over a real screenshot.
  float glow = uPhoneGlow[ph];
  float g = mix(glow, glow * glow, isInner);
  alpha *= mix(1.0, g * uPhoneAlpha, w5);

  // Portrait brightness. The scan wipe (uCardReveal) runs top to bottom:
  // dots it has passed hand over to the photo, dots on its front flare.
  // Once the photo is solid only the outline stays as an aura, plus a
  // scanner lens of dots around the pointer (uCardHover). uCardHold eases
  // all of it back to the full halftone when the card lets go.
  float yTop = (0.625 - aP7.y) / 1.25;
  float front = uCardReveal * 1.2 - 0.1;
  float wiping = step(0.001, uCardReveal) * (1.0 - step(0.999, uCardReveal));
  float ahead = smoothstep(-0.02, 0.05, yTop - front);
  float flare = exp(-abs(yTop - front) * 60.0) * wiping;
  float lens = uCardHover.z * (1.0 - smoothstep(0.07, 0.15, distance(aP7.xy, uCardHover.xy)));
  float gridVis = mix(1.0, max(ahead, lens), uCardHold);
  float shimmer = 0.88 + 0.12 * sin(yTop * 90.0 - uTime * 2.4);
  float gridA = mix(0.05, 1.0, tone) * gridVis * shimmer + flare * (0.35 + 0.65 * tone) * uCardHold;
  float borderA = mix(0.95, 0.32, uCardReveal * uCardHold);
  float cornerA = mix(1.0, 0.6, uCardReveal * uCardHold);
  float a7 = isGrid * gridA + isBorder * borderA + isCorner * cornerA;
  alpha = mix(alpha, a7, w7);
  vAlpha = uDim * alpha;
  // Invisible points cost nothing to rasterise.
  if (vAlpha < 0.002) gl_PointSize = 0.0;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vHard;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  // Soft glow for the field, a crisp printed dot for the halftone.
  float soft = pow(1.0 - d * 2.0, 1.7);
  float hard = 1.0 - smoothstep(0.34, 0.5, d);
  float a = mix(soft, hard, vHard);
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;
