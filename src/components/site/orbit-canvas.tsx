"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import DeviceRig from "./device/device-rig";
import FounderRig from "./founder/founder-rig";
import { founder } from "./founder/founder-store";
import { sampleTones } from "./founder/photo";
import { fx, MAX_RIPPLES } from "./fx-store";
import { buildShapes } from "./shapes";
import { fragmentShader, vertexShader } from "./shaders";
import { showcase, PHONE_COUNT } from "./showcase-store";
import { signalStore, subscribeSignal } from "./signal-store";
import { StaticBackdrop } from "./static-backdrop";

type FieldProps = { reduced: boolean; mobile: boolean };

const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(22.5));
const BASE_Z = 6.2;

/** Camera distance that keeps the shapes framed on narrow portrait screens. */
function cameraDistance(width: number, height: number, mobile: boolean) {
  const aspect = width / Math.max(1, height);
  const need = mobile ? 1.95 : 2.0;
  return aspect < 1.1 ? Math.max(BASE_Z, need / (TAN_HALF_FOV * aspect)) : BASE_Z;
}

/**
 * Runs first (priority -2): the device and founder rigs (-1) place the
 * phones and the founder card from the live camera, and the particles (0)
 * read the anchors the rigs just wrote.
 */
function CameraDolly({ reduced, mobile }: FieldProps) {
  useFrame((state, delta) => {
    const { camera, size } = state;
    const z = cameraDistance(size.width, size.height, mobile);
    const dt = Math.min(delta, 0.25);
    camera.position.z = reduced ? z : THREE.MathUtils.damp(camera.position.z, z, 4, dt);
    camera.updateMatrixWorld();
  }, -2);
  return null;
}

