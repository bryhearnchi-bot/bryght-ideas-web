import * as THREE from "three";

/**
 * Screen material: shows the texture unlit and colour-true (no tone mapping),
 * with a "boot" wipe driven by uReveal (0 = dark glass, 1 = full screen): the
 * image is revealed top to bottom behind a bright blue scanline, with a short
 * blue-tinted, scanlined, flickering band just behind the front. uOpacity
 * fades it out with a screen-space dither that matches alphaHash bodies.
 */
const screenVertex = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const screenFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform sampler2D map;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    if (uOpacity < 0.999 && hash12(floor(gl_FragCoord.xy)) > uOpacity) discard;

    vec3 blue = vec3(0.013, 0.279, 0.871);
    vec3 col = texture2D(map, vUv).rgb;
    float yTop = 1.0 - vUv.y;
    float booting = step(0.001, uReveal) * (1.0 - step(0.999, uReveal));

    // Front of the wipe travels a little past both ends so it fully clears.
    float front = uReveal * 1.12 - 0.06;
    float d = front - yTop;
    float shown = smoothstep(0.0, 0.003, d);

    // Band just behind the front: blue cast, scanlines, flicker.
    float band = (1.0 - smoothstep(0.0, 0.16, d)) * shown * booting;
    float flick = 0.86 + 0.14 * sin(uTime * 53.0 + floor(yTop * 180.0) * 1.7);
    float scan = 0.5 + 0.5 * sin(yTop * 1400.0);
    col = mix(col, col * 0.55 + blue * 0.55 * flick, band * 0.85);
    col *= 1.0 - band * 0.35 * scan;

    // Dark glass where the wipe has not reached yet.
    vec3 glass = vec3(0.004, 0.006, 0.012);
    vec3 outc = mix(glass, col, shown);

    // The scanline itself: a hot core and a soft bloom.
    float core = exp(-abs(d) * 260.0);
    float bloom = exp(-abs(d) * 36.0) * 0.4;
    outc += (blue * (core * 2.2 + bloom) + vec3(core * 0.9)) * booting;

    outc *= uDim;
    gl_FragColor = vec4(outc, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function createScreenMaterial(map: THREE.Texture) {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      map: { value: null },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uDim: { value: 1 },
    },
  ]);
  // Assign after merge: UniformsUtils.merge clones textures.
  uniforms.map.value = map;
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: screenVertex,
    fragmentShader: screenFragment,
    fog: true,
    toneMapped: false,
  });
}

/**
 * Translucent dark fill for the blueprint phone, brighter blue at grazing
 * angles (fresnel) so the silhouette glows like a lit drafting sheet.
 */
const fillVertex = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec3 vNormalV;
  varying vec3 vViewV;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewV = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fillFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uOpacity;
  varying vec3 vNormalV;
  varying vec3 vViewV;
  void main() {
    float f = 1.0 - abs(dot(normalize(vNormalV), normalize(vViewV)));
    f = pow(f, 2.2);
    vec3 fill = vec3(0.004, 0.012, 0.03);
    vec3 blue = vec3(0.013, 0.279, 0.871);
    vec3 col = fill + blue * f * 0.9;
    gl_FragColor = vec4(col, uOpacity * (0.82 + 0.18 * f));
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function createBlueprintFillMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uOpacity: { value: 0 } }]),
    vertexShader: fillVertex,
    fragmentShader: fillFragment,
    fog: true,
    transparent: true,
    depthWrite: true,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
  });
}
