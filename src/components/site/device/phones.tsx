"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { PHONE_H, PHONE_W } from "../phone-dims";
import {
  FRONT,
  ISLAND,
  SCREEN_Z,
  clippedLayerGeometry,
  layerGeometry,
  layerRect,
  roundedRectShape,
  type PhoneKit,
} from "./geometry";
import { createScreenMaterial } from "./materials";
import { createLayerShadowTexture, SHADOW_PAD } from "./textures";
import { smooth } from "./poses";
import type { LayerSpec } from "./ui-layers";

/** Per-phone live state written by the rig every frame, read here. */
export type PhoneState = {
  visible: boolean;
  reveal: number;
  explode: number;
  fade: number;
  front: number;
};

export type Finish = {
  frame: string;
  back: string;
  roughness: number;
};

/* ------------------------------------------------------------------ */
/* Exploded UI layers                                                   */
/* ------------------------------------------------------------------ */

type LayerParts = {
  material: THREE.MeshBasicMaterial;
  rimMaterial: THREE.LineBasicMaterial;
  items: {
    spec: LayerSpec;
    rect: ReturnType<typeof layerRect>;
    layer: THREE.Mesh;
    shadow: THREE.Mesh;
    shadowMat: THREE.MeshBasicMaterial;
    /** Cavity on whatever the element sits on (the screen, or its parent layer). */
    socket: THREE.Mesh;
    /** A child's cavity in the screen itself, under its parent's cavity and any overhang. */
    screenSocket: THREE.Mesh | null;
  }[];
  socketMat: THREE.MeshBasicMaterial;
};

function applyLayers(g: THREE.Group, parts: LayerParts, state: PhoneState) {
  const e = state.explode;
  const on = state.visible && e > 0.002;
  g.visible = on;
  if (!on) return;
  parts.material.opacity = state.fade;
  parts.rimMaterial.opacity = 0.55 * smooth(e * 1.4);
  // One shared socket material: the cavity each element leaves behind.
  parts.socketMat.opacity = 0.9 * smooth(e * 2) * state.fade;
  const n = parts.items.length;
  const zs: number[] = [];
  parts.items.forEach((it, j) => {
    // Stagger: each layer lifts a touch after the previous one.
    const lag = (j / Math.max(1, n - 1)) * 0.3;
    const ej = smooth((e - lag) / (1 - lag));
    const baseZ = it.spec.parent !== undefined ? zs[it.spec.parent] : SCREEN_Z;
    const z = Math.max(baseZ + 0.004, SCREEN_Z + 0.0015 + it.spec.lift * ej);
    zs[j] = z;
    const pop = 1 + 0.02 * ej;
    it.layer.position.set(it.rect.x, it.rect.y, z);
    it.layer.scale.set(pop, pop, 1);
    const k = ej * (it.spec.lift / 0.3);
    it.socket.position.set(it.rect.x, it.rect.y, baseZ + 0.0006);
    it.socket.visible = ej > 0.01;
    if (it.screenSocket) {
      it.screenSocket.position.set(it.rect.x, it.rect.y, SCREEN_Z + 0.0006);
      it.screenSocket.visible = ej > 0.01;
    }
    it.shadow.position.set(it.rect.x + 0.018 * k, it.rect.y - 0.034 * k, baseZ + 0.0009);
    const grow = 1 + 0.08 * ej;
    it.shadow.scale.set(grow, grow, 1);
    it.shadowMat.opacity = 0.7 * ej * state.fade;
  });
}

