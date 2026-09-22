"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, MeshTransmissionMaterial } from "@react-three/drei";
import {
  BULB_H,
  CAM_Z,
  GLASS_OFFSET,
  MODEL_CENTER,
  bus,
  dampPose,
  flicker,
  makePose,
  posesFor,
  sampleTrack,
  switchAt,
  viewportAt,
  type Pose,
} from "./choreography";

const BLUE = "#1E90F0";
const YELLOW = "#FFD23F";

/** A tungsten coil: a helix wound around a gently arched path. */
class CoilCurve extends THREE.Curve<THREE.Vector3> {
  half = 0.27;
  baseY = 1.2;
  arch = 0.07;
  radius = 0.032;
  turns = 17;

  // Curve's constructor is protected in the typings; re-expose it.
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const x = -this.half + 2 * this.half * t;
    const y = this.baseY + this.arch * Math.sin(Math.PI * t);
    const a = t * this.turns * Math.PI * 2;
    // Let the coil unwind at each end so it meets the lead-in wires.
    const env = Math.min(1, Math.sin(Math.PI * t) * 5);
    return target.set(
      x,
      y + Math.cos(a) * this.radius * env,
      Math.sin(a) * this.radius * env,
    );
  }
}

type Geometries = {
  glass: THREE.LatheGeometry;
  screwA: THREE.LatheGeometry;
  screwB: THREE.LatheGeometry;
  insulator: THREE.LatheGeometry;
  tip: THREE.LatheGeometry;
  filament: THREE.TubeGeometry;
  wires: THREE.TubeGeometry[];
  ray: THREE.CapsuleGeometry;
};

function buildGeometries(detail: "high" | "low"): Geometries {
  const V2 = THREE.Vector2;
  const segs = detail === "high" ? 72 : 44;

  // Glass: A19 envelope, profile drawn bottom -> top so normals face out.
  const glassPts: THREE.Vector2[] = [
    new V2(0.395, 0.0),
    new V2(0.405, 0.1),
    new V2(0.43, 0.22),
  ];
  for (let i = 0; i <= 18; i++) {
    const a = -1.08 + (i / 18) * (Math.PI / 2 + 1.08);
    glassPts.push(
      new V2(Math.max(0.0001, Math.cos(a) * 0.98), 1.28 + Math.sin(a) * 0.98),
    );
  }
  const glassProfile = new THREE.SplineCurve(glassPts).getPoints(
    detail === "high" ? 110 : 64,
  );
  const glass = new THREE.LatheGeometry(glassProfile, segs);

  // Screw base: sinusoidal thread, split into two halves (blue / yellow)
  // like the logo.
  const screwPts: THREE.Vector2[] = [new V2(0.37, -0.47)];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = -0.46 + t * 0.44;
    screwPts.push(new V2(0.405 + 0.028 * Math.sin(t * 4.5 * Math.PI * 2), y));
  }
  screwPts.push(new V2(0.435, -0.02), new V2(0.435, 0.03), new V2(0.36, 0.03));
  const half = Math.round(segs / 2);
  const screwA = new THREE.LatheGeometry(screwPts, half, 0, Math.PI);
  const screwB = new THREE.LatheGeometry(screwPts, half, Math.PI, Math.PI);

  const insulator = new THREE.LatheGeometry(
    [
      new V2(0.15, -0.57),
      new V2(0.26, -0.53),
      new V2(0.33, -0.495),
      new V2(0.37, -0.47),
    ],
    segs,
  );
  const tip = new THREE.LatheGeometry(
    [
      new V2(0.0001, -0.64),
      new V2(0.08, -0.632),
      new V2(0.13, -0.605),
      new V2(0.15, -0.57),
    ],
    segs / 2,
  );

  const filament = new THREE.TubeGeometry(
    new CoilCurve(),
    detail === "high" ? 520 : 260,
    0.0085,
    6,
    false,
  );

  const V3 = THREE.Vector3;
  const wire = (a: THREE.Vector3, b: THREE.Vector3) =>
    new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, 0.006, 5, false);
  const wires = [
    wire(new V3(-0.06, 0.3, 0), new V3(-0.27, 1.2, 0)),
    wire(new V3(0.06, 0.3, 0), new V3(0.27, 1.2, 0)),
    wire(new V3(0, 0.62, 0), new V3(0, 1.27, 0)),
  ];

  const ray = new THREE.CapsuleGeometry(0.032, 0.2, 4, 10);

  return { glass, screwA, screwB, insulator, tip, filament, wires, ray };
}