function ParticleField({ reduced, mobile }: FieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const spinRef = useRef(0);
  const clockRef = useRef(0);
  const morphRef = useRef(signalStore.morph);
  const dimRef = useRef(signalStore.dim);
  const pointerStrengthRef = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const dpr = useThree((s) => s.viewport.dpr);

  const data = useMemo(() => buildShapes(mobile ? 6000 : 20000, mobile), [mobile]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.shapes[0], 3));
    for (let s = 1; s < data.shapes.length; s++) {
      g.setAttribute(`aP${s}`, new THREE.BufferAttribute(data.shapes[s], 3));
    }
    g.setAttribute("aDir", new THREE.BufferAttribute(data.dir, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 1));
    g.setAttribute("aSpark", new THREE.BufferAttribute(data.spark, 1));
    g.setAttribute("aPhone", new THREE.BufferAttribute(data.phone, 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(data.kind, 1));
    // Portrait roles + halftone tones: rewritten once the photo is sampled.
    g.setAttribute("aTone", new THREE.BufferAttribute(data.tone.slice(), 1));
    return g;
  }, [data]);
  const toneState = useRef<"idle" | "loading" | "done">("idle");

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: signalStore.morph },
      uSize: { value: mobile ? 30 : 21 },
      uPixelRatio: { value: 1 },
      uDim: { value: signalStore.dim },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uPointerStrength: { value: 0 },
      uPhoneMat: {
        value: Array.from({ length: PHONE_COUNT }, () => new THREE.Matrix4()),
      },
      uPhoneGlow: { value: [1, 1, 1] },
      // Desktop outlines are dense, so finer points keep the rim a crisp
      // line; phones carry fewer particles on a smaller phone, so each one
      // is a little larger and brighter.
      uPhoneSize: { value: mobile ? 0.82 : 0.62 },
      uPhoneAlpha: { value: mobile ? 1.45 : 1 },
      // Founder portrait (shape 7), placed by the founder rig's card anchor.
      uCardMat: { value: new THREE.Matrix4() },
      uCardReveal: { value: 0 },
      uCardHold: { value: 0 },
      uCardHover: { value: new THREE.Vector3() },
      uCardPx: { value: 4 },
      uRelief: { value: 0.09 },
      uCardScale: { value: 1 },
      // HTML ripples through the wave: (ndc x, ndc y, age s, strength).
      uRipple: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -1, 0)) },
      uAspect: { value: 1 },
    }),
    [mobile],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Sample the photo into the halftone once the founder card gets close.
  const toneTries = useRef(0);
  const applyTones = (tones: Float32Array | null) => {
    if (!tones) {
      // A failed fetch keeps the flat mid-tone grid; try again shortly.
      toneState.current = "done";
      if (++toneTries.current < 3) window.setTimeout(() => (toneState.current = "idle"), 4000);
      return;
    }
    toneState.current = "done";
    const attr = geometry.getAttribute("aTone") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const idx = data.grid.index;
    for (let k = 0; k < idx.length; k++) if (idx[k] >= 0) arr[idx[k]] = tones[k];
    attr.needsUpdate = true;
    invalidate();
  };

  // In reduced-motion mode the loop is on demand: redraw once per change.
  useEffect(() => {
    if (!reduced) return;
    return subscribeSignal(() => invalidate());
  }, [reduced, invalidate]);

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const mat = matRef.current;
    const group = groupRef.current;
    if (!mat || !group) return;
    // Generous cap: a throttled or backgrounded browser that only paints now
    // and then still settles onto the target shape instead of lagging behind.
    const dt = Math.min(delta, 0.25);
    const { camera, size } = state;
    const wide = size.width >= 1024;
    const z = cameraDistance(size.width, size.height, mobile);

    if (reduced) {
      morphRef.current = signalStore.morph;
      dimRef.current = signalStore.dim;
    } else {
      clockRef.current += dt;
      morphRef.current = THREE.MathUtils.damp(morphRef.current, signalStore.morph, 3.2, dt);
      dimRef.current = THREE.MathUtils.damp(dimRef.current, signalStore.dim, 3, dt);
    }
    const t = clockRef.current;
    const m = morphRef.current;
    // Shape weights for the group transform. The phone trio (5) ignores the
    // group entirely (it rides the anchors), so the group simply holds the
    // ring's placement through it and eases into the wave's after.
    const waveW = THREE.MathUtils.clamp(m - 5, 0, 1);
    const heroW = THREE.MathUtils.clamp(1 - m, 0, 1);
    const phoneW = THREE.MathUtils.clamp(1 - Math.abs(m - 1), 0, 1);
    const globeW = THREE.MathUtils.clamp(1 - Math.abs(m - 2), 0, 1);
    const ringW = THREE.MathUtils.clamp(1 - Math.abs(m - 4), 0, 1);

    // Shapes sit right of the text on wide screens, above it on phones. On
    // phones the hero bulb sits high (copy starts mid-screen); the service
    // shapes drop into the gap between the pinned heading and the glass card
    // and shrink a touch so they never run under either.
    const phoneLayout = !wide;
    const offX = wide ? 1.95 : 0;
    // Stacked layouts work in fractions of the visible height so phones and
    // portrait tablets frame the same way: bulb centred ~30% down, service
    // shapes ~38% down (between the pinned heading and the card).
    const visH = 2 * z * TAN_HALF_FOV;
    const offY = phoneLayout ? THREE.MathUtils.lerp(0.12, 0.2, heroW) * visH : 0;
    const stackScale = THREE.MathUtils.lerp(
      Math.min(0.84, (0.4 * visH) / 2.9),
      Math.min(1, (0.42 * visH) / 3.05),
      heroW,
    );
    const scaleTarget = THREE.MathUtils.lerp(phoneLayout ? stackScale : 1, 1, waveW);
    const tx = offX * (1 - waveW);
    const ty = offY * (1 - waveW);
    if (reduced) {
      group.position.set(tx, ty, 0);
      group.scale.setScalar(scaleTarget);
    } else {
      group.position.x = THREE.MathUtils.damp(group.position.x, tx, 3, dt);
      group.position.y = THREE.MathUtils.damp(group.position.y, ty, 3, dt);
      group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, scaleTarget, 3, dt));
    }

    // Only the globe spins; its angle is folded into [-pi, pi] and weighted
    // by the globe's share, so the phone and ring always come back facing
    // the camera instead of inheriting a leftover edge-on rotation.
    if (!reduced && globeW > 0) spinRef.current = (spinRef.current + dt * 0.22) % (Math.PI * 2);
    const spin = spinRef.current > Math.PI ? spinRef.current - Math.PI * 2 : spinRef.current;
    // Flat shapes (phone, ring) sway less so they stay readable.
    const sway = (1 - waveW) * (1 - 0.6 * Math.max(phoneW, ringW));
    group.rotation.y = spin * globeW + Math.sin(t * 0.17) * 0.42 * sway;
    group.rotation.x = Math.sin(t * 0.13) * 0.1 * sway;
    group.rotation.z = Math.sin(t * 0.09) * 0.04 * sway;

    // Phone trio: the rig (priority -1) has already written this frame's
    // anchors, so the outlines sit exactly on the phones.
    const phoneMats = mat.uniforms.uPhoneMat.value as THREE.Matrix4[];
    const glow = mat.uniforms.uPhoneGlow.value as number[];
    for (let i = 0; i < PHONE_COUNT; i++) {
      phoneMats[i].copy(showcase.anchors[i].matrixWorld);
      glow[i] = THREE.MathUtils.clamp(showcase.glow[i] ?? 0, 0, 1);
    }

    // Pointer repulsion (fine pointers only; the page never sets it on touch).
    const p = signalStore.pointer;
    const wantPointer = !reduced && p.active ? 1 : 0;
    pointerStrengthRef.current = THREE.MathUtils.damp(pointerStrengthRef.current, wantPointer, 4, dt);
    if (p.active) {
      tmpVec.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const dist = -camera.position.z / tmpVec.z;
      mat.uniforms.uPointer.value.copy(camera.position).addScaledVector(tmpVec, dist);
    }

    // Founder card: the rig (priority -1) has written this frame's anchor.
    founder.morph = m;
    if (toneState.current === "idle" && founder.presence > 0) {
      toneState.current = "loading";
      sampleTones(data.grid.cols, data.grid.rows).then(applyTones, () => applyTones(null));
    }
    mat.uniforms.uCardMat.value.copy(founder.anchor.matrixWorld);
    mat.uniforms.uCardReveal.value = founder.reveal;
    mat.uniforms.uCardHold.value = founder.hold;
    mat.uniforms.uCardHover.value.copy(founder.hover);
    mat.uniforms.uCardPx.value = founder.dotPx;
    mat.uniforms.uCardScale.value = founder.anchor.scale.x;

    // Ripples: ages on the CPU so the shader never sees a large clock value.
    const now = performance.now() / 1000;
    const ripples = mat.uniforms.uRipple.value as THREE.Vector4[];
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = fx.ripples[i];
      const age = r.start < 0 || reduced ? -1 : now - r.start;
      ripples[i].set(r.x, r.y, age, r.strength);
    }
    mat.uniforms.uAspect.value = size.width / Math.max(1, size.height);

    mat.uniforms.uTime.value = t;
    mat.uniforms.uMorph.value = m;
    mat.uniforms.uDim.value = dimRef.current;
    mat.uniforms.uPixelRatio.value = dpr;
    mat.uniforms.uPointerStrength.value = pointerStrengthRef.current;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function OrbitCanvas({ reduced, mobile }: FieldProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className="so-canvas" data-ready={ready ? "true" : "false"} aria-hidden="true">
      {!ready ? <StaticBackdrop /> : null}
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 45, position: [0, 0, BASE_Z], near: 0.1, far: 60 }}
        gl={{
          // The phones are real geometry now, so their edges need MSAA.
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        // The browser already throttles rAF in background tabs; gating on
        // visibilityState left embedded/preview panes with a blank canvas.
        frameloop={reduced ? "demand" : "always"}
        fallback={<StaticBackdrop />}
        onCreated={({ gl }) => {
          // Pin these explicitly: the phones' PBR materials depend on them
          // (the additive particle ShaderMaterial is unaffected).
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          setReady(true);
        }}
        style={{ pointerEvents: "none", touchAction: "pan-y" }}
      >
        <CameraDolly reduced={reduced} mobile={mobile} />
        <DeviceRig mobile={mobile} reduced={reduced} />
        <FounderRig mobile={mobile} reduced={reduced} />
        <ParticleField reduced={reduced} mobile={mobile} />
      </Canvas>
    </div>
  );
}
