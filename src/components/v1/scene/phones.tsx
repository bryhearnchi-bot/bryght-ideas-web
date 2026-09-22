"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { siteConfig } from "@/config/site";
import { bus } from "./choreography";

/** Screenshots are 1320 x 2868 portrait captures. */
const SCREEN_ASPECT = 1320 / 2868;
const BEZEL = 0.028;

type AppEntry = (typeof siteConfig.apps)[number];
const withScreens = siteConfig.apps.filter(
  (a: AppEntry): a is AppEntry & { screenshot: string } =>
    "screenshot" in a && typeof a.screenshot === "string",
);

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A rounded screen whose UVs span 0..1 across the rectangle. */
function screenGeometry(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 10);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  }
  uv.needsUpdate = true;
  return g;
}

/** The two apps with screenshots, rising either side of the bulb in Work. */
export function Phones() {
  const urls = useMemo(() => withScreens.map((a) => a.screenshot), []);
  const textures = useTexture(urls, (loaded) => {
    for (const tex of loaded) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    }
  });

  const geo = useMemo(() => {
    const sw = SCREEN_ASPECT;
    const body = new THREE.ExtrudeGeometry(
      roundedRect(sw + BEZEL * 2, 1 + BEZEL * 2, 0.075),
      { depth: 0.035, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3, curveSegments: 10 },
    );
    body.translate(0, 0, -0.0435);
    const screen = screenGeometry(sw, 1, 0.058);
    return { body, screen };
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const phoneRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const v = bus.cur.phones;
    g.visible = v > 0.01;
    if (!g.visible) return;

    const { W, H } = bus;
    const ph = Math.min(2.4, 0.6 * H, 0.34 * W);
    const off = 0.145 * W;
    const t = clock.elapsedTime;
    g.position.set(bus.workX, 0, -0.6);

    phoneRefs.current.forEach((p, i) => {
      if (!p) return;
      const side = i === 0 ? -1 : 1;
      const rise = (1 - v) * -0.75 * H;
      p.position.set(
        side * off,
        side * -0.04 * H + rise + Math.sin(t * 0.7 + i * 1.7) * 0.03,
        0,
      );
      p.rotation.set(0.04, -side * (0.3 + (1 - v) * 0.7), side * 0.035);
      p.scale.setScalar(ph);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {textures.map((tex, i) => (
        <group
          key={urls[i]}
          ref={(el) => {
            phoneRefs.current[i] = el;
          }}
        >
          <mesh geometry={geo.body}>
            <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.28} />
          </mesh>
          <mesh geometry={geo.screen} position={[0, 0, 0.001]}>
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