/** The logo's rays: blue on the left and crown, yellow on the right. */
const RAYS = [
  { deg: 90, color: BLUE },
  { deg: 124, color: BLUE },
  { deg: 152, color: BLUE },
  { deg: 180, color: BLUE },
  { deg: 208, color: BLUE },
  { deg: 56, color: YELLOW },
  { deg: 28, color: YELLOW },
  { deg: 0, color: YELLOW },
  { deg: -28, color: YELLOW },
].map((r) => {
  const a = (r.deg * Math.PI) / 180;
  const radius = 1.42;
  return {
    ...r,
    position: [Math.cos(a) * radius, GLASS_OFFSET + Math.sin(a) * radius, 0] as [
      number,
      number,
      number,
    ],
    rotation: a - Math.PI / 2,
  };
});

export function Bulb({ wide, still }: { wide: boolean; still: boolean }) {
  const geo = useMemo(() => buildGeometries(wide ? "high" : "low"), [wide]);

  const poseRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Group>(null);
  const filamentMat = useRef<THREE.MeshStandardMaterial>(null);
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Mutable frame state lives in refs so the loop never re-renders React.
  const frame = useRef({
    target: makePose(),
    cur: null as Pose | null,
    sw: still ? 1 : 0,
    px: 0,
    py: 0,
    poses: [] as Pose[],
    key: "",
    tmp: new THREE.Vector3(),
  });

  useFrame((state, delta) => {
    const f = frame.current;
    const { size, camera, clock } = state;
    const { W, H } = viewportAt(size.width / Math.max(1, size.height));

    const key = `${W.toFixed(3)}:${H.toFixed(3)}:${wide}`;
    if (key !== f.key) {
      f.poses = posesFor(W, H, wide);
      f.key = key;
    }

    const scrollY = still ? 0 : window.scrollY;
    sampleTrack(scrollY, f.poses, f.target);
    if (!f.cur) f.cur = { ...f.target };
    const dt = Math.min(delta, 0.1);
    dampPose(f.cur, f.target, still ? 1 : 1 - Math.exp(-dt * 5));
    const cur = f.cur;

    const sw = still ? 1 : switchAt(scrollY);
    f.sw += (sw - f.sw) * (still ? 1 : 1 - Math.exp(-dt * 10));
    const light = still ? 1 : flicker(f.sw);

    // Pointer follow (desktop only; bus.pointer stays 0 elsewhere).
    const pk = still ? 1 : 1 - Math.exp(-dt * 3);
    f.px += (bus.pointer.x - f.px) * pk;
    f.py += (bus.pointer.y - f.py) * pk;

    const t = clock.elapsedTime;
    const bob = still ? 0 : Math.sin(t * 0.9) * 0.018 * cur.s;

    const pose = poseRef.current;
    if (pose) {
      pose.position.set(cur.x, cur.y + bob, cur.z);
      pose.scale.setScalar(Math.max(0.001, cur.s));
    }
    const tilt = tiltRef.current;
    if (tilt) {
      tilt.rotation.set(cur.rx - f.py * 0.14, 0, cur.rz - f.px * 0.06);
    }
    const spin = spinRef.current;
    if (spin) spin.rotation.y = still ? 0.55 : t * 0.22 + f.px * 0.6;

    const shadow = shadowRef.current;
    if (shadow) {
      shadow.visible = cur.shadow > 0.02;
      shadow.scale.setScalar(Math.max(0.001, cur.shadow));
    }

    if (filamentMat.current) filamentMat.current.emissiveIntensity = 0.05 + light * 6;
    if (glassMat.current) glassMat.current.emissiveIntensity = light * 0.3;
    if (lightRef.current) lightRef.current.intensity = light * 5;
    const rays = raysRef.current;
    if (rays) {
      rays.visible = light > 0.03;
      rays.scale.setScalar(0.55 + 0.45 * light);
    }

    // Subtle camera choreography: drift against the bulb and the pointer.
    if (!still) {
      camera.position.set(-cur.x * 0.06 + f.px * 0.18, cur.y * 0.05 + f.py * 0.1, CAM_Z);
      camera.lookAt(0, 0, 0);
    }

    // Publish for the backdrop glow and phones.
    if (tilt) {
      tilt.updateWorldMatrix(true, false);
      const p = tilt.localToWorld(f.tmp.set(0, GLASS_OFFSET, 0)).project(camera);
      bus.glowUv.set((p.x + 1) / 2, (p.y + 1) / 2);
    }
    bus.cur = cur;
    bus.light = light;
    bus.W = W;
    bus.H = H;
    bus.workX = f.poses[2]?.x ?? 0;
  });

  return (
    <group ref={poseRef}>
      <group ref={shadowRef} position={[0, -BULB_H / 2 - 0.01, 0]}>
        <ContactShadows
          scale={3.4}
          far={1.6}
          blur={2.6}
          opacity={0.5}
          resolution={wide ? 256 : 128}
          frames={1}
          color="#0d2a52"
        />
      </group>

      <group ref={tiltRef}>
        <group ref={raysRef} visible={false}>
          {RAYS.map((r) => (
            <mesh
              key={r.deg}
              geometry={geo.ray}
              position={r.position}
              rotation={[0, 0, r.rotation]}
            >
              <meshBasicMaterial color={r.color} toneMapped={false} />
            </mesh>
          ))}
        </group>

        <group ref={spinRef}>
          <group position={[0, -MODEL_CENTER, 0]}>
            <mesh geometry={geo.glass}>
              {wide ? (
                <MeshTransmissionMaterial
                  ref={glassMat as never}
                  transmission={1}
                  thickness={0.28}
                  roughness={0.03}
                  ior={1.45}
                  chromaticAberration={0.035}
                  anisotropicBlur={0.08}
                  distortion={0}
                  samples={6}
                  resolution={512}
                  backside={false}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                  color="#ffffff"
                  emissive={YELLOW}
                  emissiveIntensity={0}
                />
              ) : (
                <meshPhysicalMaterial
                  ref={glassMat}
                  transmission={1}
                  thickness={0.28}
                  roughness={0.04}
                  ior={1.45}
                  clearcoat={1}
                  color="#ffffff"
                  emissive={YELLOW}
                  emissiveIntensity={0}
                />
              )}
            </mesh>

            {/* Glass stem, lead-in wires, coil */}
            <mesh position={[0, 0.33, 0]}>
              <cylinderGeometry args={[0.045, 0.07, 0.6, 16]} />
              <meshPhysicalMaterial
                color="#e6eef8"
                roughness={0.12}
                transparent
                opacity={0.55}
              />
            </mesh>
            {geo.wires.map((w, i) => (
              <mesh key={i} geometry={w}>
                <meshStandardMaterial color="#9aa3ad" metalness={1} roughness={0.35} />
              </mesh>
            ))}
            <mesh geometry={geo.filament}>
              <meshStandardMaterial
                ref={filamentMat}
                color="#3a302a"
                emissive="#FFB547"
                emissiveIntensity={0.05}
                toneMapped={false}
              />
            </mesh>
            <pointLight
              ref={lightRef}
              position={[0, 1.22, 0]}
              color="#FFC870"
              intensity={0}
              distance={6}
              decay={2}
            />

            {/* Screw base in the logo's two colours */}
            <mesh geometry={geo.screwA}>
              <meshStandardMaterial
                color={BLUE}
                metalness={0.85}
                roughness={0.26}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh geometry={geo.screwB}>
              <meshStandardMaterial
                color={YELLOW}
                metalness={0.85}
                roughness={0.26}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh geometry={geo.insulator}>
              <meshPhysicalMaterial
                color="#111111"
                roughness={0.18}
                clearcoat={1}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh geometry={geo.tip}>
              <meshStandardMaterial
                color="#c9a45c"
                metalness={1}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
