"use client";

/**
 * The Work showcase's 3D device rig. Lives inside the page's one shared
 * <Canvas>. Every frame (priority -1, before the particle field) it turns
 * showcase.t into three phone poses and writes them to showcase.anchors,
 * plus showcase.glow / showcase.reveal for the particle outlines. The phones
 * themselves hang off those anchors, so particles and meshes always agree.
 *
 * Stage timeline (showcase.t):
 *   0      OUTLINE  anchors in the fan, phones invisible, outlines bright
 *   .15-1  MATERIALISE  phones resolve one after another (dither + scan wipe)
 *   1-2    fan swings into the orbit carousel; KGAY arrives front at 2
 *   2/3/4  app 0/1/2 front; exploded-UI beat peaks ~k+.45; ring turns ~k+.75..k+1
 *   4.7-5  EXIT  phones rise and dissolve, glow -> 0
 */
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { PHONE_COUNT, showcase } from "../showcase-store";
import { createPhoneKit } from "./geometry";
import { computeLayout, computeTargets, newTarget, smooth, snapStage, type Target } from "./poses";
import { SolidPhone, type Finish, type PhoneState } from "./phones";
import { createSpillTexture } from "./textures";
import { BETWEENACTS_LAYERS, KGAY_LAYERS, MYCRUISECARD_LAYERS, type LayerSpec } from "./ui-layers";

const PAGE_BG = "#0A0D14";

// Load the PNGs through the Next image optimiser. The sources are 921px wide
// and it never upscales, so ask for the largest allowed width below that
// (828, one of Next's default deviceSizes); 640 on mobile.
const optimised = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

type PhoneSpec = { src: string; finish: Finish; layers: LayerSpec[]; spill: string };

/** Phone i shows app i (see poses.ts). Each finish suits its app's palette. */
const PHONES: PhoneSpec[] = [
  // KGAY Travel: black titanium, warm orange spill.
  {
    src: "/kgay-app-screenshot.png",
    finish: { frame: "#3b3c40", back: "#1b1c1f", roughness: 0.3 },
    layers: KGAY_LAYERS,
    spill: "#E86A2C",
  },
  // BetweenActs: natural titanium, marquee-red spill.
  {
    src: "/betweenacts-app-screenshot.png",
    finish: { frame: "#c9c5bd", back: "#bdb9b1", roughness: 0.26 },
    layers: BETWEENACTS_LAYERS,
    spill: "#C4142E",
  },
  // MyCruiseCard: deep navy blue titanium for its navy + gold UI, violet-blue spill.
  {
    src: "/mycruisecard-app-screenshot.png",
    finish: { frame: "#43598c", back: "#1f2a4a", roughness: 0.28 },
    layers: MYCRUISECARD_LAYERS,
    spill: "#7468F0",
  },
];

const ORIGIN = new THREE.Vector3(0, 0, 0);

type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };
type Live = Pose & { reveal: number; explode: number; fade: number; front: number; exit: number };

const damp = THREE.MathUtils.damp;

// Mutations of hook-owned three.js objects live in plain functions.
function attachFog(scene: THREE.Scene, fog: THREE.Fog) {
  const prev = scene.fog;
  scene.fog = fog;
  return () => {
    if (scene.fog === fog) scene.fog = prev;
  };
}

function setFogBand(fog: THREE.Fog, near: number, far: number) {
  fog.near = near;
  fog.far = far;
}

function syncState(st: PhoneState, lv: Live, visible: boolean) {
  st.reveal = lv.reveal;
  st.explode = lv.explode;
  st.fade = lv.fade;
  st.front = lv.front;
  st.visible = visible;
}

/** A phone whose texture fails to load is simply left out; the rest keeps running. */
class FailSoft extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-3, 5, 6]} intensity={1.1} />
      <Environment frames={1} resolution={256}>
        {/* Soft key from the top left */}
        <Lightformer form="rect" intensity={2.6} position={[-4, 5, 5]} scale={[7, 3.5, 1]} />
        {/* Broad, dim top fill so the frame never goes dead black */}
        <Lightformer form="rect" intensity={0.7} position={[0, 7, -1]} scale={[12, 2, 1]} />
        {/* Brand-blue rim strips behind the phones -> glowing blue edges */}
        <Lightformer form="rect" color="#1E90F0" intensity={7} position={[-5, 0.5, -4]} scale={[1.4, 12, 1]} />
        <Lightformer form="rect" color="#1E90F0" intensity={7} position={[5, 0.5, -4]} scale={[1.4, 12, 1]} />
        <Lightformer form="rect" color="#1565D8" intensity={3} position={[0, -5, -3]} scale={[10, 1.2, 1]} />
        {/* Small warm accent low right */}
        <Lightformer form="circle" color="#FFB86B" intensity={2.4} position={[4.5, -3, 3]} scale={[1.6, 1.6, 1]} />
      </Environment>
    </>
  );
}

