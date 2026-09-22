"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { FOV, bus } from "./choreography";

/** Distance of the backdrop card behind the camera it is parented to. */
const DIST = 30;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uWarm;
  uniform vec3 uBlue;
  uniform vec2 uGlowPos;
  uniform float uGlow;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uDark;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec3 col = uBase;

    // Studio sweep: a touch deeper toward the floor.
    col *= mix(0.935, 1.0, smoothstep(0.0, 0.75, uv.y));

    // Cool brand haze from the lower-left corner.
    vec2 q = (uv - vec2(0.06, 0.08)) * vec2(uAspect, 1.0);
    col = mix(col, uBlue, 0.13 * exp(-dot(q, q) * 2.0) * (1.0 - uDark));

    // Warm light pooling around the bulb once it is on.
    vec2 d = (uv - uGlowPos) * vec2(uAspect, 1.0);
    float g = exp(-dot(d, d) / (uRadius * uRadius)) * uGlow;
    col = mix(col, uWarm, clamp(g, 0.0, 1.0) * 0.78);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const OFFWHITE = new THREE.Color("#F7FAFF");
const INK = new THREE.Color("#0c0d10");
const WARM_LIGHT = new THREE.Color("#FFE49A");
const WARM_DARK = new THREE.Color("#E89A2C");

/**
 * The studio backdrop: a camera-parented card drawn in the scene (rather
 * than as CSS behind a transparent canvas) so the transmission glass
 * refracts exactly what sits behind it.
 */
export function Backdrop() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uBase: { value: OFFWHITE.clone() },
      uWarm: { value: WARM_LIGHT.clone() },
      uBlue: { value: new THREE.Color("#1E90F0") },
      uGlowPos: { value: new THREE.Vector2(0.7, 0.5) },
      uGlow: { value: 0 },
      uRadius: { value: 0.3 },
      uAspect: { value: 1 },
      uDark: { value: 0 },
    }),
    [],
  );

  useFrame(({ size }) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const aspect = size.width / Math.max(1, size.height);
    const h = 2 * DIST * Math.tan(((FOV / 2) * Math.PI) / 180) * 1.04;
    mesh.scale.set(h * aspect, h, 1);

    const { cur, light } = bus;
    const u = mat.uniforms;
    u.uAspect.value = aspect;
    u.uDark.value = cur.dark;
    (u.uBase.value as THREE.Color).copy(OFFWHITE).lerp(INK, cur.dark);
    (u.uWarm.value as THREE.Color).copy(WARM_LIGHT).lerp(WARM_DARK, cur.dark);
    (u.uGlowPos.value as THREE.Vector2).copy(bus.glowUv);
    u.uGlow.value = light * cur.glow * (0.75 + 0.25 * cur.dark);
    // Glow radius tracks the bulb's on-screen size (in viewport heights).
    u.uRadius.value = Math.max(0.08, (cur.s * 3.1) / bus.H) * (1 + 0.5 * cur.dark);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -DIST]} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
