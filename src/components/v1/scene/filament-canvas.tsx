"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import { useMediaQuery, usePageVisible } from "../hooks";
import { Backdrop } from "./backdrop";
import { Bulb } from "./bulb";
import { CAM_Z, FOV, bus, measureStops } from "./choreography";
import { Phones } from "./phones";

/**
 * In still (reduced-motion) mode the loop is on demand; nudge a few
 * frames so the environment, shadows and transmission buffer settle.
 */
function SettleFrames() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const ids = [0, 60, 250, 700, 1500].map((ms) => window.setTimeout(() => invalidate(), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [invalidate]);
  return null;
}

function Studio({ wide }: { wide: boolean }) {
  return (
    <Environment resolution={wide ? 256 : 128} frames={1}>
      <color attach="background" args={["#b9c7db"]} />
      {/* Overhead softbox */}
      <Lightformer form="rect" intensity={2.4} position={[0, 5, -2]} scale={[9, 4, 1]} />
      {/* Left strip */}
      <Lightformer form="rect" intensity={1.8} position={[-5, 1, 1]} scale={[2.5, 7, 1]} />
      {/* Brand-blue kicker, right */}
      <Lightformer form="rect" intensity={1.4} color="#1E90F0" position={[5, 0.5, -0.5]} scale={[2.5, 7, 1]} />
      {/* Front ring for the catchlight */}
      <Lightformer form="ring" intensity={1.2} position={[0, 1, 7]} scale={2.4} />
      {/* Warm floor bounce */}
      <Lightformer form="rect" intensity={0.5} color="#FFE2A0" position={[0, -5, 0]} scale={[9, 9, 1]} />
    </Environment>
  );
}

export default function FilamentCanvas({
  still,
  onReady,
}: {
  still: boolean;
  onReady: () => void;
}) {
  const wide = useMediaQuery("(min-width: 1024px)");
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const visible = usePageVisible();

  // Section positions drive the choreography; re-measure whenever layout
  // shifts (resize, fonts, images).
  useEffect(() => {
    if (still) return;
    measureStops();
    const onResize = () => measureStops();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ro.disconnect();
    };
  }, [still]);

  // Pointer follow on desktop with a real mouse only. Touch devices keep
  // an idle drift and never have gestures intercepted.
  useEffect(() => {
    const pointer = bus.pointer;
    pointer.x = 0;
    pointer.y = 0;
    if (still || !wide || !finePointer) return;
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [still, wide, finePointer]);

  return (
    <Canvas
      flat
      dpr={wide ? [1, 1.75] : [1, 1.5]}
      frameloop={!visible ? "never" : still ? "demand" : "always"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      style={{ pointerEvents: "none", touchAction: "pan-y" }}
      aria-hidden
    >
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAM_Z]} near={0.1} far={100}>
        <Backdrop />
      </PerspectiveCamera>

      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <Studio wide={wide} />

      <Bulb key={wide ? "wide" : "narrow"} wide={wide} still={still} />
      {wide && !still ? (
        <Suspense fallback={null}>
          <Phones />
        </Suspense>
      ) : null}
      {still ? <SettleFrames /> : null}
    </Canvas>
  );
}
