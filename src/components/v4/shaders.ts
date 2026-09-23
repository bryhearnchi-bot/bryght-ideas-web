/**
 * Signal Orbit particle shaders.
 *
 * Shapes 0-4 and 6 live in the field group's local space (modelMatrix).
 * Shape 5, the phone trio, is in phone-local units and is placed in the
 * world by the anchor matrix of the phone the particle belongs to, so the
 * outlines ride along with the 3D phones wherever the rig puts them. The
 * two are blended in WORLD space:
 *   world = modelMatrix * vec4(sum_{k!=5} w_k p_k, sum_{k!=5} w_k)
 *         + w5 * (uPhoneMat[phone] * vec4(aP5, 1))
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

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aP6;
attribute vec3 aDir;
attribute float aSeed;
attribute float aSpark;
attribute float aPhone;
attribute float aKind;

varying vec3 vColor;
varying float vAlpha;

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

  // Group-space part (every shape but the phone trio).
  vec3 p = position * w0 + aP1 * w1 + aP2 * w2 + aP3 * w3 + aP4 * w4 + aP6 * w6;
  float wl = 1.0 - w5;

  // Wave field keeps rolling.
  p.y += w6 * (sin(p.x * 0.9 + uTime * 0.7 + p.z * 0.8) * 0.16 + sin(p.z * 1.7 - uTime * 0.5) * 0.06);

  int ph = int(aPhone + 0.5);
  vec4 world = modelMatrix * vec4(p, wl);
  world.xyz += w5 * (uPhoneMat[ph] * vec4(aP5, 1.0)).xyz;
  world.w = 1.0;

  // Mid-flight the particles burst outward, then regroup.
  float flight = sin(3.14159265 * fs);
  world.xyz += aDir * flight * (0.35 + aSeed * 0.5);

  // Curl drift, nearly still on the phone outlines so they stay crisp.
  float drift = mix(0.05, 0.006, w5);
  world.xyz += curl(world.xyz * 0.9 + aSeed * 3.0, uTime * 0.35) * (drift + 0.25 * flight);

  vec2 d = world.xy - uPointer.xy;
  float dist = length(d);
  float push = uPointerStrength * (1.0 - smoothstep(0.0, 1.1, dist)) * mix(1.0, 0.3, w5);
  world.xy += (d / max(dist, 0.001)) * push * 0.42;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  // Screen dots are finer than the rim; sparks a touch larger.
  float isInner = step(0.5, aKind) * step(aKind, 1.5);
  float phoneSize = uPhoneSize * mix(1.0, 0.72, isInner);
  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + aSpark * 0.7) * mix(1.0, phoneSize, w5);
  gl_PointSize = size * uPixelRatio / max(-mv.z, 0.1);

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
  vColor = mix(c, yellow, aSpark);

  float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);
  float alpha = (0.4 + 0.4 * fract(aSeed * 3.7)) * twinkle * (1.0 + aSpark * 0.6);

  // Phone outline brightness: bright before the phone materialises, a faint
  // aura around the solid phone, gone on exit. Screen dots fade faster so
  // they never haze over a real screenshot.
  float glow = uPhoneGlow[ph];
  float g = mix(glow, glow * glow, isInner);
  alpha *= mix(1.0, g * uPhoneAlpha, w5);
  vAlpha = uDim * alpha;
  // Invisible points cost nothing to rasterise.
  if (vAlpha < 0.002) gl_PointSize = 0.0;
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = pow(1.0 - d * 2.0, 1.7);
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;
