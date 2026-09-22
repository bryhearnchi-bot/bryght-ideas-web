"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, useTexture } from "@react-three/drei";
import { orbitStore } from "./store";
import { buildPoses, layoutFor, poseAt, type Pose } from "./poses";
import { Phone, PHONE_H, usePhoneGeometries, type PhoneFinish } from "./phone";
import { createAhoyTexture, createGlareTexture } from "./textures";

const SCREENSHOTS = ["/kgay-app-screenshot.png", "/betweenacts-app-screenshot.png"];

// KGAY in black, BetweenActs in silver-white, Ahoy in the brand yellow.
const FINISHES: PhoneFinish[] = [
  { color: "#141414", metalness: 0.75, roughness: 0.28 },
  { color: "#E9EEF6", metalness: 0.55, roughness: 0.3 },
  { color: "#FFD23F", metalness: 0.25, roughness: 0.38 },
];

/** Invisible wall far behind the phones: it only shows their shadows on the page colour. */
function ShadowWall() {
  return (
    <mesh position={[0, 0, -6.5]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <shadowMaterial transparent opacity={0.2} />
    </mesh>
  );
}

function Rig({ reduced, mobile, onReady }: { reduced: boolean; mobile: boolean; onReady: () => void }) {
  const detail = mobile ? 2 : 4;
  const geo = usePhoneGeometries(detail);
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const layout = layoutFor(size.width, size.height);
  const poses = useMemo(() => buildPoses(layout), [layout]);

  const shots = useTexture(SCREENSHOTS, (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    list.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  });
  const ahoy = useMemo(() => createAhoyTexture(() => invalidate()), [invalidate]);
  const glare = useMemo(() => createGlareTexture(), []);
  const screens = [shots[0], shots[1], ahoy];

  const groups = useRef<(THREE.Group | null)[]>([]);
  const parallax = useRef<THREE.Group>(null);
  const scratch = useRef<Pose>({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 });
  const primed = useRef(false);

  // Re-render on scroll/pointer when the loop is on demand (reduced motion).
  useEffect(() => orbitStore.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const { width: vw, height: vh } = state.viewport;
    // Reduced motion: snap to the nearest state instead of scrubbing.
    const t = reduced ? Math.round(orbitStore.t) : orbitStore.t;
    const snap = reduced;

    for (let i = 0; i < 3; i++) {
      const g = groups.current[i];
      if (!g) continue;
      const p = poseAt(poses, t, i, scratch.current);
      const x = (p.x * vw) / 2;
      const y = (p.y * vh) / 2;
      const s = (p.s * vh) / PHONE_H;
      if (!primed.current && !snap) {
        // Page-load moment: phones rise in from below the fold.
        g.position.set(x, y - vh * 0.9, p.z - 2);
        g.rotation.set(p.rx + 0.6, p.ry - 0.8, p.rz);
        g.scale.setScalar(s * 0.8);
      }
      if (snap) {
        g.position.set(x, y, p.z);
        g.rotation.set(p.rx, p.ry, p.rz);
        g.scale.setScalar(s);
      } else {
        const k = 4 - i * 0.6;
        const d = THREE.MathUtils.damp;
        g.position.set(d(g.position.x, x, k, delta), d(g.position.y, y, k, delta), d(g.position.z, p.z, k, delta));
        g.rotation.set(d(g.rotation.x, p.rx, k, delta), d(g.rotation.y, p.ry, k, delta), d(g.rotation.z, p.rz, k, delta));
        g.scale.setScalar(d(g.scale.x, s, k, delta));
      }
    }
    primed.current = true;

    const pg = parallax.current;
    if (pg) {
      const tx = reduced || mobile ? 0 : -orbitStore.py * 0.06;
      const ty = reduced || mobile ? 0 : orbitStore.px * 0.1;
      pg.rotation.x = snap ? tx : THREE.MathUtils.damp(pg.rotation.x, tx, 3, delta);
      pg.rotation.y = snap ? ty : THREE.MathUtils.damp(pg.rotation.y, ty, 3, delta);
    }
  });

  return (
    <group ref={parallax}>
      {screens.map((tex, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <Float
            enabled={!reduced}
            speed={1.3 + i * 0.25}
            rotationIntensity={0.5}
            floatIntensity={1.6}
            floatingRange={[-0.07, 0.07]}
          >
            <Phone geo={geo} screen={tex} glare={glare} finish={FINISHES[i]} detail={detail} />
          </Float>
        </group>
      ))}
    </group>
  );
}

class GLBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function OrbitScene({
  reduced,
  onReady,
  onError,
}: {
  reduced: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);

  // Stop rendering entirely while the stage is scrolled out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = !visible ? "never" : reduced ? "demand" : "always";

  return (
    <div ref={wrap} className="o2-canvas" aria-hidden="true">
      <GLBoundary onError={onError}>
        <Canvas
          frameloop={frameloop}
          dpr={mobile ? [1, 1.5] : [1, 1.75]}
          shadows="percentage"
          camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none", touchAction: "auto" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[-2.5, 3.5, 10]}
            intensity={2.2}
            castShadow
            shadow-mapSize={mobile ? [512, 512] : [1024, 1024]}
            shadow-radius={mobile ? 6 : 10}
            shadow-bias={-0.0004}
            shadow-camera-left={-14}
            shadow-camera-right={14}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-camera-near={1}
            shadow-camera-far={40}
          />
          <directionalLight position={[6, -2, -4]} intensity={1.4} color="#FFD23F" />
          <Suspense fallback={null}>
            <Environment resolution={mobile ? 64 : 256} frames={1}>
              <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 2, 1]} />
              <Lightformer form="rect" intensity={2} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[4, 10, 1]} />
              <Lightformer form="rect" color="#1E90F0" intensity={2} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[3, 10, 1]} />
            </Environment>
            <Rig reduced={reduced} mobile={mobile} onReady={onReady} />
            <ShadowWall />
          </Suspense>
        </Canvas>
      </GLBoundary>
    </div>
  );
}
