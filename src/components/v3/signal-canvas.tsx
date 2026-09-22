"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { buildShapes } from "./shapes";
import { fragmentShader, vertexShader } from "./shaders";
import { signalStore, subscribeSignal } from "./signal-store";
import { StaticBackdrop } from "./static-backdrop";

type FieldProps = { reduced: boolean; mobile: boolean };

const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(22.5));

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

  const geometry = useMemo(() => {
    const data = buildShapes(mobile ? 6000 : 20000);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.shapes[0], 3));
    for (let s = 1; s < data.shapes.length; s++) {
      g.setAttribute(`aP${s}`, new THREE.BufferAttribute(data.shapes[s], 3));
    }
    g.setAttribute("aDir", new THREE.BufferAttribute(data.dir, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 1));
    g.setAttribute("aSpark", new THREE.BufferAttribute(data.spark, 1));
    return g;
  }, [mobile]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: signalStore.morph },
      uSize: { value: mobile ? 30 : 21 },
      uPixelRatio: { value: 1 },
      uDim: { value: signalStore.dim },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uPointerStrength: { value: 0 },
    }),
    [mobile],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

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

    // Camera distance keeps the shapes framed on narrow portrait screens.
    const aspect = size.width / Math.max(1, size.height);
    const wide = size.width >= 1024;
    const need = mobile ? 1.95 : 2.0;
    const z = aspect < 1.1 ? Math.max(6.2, need / (TAN_HALF_FOV * aspect)) : 6.2;

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
    const waveW = THREE.MathUtils.clamp(m - 4, 0, 1);
    const heroW = THREE.MathUtils.clamp(1 - m, 0, 1);
    const phoneW = THREE.MathUtils.clamp(1 - Math.abs(m - 1), 0, 1);
    const globeW = THREE.MathUtils.clamp(1 - Math.abs(m - 2), 0, 1);
    const ringW = THREE.MathUtils.clamp(1 - Math.abs(m - 4), 0, 1);

    camera.position.z = reduced ? z : THREE.MathUtils.damp(camera.position.z, z, 4, dt);

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

    // Pointer repulsion (fine pointers only; the page never sets it on touch).
    const p = signalStore.pointer;
    const wantPointer = !reduced && p.active ? 1 : 0;
    pointerStrengthRef.current = THREE.MathUtils.damp(pointerStrengthRef.current, wantPointer, 4, dt);
    if (p.active) {
      tmpVec.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const dist = -camera.position.z / tmpVec.z;
      mat.uniforms.uPointer.value.copy(camera.position).addScaledVector(tmpVec, dist);
    }

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

export default function SignalCanvas({ reduced, mobile }: FieldProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className="sg-canvas" data-ready={ready ? "true" : "false"} aria-hidden="true">
      {!ready ? <StaticBackdrop /> : null}
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 45, position: [0, 0, 6.2], near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        // The browser already throttles rAF in background tabs; gating on
        // visibilityState left embedded/preview panes with a blank canvas.
        frameloop={reduced ? "demand" : "always"}
        fallback={<StaticBackdrop />}
        onCreated={() => setReady(true)}
        style={{ pointerEvents: "none", touchAction: "pan-y" }}
      >
        <ParticleField reduced={reduced} mobile={mobile} />
      </Canvas>
    </div>
  );
}
