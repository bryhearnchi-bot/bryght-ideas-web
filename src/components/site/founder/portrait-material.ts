import * as THREE from "three";

/**
 * The founder photo on a WebGL card, in the phones' visual language: it
 * materialises top to bottom behind a hot blue scanline, the front edge
 * dithered in (the same screen-space hash as the phones' alphaHash bodies)
 * with a blue, scanlined band just behind it. uOpacity dithers the whole card
 * out again when the particles take it back.
 *
 * Extras once it is solid (fine pointers): a soft glass glare that slides
 * opposite the pointer, and a "scanner" lens around the pointer where the
 * photo drops to a dark blue duotone so the halftone dots drawn over it
 * (by the particle field) read as an x-ray of the same picture.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D map;
  uniform vec4 uCrop;      // x0, y0, w, h of the source (uv space, y up)
  uniform vec2 uSize;      // card size in local units
  uniform float uRadius;   // corner radius in local units
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uHover;     // lens centre (uv) + strength
  uniform vec3 uGlare;     // glare centre (uv) + strength
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 local = (vUv - 0.5) * uSize;
    float sd = roundedBox(local, uSize * 0.5, uRadius);
    // Never zero: on the centre column |x| makes the derivative cancel.
    float aa = max(fwidth(sd), 1e-4);
    float edge = 1.0 - smoothstep(-aa, aa, sd);
    if (edge <= 0.0) discard;

    float h = hash12(floor(gl_FragCoord.xy));
    if (uOpacity < 0.999 && h > uOpacity) discard;

    vec3 blue = vec3(0.013, 0.279, 0.871);
    vec3 ice = vec3(0.72, 0.86, 1.0);
    float yTop = 1.0 - vUv.y;
    float booting = step(0.001, uReveal) * (1.0 - step(0.999, uReveal));

    // Front of the wipe travels a little past both ends so it fully clears.
    float front = uReveal * 1.2 - 0.1;
    float d = front - yTop;

    // The scanline itself: a hot core and a soft bloom (drawn even ahead of
    // the photo, over the halftone).
    float core = exp(-abs(d) * 240.0);
    float bloom = exp(-abs(d) * 30.0) * 0.35;
    vec3 scan = (blue * (core * 2.2 + bloom) + vec3(core * 0.9)) * booting;

    // Dithered front: pixels just behind the scanline come in by hash.
    float shown = smoothstep(0.0, 0.07, d);
    if (h > shown) {
      float a = max(core, bloom) * booting;
      if (a < 0.01) discard;
      gl_FragColor = vec4(scan, a * edge * uOpacity);
      #include <colorspace_fragment>
      return;
    }

    vec2 tuv = uCrop.xy + vUv * uCrop.zw;
    vec3 col = texture2D(map, tuv).rgb;

    // Band just behind the front: blue cast, scanlines, flicker.
    float band = (1.0 - smoothstep(0.0, 0.18, d)) * booting;
    float flick = 0.86 + 0.14 * sin(uTime * 53.0 + floor(yTop * 180.0) * 1.7);
    float lines = 0.5 + 0.5 * sin(yTop * 900.0);
    col = mix(col, col * 0.5 + blue * 0.6 * flick, band * 0.85);
    col *= 1.0 - band * 0.35 * lines;
    col += scan;

    // Scanner lens: the photo drops to a dark blue duotone under the dots.
    vec2 asp = vec2(uSize.x / uSize.y, 1.0);
    float ld = distance(vUv * asp, uHover.xy * asp);
    float lensR = 0.15 / uSize.y;
    float lens = (1.0 - smoothstep(lensR * 0.55, lensR, ld)) * uHover.z;
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    vec3 duo = mix(vec3(0.004, 0.01, 0.03), blue * 0.55, l);
    col = mix(col, duo, lens * 0.82);
    float ring = exp(-abs(ld - lensR * 0.98) * 900.0) * uHover.z;
    col += ice * ring * 0.35;

    // Glass glare: a broad soft highlight and a faint diagonal sheen.
    float gd = distance(vUv * asp, uGlare.xy * asp);
    col += vec3(0.9, 0.95, 1.0) * exp(-gd * gd * 7.0) * 0.16 * uGlare.z;
    float sheen = 1.0 - smoothstep(0.0, 0.05, abs((vUv.x + (1.0 - vUv.y)) * 0.5 - (1.0 - uGlare.x) * 0.9 - 0.05));
    col += vec3(0.8, 0.9, 1.0) * sheen * 0.05 * uGlare.z;

    gl_FragColor = vec4(col, edge);
    #include <colorspace_fragment>
  }
`;

export function createPortraitMaterial(map: THREE.Texture, crop: { x: number; y: number; w: number; h: number }) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      // uv y runs bottom-up; the crop is given top-down.
      uCrop: { value: new THREE.Vector4(crop.x, 1 - crop.y - crop.h, crop.w, crop.h) },
      uSize: { value: new THREE.Vector2(1, 1.25) },
      uRadius: { value: 0.064 },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uHover: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uGlare: { value: new THREE.Vector3(0.5, 0.5, 0) },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  return material;
}