export default function DeviceRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const scene = useThree((s) => s.scene);
  const [mounted, setMounted] = useState(false);
  const detail = mobile ? 2 : 4;

  const kit = useMemo(() => createPhoneKit(detail), [detail]);
  useEffect(() => () => kit.dispose(), [kit]);
  const spillMap = useMemo(() => createSpillTexture(), []);
  useEffect(() => () => spillMap.dispose(), [spillMap]);

  const targets = useMemo<Target[]>(() => Array.from({ length: PHONE_COUNT }, newTarget), []);
  const live = useRef<(Live & { init: boolean })[]>(
    Array.from({ length: PHONE_COUNT }, () => ({ ...newTarget(), init: false })),
  );
  const states = useMemo<PhoneState[]>(
    () => Array.from({ length: PHONE_COUNT }, () => ({ visible: false, reveal: 0, explode: 0, fade: 1, front: 0 })),
    [],
  );

  // Fog: back phones fall away into the page colour.
  const fog = useMemo(() => new THREE.Fog(PAGE_BG, 10, 20), []);
  useEffect(() => attachFog(scene, fog), [scene, fog]);

  // Subtle pointer parallax on fine pointers only.
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 15);
    const cam = state.camera;
    const vp = state.viewport.getCurrentViewport(cam, ORIGIN);
    const L = computeLayout(vp.width, vp.height, state.size.width, state.size.height);
    const tRaw = THREE.MathUtils.clamp(showcase.t, 0, 5);
    const t = reduced ? snapStage(tRaw) : tRaw;
    const present = showcase.presence > 0;
    computeTargets(t, L, cam.position, targets);

    const p = pointer.current;
    if (reduced) {
      p.x = p.y = 0;
    } else {
      p.x = damp(p.x, p.tx, 2.5, dt);
      p.y = damp(p.y, p.ty, 2.5, dt);
    }
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PHONE_COUNT; i++) {
      const tg = targets[i];
      const lv = live.current[i];
      // Snap when motion is reduced, on the first frame, and while far away
      // (so the phones are already in place when the section arrives).
      if (reduced || !lv.init || !present) {
        Object.assign(lv, tg);
        lv.init = true;
      } else {
        const k = 6.5;
        lv.x = damp(lv.x, tg.x, k, dt);
        lv.y = damp(lv.y, tg.y, k, dt);
        lv.z = damp(lv.z, tg.z, k, dt);
        lv.rx = damp(lv.rx, tg.rx, k, dt);
        lv.ry = damp(lv.ry, tg.ry, k, dt);
        lv.rz = damp(lv.rz, tg.rz, k, dt);
        lv.s = damp(lv.s, tg.s, k, dt);
        lv.reveal = damp(lv.reveal, tg.reveal, 9, dt);
        lv.explode = damp(lv.explode, tg.explode, 7, dt);
        lv.fade = damp(lv.fade, tg.fade, 9, dt);
        lv.front = damp(lv.front, tg.front, 6, dt);
        lv.exit = damp(lv.exit, tg.exit, 9, dt);
      }

      // Idle float and sway go INTO the anchor so the particles follow too.
      const idle = reduced ? 0 : 1 - 0.5 * lv.explode;
      const h = L.hFront;
      const a = showcase.anchors[i];
      a.position.set(lv.x, lv.y + idle * Math.sin(time * 0.85 + i * 2.1) * 0.014 * h, lv.z);
      a.rotation.set(
        lv.rx + idle * Math.sin(time * 0.6 + i * 1.1) * 0.022 + p.y * 0.05,
        lv.ry + idle * Math.sin(time * 0.5 + i * 1.7) * 0.04 + p.x * 0.09,
        lv.rz + idle * Math.sin(time * 0.7 + i * 0.9) * 0.012,
      );
      a.scale.setScalar(lv.s);
      a.updateMatrixWorld(true);

      // Outline brightness: bright before the phone resolves, a faint aura
      // after (a little stronger on the front phone), gone on exit.
      const solid = smooth((lv.reveal - 0.2) / 0.8);
      const aura = 0.2 + 0.12 * lv.front;
      showcase.glow[i] = THREE.MathUtils.lerp(1, aura, solid) * (1 - lv.exit);
      showcase.reveal[i] = lv.reveal;

      syncState(states[i], lv, present && lv.fade > 0.003 && lv.reveal > 0.002 && t < 5);
    }

    // Fog band sits just behind the front phone and swallows the back of the ring.
    const dFront = cam.position.z;
    setFogBand(fog, dFront + 0.16 * L.hFront, dFront + 1.25 * L.hFront);

    if (present && !mounted) setMounted(true);
  }, -1);

  const screenW = mobile ? 640 : 828;
  return (
    <>
      {showcase.anchors.map((anchor, i) => {
        const phone = PHONES[i];
        return (
          <primitive key={i} object={anchor}>
            {mounted && phone ? (
              <FailSoft>
                <Suspense fallback={null}>
                  <SolidPhone
                    kit={kit}
                    state={states[i]}
                    url={optimised(phone.src, screenW)}
                    finish={phone.finish}
                    layers={phone.layers}
                    spillMap={spillMap}
                    spillColor={phone.spill}
                  />
                </Suspense>
              </FailSoft>
            ) : null}
          </primitive>
        );
      })}
      {mounted ? (
        <Suspense fallback={null}>
          <Lighting />
        </Suspense>
      ) : null}
    </>
  );
}