function ExplodedLayers({
  specs,
  map,
  state,
  segments,
}: {
  specs: LayerSpec[];
  map: THREE.Texture;
  state: PhoneState;
  segments: number;
}) {
  const root = useRef<THREE.Group>(null);
  const parts = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ map, toneMapped: false, alphaHash: true });
    const rimMaterial = new THREE.LineBasicMaterial({
      color: "#8ccBff",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const socketMat = new THREE.MeshBasicMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    const items = specs.map((spec) => {
      const rect = layerRect(spec);
      const geo = layerGeometry(spec, segments);
      // A child's cavity on its parent covers only the overlap; the screen
      // gets a full-size cavity of its own for the part that overhangs.
      const parent = spec.parent !== undefined ? specs[spec.parent] : undefined;
      const socketGeo = parent ? clippedLayerGeometry(spec, parent) : geo;
      const shadowTex = createLayerShadowTexture(spec);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        color: "#000000",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      });
      const shadowGeo = new THREE.PlaneGeometry(rect.w + SHADOW_PAD * 2, rect.h + SHADOW_PAD * 2);
      const rimGeo = new THREE.BufferGeometry().setFromPoints(
        roundedRectShape(rect.w, rect.h, rect.r).getSpacedPoints(96),
      );
      const layer = new THREE.Mesh(geo, material);
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      const socket = new THREE.Mesh(socketGeo, socketMat);
      socket.renderOrder = 2;
      const screenSocket = parent ? new THREE.Mesh(geo, socketMat) : null;
      if (screenSocket) screenSocket.renderOrder = 2;
      const rim = new THREE.Line(rimGeo, rimMaterial);
      layer.renderOrder = 4;
      shadow.renderOrder = 3;
      rim.renderOrder = 5;
      layer.add(rim);
      return { spec, rect, layer, shadow, socket, screenSocket, shadowMat, shadowTex, geo, socketGeo, shadowGeo, rimGeo };
    });
    return { material, rimMaterial, socketMat, items };
  }, [specs, map, segments]);

  useEffect(
    () => () => {
      parts.material.dispose();
      parts.rimMaterial.dispose();
      parts.socketMat.dispose();
      parts.items.forEach((it) => {
        it.geo.dispose();
        it.socketGeo.dispose();
        it.shadowGeo.dispose();
        it.rimGeo.dispose();
        it.shadowMat.dispose();
        it.shadowTex.dispose();
      });
    },
    [parts],
  );

  useFrame(() => {
    if (root.current) applyLayers(root.current, parts, state);
  });

  return (
    <group ref={root} visible={false}>
      {parts.items.map((it, j) => (
        <group key={j}>
          <primitive object={it.layer} />
          <primitive object={it.socket} />
          {it.screenSocket ? <primitive object={it.screenSocket} /> : null}
          <primitive object={it.shadow} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Screen light spill                                                   */
/* ------------------------------------------------------------------ */

function applySpill(mat: THREE.MeshBasicMaterial, state: PhoneState, strength: number) {
  mat.opacity = strength * smooth((state.reveal - 0.3) / 0.7) * state.fade * (0.35 + 0.65 * state.front);
}

function Spill({
  geometry,
  map,
  color,
  state,
  strength,
}: {
  geometry: THREE.BufferGeometry;
  map: THREE.Texture;
  color: string;
  state: PhoneState;
  strength: number;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map,
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [map, color],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(() => applySpill(mat, state, strength));
  return (
    <mesh
      geometry={geometry}
      material={mat}
      position={[0, -0.1, -FRONT - 0.35]}
      scale={[PHONE_W * 3.1, PHONE_H * 1.55, 1]}
      renderOrder={-1}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Solid phone (real screenshot)                                        */
/* ------------------------------------------------------------------ */

type SolidMats = {
  frame: THREE.MeshStandardMaterial;
  refl: THREE.MeshStandardMaterial;
  screen: THREE.ShaderMaterial;
  hashed: THREE.Material[];
};

function applySolid(g: THREE.Group, mats: SolidMats, state: PhoneState, time: number) {
  g.visible = state.visible;
  if (!state.visible) return;
  const body = smooth(state.reveal / 0.62) * state.fade;
  for (const m of mats.hashed) {
    m.opacity = body;
    m.visible = body > 0.003;
  }
  mats.frame.emissiveIntensity = 1.6 * (1 - smooth(state.reveal / 0.85));
  const u = mats.screen.uniforms;
  u.uReveal.value = smooth((state.reveal - 0.28) / 0.72);
  // The dark glass arrives with the body; the image then wipes in over it.
  u.uOpacity.value = Math.min(state.fade, smooth(state.reveal / 0.45));
  u.uTime.value = time;
  mats.refl.opacity = body;
}

export function SolidPhone({
  kit,
  state,
  url,
  finish,
  layers,
  spillMap,
  spillColor,
}: {
  kit: PhoneKit;
  state: PhoneState;
  url: string;
  finish: Finish;
  layers: LayerSpec[];
  spillMap: THREE.Texture;
  spillColor: string;
}) {
  const gl = useThree((s) => s.gl);
  const tex = useTexture(url, (loaded) => {
    const t = Array.isArray(loaded) ? loaded[0] : loaded;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    t.needsUpdate = true;
  });
  const group = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const frame = new THREE.MeshStandardMaterial({
      color: finish.frame,
      metalness: 1,
      roughness: finish.roughness,
      envMapIntensity: 1.25,
      emissive: new THREE.Color("#1E90F0"),
      emissiveIntensity: 0,
      alphaHash: true,
    });
    const back = new THREE.MeshStandardMaterial({
      color: finish.back,
      metalness: 0.35,
      roughness: 0.55,
      alphaHash: true,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: "#020203",
      metalness: 0,
      roughness: 0.14,
      envMapIntensity: 1.4,
      alphaHash: true,
    });
    const island = new THREE.MeshBasicMaterial({ color: "#000000", alphaHash: true });
    const bump = new THREE.MeshStandardMaterial({
      color: finish.back,
      metalness: 0.5,
      roughness: 0.35,
      alphaHash: true,
    });
    const lens = new THREE.MeshStandardMaterial({ color: "#0b0b0d", metalness: 1, roughness: 0.22, alphaHash: true });
    const lensGlass = new THREE.MeshStandardMaterial({
      color: "#05070d",
      metalness: 0.2,
      roughness: 0.04,
      envMapIntensity: 2,
      alphaHash: true,
    });
    // Glass reflection over the screen: black diffuse, additive, so only the
    // environment's specular highlight lands on the screenshot.
    const refl = new THREE.MeshStandardMaterial({
      color: "#000000",
      metalness: 0,
      roughness: 0.06,
      envMapIntensity: 0.9,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const screen = createScreenMaterial(tex);
    const hashed = [frame, back, glass, island, bump, lens, lensGlass];
    return { frame, back, glass, island, bump, lens, lensGlass, refl, screen, hashed };
  }, [tex, finish]);

  useEffect(
    () => () => {
      mats.hashed.forEach((m) => m.dispose());
      mats.refl.dispose();
      mats.screen.dispose();
    },
    [mats],
  );

  useFrame((st) => {
    if (group.current) applySolid(group.current, mats, state, st.clock.elapsedTime);
  });

  const sx = PHONE_W / 2 + 0.006;
  const bx = PHONE_W / 2 - 0.4;
  const by = PHONE_H / 2 - 0.4;
  return (
    <group ref={group} visible={false}>
      <mesh geometry={kit.body} material={[mats.back, mats.frame]} />
      <mesh geometry={kit.glass} material={mats.glass} position-z={FRONT + 0.0012} />
      <mesh geometry={kit.screen} material={mats.screen} position-z={SCREEN_Z} />
      <mesh geometry={kit.screen} material={mats.refl} position-z={SCREEN_Z + 0.0035} renderOrder={6} />
      <mesh geometry={kit.island} material={mats.island} position={[0, ISLAND.y, SCREEN_Z + 0.0015]} />

      {/* Buttons: action + volume on the left, side button on the right. */}
      <mesh geometry={kit.buttonAction} material={mats.frame} position={[-sx, 0.86, 0]} />
      <mesh geometry={kit.buttonShort} material={mats.frame} position={[-sx, 0.6, 0]} />
      <mesh geometry={kit.buttonShort} material={mats.frame} position={[-sx, 0.32, 0]} />
      <mesh geometry={kit.buttonLong} material={mats.frame} position={[sx, 0.48, 0]} />

      {/* Camera plateau on the back (top-left seen from behind). */}
      <mesh geometry={kit.bump} material={mats.bump} position={[bx, by, -FRONT - 0.012]} />
      {[
        [-0.14, 0.14],
        [-0.14, -0.14],
        [0.14, 0],
      ].map(([lx, ly], i) => (
        <group key={i} position={[bx + lx, by + ly, -FRONT - 0.045]}>
          <mesh geometry={kit.lens} material={mats.lens} rotation-x={Math.PI / 2} />
          <mesh geometry={kit.lensGlass} material={mats.lensGlass} position-z={-0.026} rotation-y={Math.PI} />
        </group>
      ))}

      <Spill geometry={kit.spill} map={spillMap} color={spillColor} state={state} strength={0.5} />
      <ExplodedLayers specs={layers} map={tex} state={state} segments={kit.detail * 4} />
    </group>
  );
}
