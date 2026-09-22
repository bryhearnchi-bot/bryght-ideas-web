"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

/** Phone height in model units; the rig scales it to the viewport. */
export const PHONE_H = 2.8;
const BEZEL = 0.07;
const SCREEN_H = PHONE_H - BEZEL * 2;
// The screen has exactly the screenshots' aspect (1320 x 2868), so nothing is cropped.
const SCREEN_W = SCREEN_H * (1320 / 2868);
export const PHONE_W = SCREEN_W + BEZEL * 2;
const DEPTH = 0.15;
const CORNER = 0.2;
const EDGE = 0.035;

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Flat rounded rectangle with UVs normalised to 0..1 so a texture fills it exactly. */
function roundedPlane(w: number, h: number, r: number, segments: number) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), segments);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  }
  uv.needsUpdate = true;
  return geo;
}

function bodyGeometry(detail: number) {
  const depth = DEPTH - EDGE * 2;
  const geo = new THREE.ExtrudeGeometry(
    roundedRectShape(PHONE_W - EDGE * 2, PHONE_H - EDGE * 2, CORNER - EDGE),
    {
      depth,
      bevelEnabled: true,
      bevelThickness: EDGE,
      bevelSize: EDGE,
      bevelSegments: detail,
      curveSegments: detail * 4,
    },
  );
  geo.translate(0, 0, -depth / 2);
  return geo;
}

export type PhoneGeometries = {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  screen: THREE.BufferGeometry;
  island: THREE.BufferGeometry;
};

/** Geometry is shared by all three phones. */
export function usePhoneGeometries(detail: number): PhoneGeometries {
  return useMemo(
    () => ({
      body: bodyGeometry(detail),
      glass: roundedPlane(PHONE_W - 0.02, PHONE_H - 0.02, CORNER - 0.01, detail * 4),
      screen: roundedPlane(SCREEN_W, SCREEN_H, CORNER - BEZEL, detail * 4),
      island: roundedPlane(0.4, 0.11, 0.055, 6),
    }),
    [detail],
  );
}

export type PhoneFinish = {
  color: string;
  metalness: number;
  roughness: number;
};

export function Phone({
  geo,
  screen,
  glare,
  finish,
  detail,
}: {
  geo: PhoneGeometries;
  screen: THREE.Texture;
  glare: THREE.Texture;
  finish: PhoneFinish;
  detail: number;
}) {
  const front = DEPTH / 2;
  return (
    <group>
      <mesh geometry={geo.body} castShadow>
        <meshStandardMaterial
          color={finish.color}
          metalness={finish.metalness}
          roughness={finish.roughness}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Black glass front */}
      <mesh geometry={geo.glass} position-z={front + 0.001}>
        <meshStandardMaterial color="#050505" metalness={0.2} roughness={0.08} />
      </mesh>

      {/* Screen: unlit so the real screenshot colours stay true */}
      <mesh geometry={geo.screen} position-z={front + 0.006} renderOrder={1}>
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>

      {/* Glass glare */}
      <mesh geometry={geo.screen} position-z={front + 0.009} renderOrder={2}>
        <meshBasicMaterial map={glare} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Dynamic island */}
      <mesh geometry={geo.island} position={[0, SCREEN_H / 2 - 0.12, front + 0.012]} renderOrder={3}>
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Side buttons */}
      <RoundedBox
        args={[0.04, 0.34, 0.07]}
        radius={0.015}
        smoothness={2}
        position={[PHONE_W / 2 + 0.008, 0.5, 0]}
      >
        <meshStandardMaterial color={finish.color} metalness={finish.metalness} roughness={finish.roughness} />
      </RoundedBox>
      <RoundedBox
        args={[0.04, 0.22, 0.07]}
        radius={0.015}
        smoothness={2}
        position={[-PHONE_W / 2 - 0.008, 0.68, 0]}
      >
        <meshStandardMaterial color={finish.color} metalness={finish.metalness} roughness={finish.roughness} />
      </RoundedBox>
      <RoundedBox
        args={[0.04, 0.22, 0.07]}
        radius={0.015}
        smoothness={2}
        position={[-PHONE_W / 2 - 0.008, 0.38, 0]}
      >
        <meshStandardMaterial color={finish.color} metalness={finish.metalness} roughness={finish.roughness} />
      </RoundedBox>

      {/* Camera bump on the back */}
      <RoundedBox
        args={[0.56, 0.56, 0.06]}
        radius={0.025}
        smoothness={detail}
        position={[-PHONE_W / 2 + 0.38, PHONE_H / 2 - 0.38, -front - 0.02]}
      >
        <meshStandardMaterial color="#0c0c0c" metalness={0.5} roughness={0.25} />
      </RoundedBox>
      {[
        [-0.12, 0.12],
        [0.12, -0.12],
        [-0.12, -0.12],
      ].map(([lx, ly], i) => (
        <mesh
          key={i}
          rotation-x={Math.PI / 2}
          position={[-PHONE_W / 2 + 0.38 + lx, PHONE_H / 2 - 0.38 + ly, -front - 0.06]}
        >
          <cylinderGeometry args={[0.085, 0.085, 0.04, detail * 8]} />
          <meshStandardMaterial color="#020202" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
