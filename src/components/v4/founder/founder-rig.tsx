"use client";

/**
 * The founder card inside the shared <Canvas>. Every frame (priority -1,
 * before the particle field) it maps the HTML placeholder's box onto the
 * z = 0 plane through the live camera and writes founder.anchor, so the
 * halftone portrait (particle shape 7) and the WebGL photo sit exactly on
 * the page's layout box. It also turns the section's scroll position into
 * the photo's scan-wipe reveal, and (fine pointers) the pointer into a small
 * tilt, a glass glare and the scanner lens.
 *
 * Timeline (the card's centre, as a fraction of the viewport height):
 *   ~1.05 -> ~0.65  particles fly from the wave into the halftone (page anchors)
 *   0.66 -> 0.46    once the halftone has formed, the photo wipes in
 *   leaving         the page anchors morph back to the wave; the photo
 *                   dithers out as the particles take it back (founder.hold)
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { founder } from "./founder-store";
import { createPortraitMaterial } from "./portrait-material";
import { optimisedPhoto, photoCrop } from "./photo";
import { CARD_H, CARD_R, portraitCols } from "../shapes";

const damp = THREE.MathUtils.damp;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const MAX_TILT = THREE.MathUtils.degToRad(7);
const RAD2DEG = 180 / Math.PI;

function setCardAttr(el: HTMLElement | null, name: string, on: boolean) {
  if (!el || el.hasAttribute(name) === on) return;
  if (on) el.setAttribute(name, "");
  else el.removeAttribute(name);
}

type Live = {
  reveal: number;
  tiltX: number;
  tiltY: number;
  hover: number;
  hx: number;
  hy: number;
  init: boolean;
  cssRx: number;
  cssRy: number;
  cssVh: number;
};

// Mutations of hook-owned three.js objects live in plain functions.
function prepareTexture(t: THREE.Texture, maxAniso: number) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, maxAniso);
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
}

function setMap(m: THREE.ShaderMaterial, t: THREE.Texture) {
  m.uniforms.map.value = t;
}

function applyPortrait(m: THREE.ShaderMaterial, lv: Live, time: number) {
  const u = m.uniforms;
  u.uReveal.value = lv.reveal;
  u.uOpacity.value = founder.hold;
  u.uTime.value = time;
  u.uRadius.value = CARD_R;
  u.uHover.value.set(lv.hx + 0.5, lv.hy / CARD_H + 0.5, lv.hover);
  const glare = Math.min(1, Math.hypot(lv.tiltX, lv.tiltY)) * smooth((lv.reveal - 0.9) / 0.1);
  u.uGlare.value.set(0.5 - lv.tiltX * 0.45, 0.5 + lv.tiltY * 0.45, glare);
}

export default function FounderRig({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const gl = useThree((s) => s.gl);
  const meshRef = useRef<THREE.Mesh>(null);
  const tex = useRef<THREE.Texture | null>(null);
  const status = useRef<"idle" | "loading" | "ready" | "failed">("idle");
  const live = useRef<Live>({
    reveal: 0,
    tiltX: 0,
    tiltY: 0,
    hover: 0,
    hx: 0,
    hy: 0,
    init: false,
    cssRx: 0,
    cssRy: 0,
    cssVh: 0,
  });
  const pointer = useRef({ x: 0, y: 0, active: false });
  const lastEl = useRef<HTMLElement | null>(null);
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), d: new THREE.Vector3() }), []);

  const material = useMemo(() => createPortraitMaterial(new THREE.Texture(), photoCrop()), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, CARD_H, 1, 1), []);
  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
      tex.current?.dispose();
    },
    [material, geometry],
  );

  const load = () => {
    status.current = "loading";
    new THREE.TextureLoader().load(
      optimisedPhoto(mobile ? 750 : 1080),
      (t) => {
        prepareTexture(t, gl.capabilities.getMaxAnisotropy());
        tex.current = t;
        setMap(material, t);
        status.current = "ready";
      },
      undefined,
      () => {
        status.current = "failed";
      },
    );
  };

  // The page owns the card's HTML fallback; tell it the WebGL card is live.
  useEffect(() => {
    return () => {
      setCardAttr(lastEl.current, "data-gl", false);
      setCardAttr(lastEl.current, "data-revealed", false);
    };
  }, []);

  // Pointer (fine pointers only): tilt, glare and the scanner lens.
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const p = pointer.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      p.x = e.clientX;
      p.y = e.clientY;
      p.active = true;
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) p.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      p.active = false;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [reduced]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 15);
    const el = founder.el;
    const mesh = meshRef.current;
    if (lastEl.current !== el) {
      setCardAttr(lastEl.current, "data-gl", false);
      setCardAttr(lastEl.current, "data-revealed", false);
      lastEl.current = el;
    }
    if (!el || reduced) {
      founder.presence = 0;
      founder.hold = 0;
      founder.reveal = 0;
      if (mesh) mesh.visible = false;
      return;
    }

    const { camera, size } = state;
    const rect = el.getBoundingClientRect();
    const vh = size.height || window.innerHeight;
    const vw = size.width || window.innerWidth;
    const near = rect.bottom > -1.5 * vh && rect.top < 2.5 * vh;
    founder.presence = near ? 1 : 0;
    if (near && status.current === "idle") load();

    // The HTML image stays up unless the photo can load.
    setCardAttr(el, "data-gl", status.current !== "failed");

    // Layout box -> world, on the z = 0 plane.
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    tmp.v.set((cx / vw) * 2 - 1, -(cy / vh) * 2 + 1, 0.5).unproject(camera);
    tmp.d.copy(tmp.v).sub(camera.position).normalize();
    const dist = -camera.position.z / tmp.d.z;
    const persp = camera as THREE.PerspectiveCamera;
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2));
    const worldW = (rect.width / vh) * visH;

    // Hold follows the particles' own (damped) morph: 1 at the portrait.
    founder.hold = smooth((founder.morph - 6.45) / 0.5);
    const formed = smooth((founder.morph - 6.82) / 0.16);
    const centre = cy / vh;
    const scrollReveal = smooth((0.64 - centre) / 0.2);
    const target = status.current === "ready" ? Math.min(scrollReveal, formed) : 0;

    const lv = live.current;
    if (!lv.init) {
      lv.reveal = target;
      lv.init = true;
    }
    lv.reveal = damp(lv.reveal, target, 5, dt);
    if (Math.abs(lv.reveal - target) < 0.001) lv.reveal = target;

    // Pointer: tilt toward it when over (or near) the card; the lens and
    // glare only once the photo is solid.
    const p = pointer.current;
    let tx = 0;
    let ty = 0;
    let lens = 0;
    let lx = lv.hx;
    let ly = lv.hy;
    if (p.active) {
      const nx = ((p.x - rect.left) / rect.width) * 2 - 1;
      const ny = ((p.y - rect.top) / rect.height) * 2 - 1;
      const over = Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
      const nearCard = Math.abs(nx) < 1.35 && Math.abs(ny) < 1.25;
      if (nearCard) {
        tx = THREE.MathUtils.clamp(nx, -1, 1);
        ty = THREE.MathUtils.clamp(ny, -1, 1);
      }
      if (over) {
        lens = smooth((lv.reveal - 0.85) / 0.15) * founder.hold;
        lx = nx * 0.5;
        ly = -ny * 0.5 * CARD_H;
      }
    }
    lv.tiltX = damp(lv.tiltX, tx, 4, dt);
    lv.tiltY = damp(lv.tiltY, ty, 4, dt);
    lv.hover = damp(lv.hover, lens, 6, dt);
    lv.hx = damp(lv.hx, lx, 14, dt);
    lv.hy = damp(lv.hy, ly, 14, dt);

    const a = founder.anchor;
    a.position.copy(camera.position).addScaledVector(tmp.d, dist);
    a.position.z = 0;
    // Face the pointer: +y rotation turns the photo toward a pointer on the right.
    a.rotation.set(lv.tiltY * MAX_TILT, lv.tiltX * MAX_TILT, 0);
    a.scale.setScalar(worldW);
    a.updateMatrixWorld(true);

    // The HTML caption rides the same tilt (CSS rotations: x flips sign).
    const rx = -lv.tiltY * MAX_TILT * RAD2DEG;
    const ry = lv.tiltX * MAX_TILT * RAD2DEG;
    if (Math.abs(rx - lv.cssRx) > 0.02 || Math.abs(ry - lv.cssRy) > 0.02 || lv.cssVh !== vh) {
      lv.cssRx = rx;
      lv.cssRy = ry;
      lv.cssVh = vh;
      el.style.setProperty("--fd-rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--fd-ry", `${ry.toFixed(2)}deg`);
      // The camera's distance to the card plane in CSS pixels, so both
      // tilts foreshorten alike.
      const focal = vh / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)));
      el.style.setProperty("--fd-persp", `${Math.round(focal)}px`);
    }

    founder.reveal = lv.reveal;
    founder.hover.set(lv.hx, lv.hy, lv.hover);
    founder.dotPx = (rect.width * gl.getPixelRatio()) / portraitCols(mobile);

    // Caption fades in once the photo is (nearly) solid.
    const revealed = el.hasAttribute("data-revealed");
    if (!revealed && lv.reveal > 0.9 && founder.hold > 0.9) setCardAttr(el, "data-revealed", true);
    else if (revealed && (lv.reveal < 0.6 || founder.hold < 0.5)) setCardAttr(el, "data-revealed", false);

    if (mesh) {
      const visible = status.current === "ready" && founder.hold > 0.002 && lv.reveal > 0.001;
      mesh.visible = visible;
      if (visible) applyPortrait(material, lv, state.clock.elapsedTime);
    }
  }, -1);

  return (
    <primitive object={founder.anchor}>
      <mesh ref={meshRef} geometry={geometry} material={material} visible={false} renderOrder={-1} frustumCulled={false} />
    </primitive>
  );
}
