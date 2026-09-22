export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
uniform float uDim;
uniform vec3 uPointer;
uniform float uPointerStrength;

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aDir;
attribute float aSeed;
attribute float aSpark;

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

  vec3 p = position * w0 + aP1 * w1 + aP2 * w2 + aP3 * w3 + aP4 * w4 + aP5 * w5;

  // Mid-flight the particles burst outward, then regroup.
  float flight = sin(3.14159265 * fs);
  p += aDir * flight * (0.35 + aSeed * 0.5);

  // Wave field keeps rolling.
  p.y += w5 * (sin(p.x * 0.9 + uTime * 0.7 + p.z * 0.8) * 0.16 + sin(p.z * 1.7 - uTime * 0.5) * 0.06);

  p += curl(p * 0.9 + aSeed * 3.0, uTime * 0.35) * (0.05 + 0.25 * flight);

  vec4 world = modelMatrix * vec4(p, 1.0);

  vec2 d = world.xy - uPointer.xy;
  float dist = length(d);
  float push = uPointerStrength * (1.0 - smoothstep(0.0, 1.1, dist));
  world.xy += (d / max(dist, 0.001)) * push * 0.42;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + aSpark * 0.7);
  gl_PointSize = size * uPixelRatio / max(-mv.z, 0.1);

  vec3 blueBlock = vec3(0.118, 0.565, 0.941);
  vec3 blueInk = vec3(0.082, 0.396, 0.847);
  vec3 ice = vec3(0.72, 0.86, 1.0);
  vec3 yellow = vec3(1.0, 0.824, 0.247);
  float pick = fract(aSeed * 7.13);
  vec3 c = mix(blueInk, blueBlock, smoothstep(0.2, 0.8, pick));
  c = mix(c, ice, step(0.94, pick) * 0.7);
  vColor = mix(c, yellow, aSpark);

  float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);
  vAlpha = uDim * (0.4 + 0.4 * fract(aSeed * 3.7)) * twinkle * (1.0 + aSpark * 0.6);
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
