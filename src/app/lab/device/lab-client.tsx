"use client";

/**
 * Private test bench for the device rig: a full-screen canvas configured
 * like the real page's, containing only the rig, plus a scrubber for
 * showcase.t. Query string: ?t=2.45 (stage), ?m=1 (mobile detail), ?r=1
 * (reduced motion), ?ui=0 (hide the controls for clean screenshots).
 */
import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import DeviceRig from "@/components/site/device/device-rig";
import { isStacked } from "@/components/site/device/poses";
import { showcase } from "@/components/site/showcase-store";

const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(22.5));

/** Same camera distance rule as the real page. */
function CameraDolly({ mobile }: { mobile: boolean }) {
  useFrame((state) => {
    const { camera, size } = state;
    const aspect = size.width / Math.max(1, size.height);
    const need = mobile ? 1.95 : 2.0;
    camera.position.z = aspect < 1.1 ? Math.max(6.2, need / (TAN_HALF_FOV * aspect)) : 6.2;
    camera.updateMatrixWorld();
  }, -2);
  return null;
}

type Params = { t: number; m: boolean; r: boolean; ui: boolean };

function readParams(): Params {
  const q = new URLSearchParams(window.location.search);
  const t = Number(q.get("t"));
  return {
    t: Number.isFinite(t) ? THREE.MathUtils.clamp(t, 0, 5) : 0,
    m: q.get("m") === "1",
    r: q.get("r") === "1",
    ui: q.get("ui") !== "0",
  };
}

export default function LabClient() {
  const [params, setParams] = useState<Params | null>(null);
  const [t, setT] = useState(0);
  const [stacked, setStacked] = useState(false);

  useEffect(() => {
    const p = readParams();
    showcase.t = p.t;
    showcase.presence = 1;
    // Handle for the headless screenshot script to scrub t without a reload.
    (window as unknown as { __showcase?: typeof showcase }).__showcase = showcase;
    const onResize = () => setStacked(isStacked(window.innerWidth, window.innerHeight));
    onResize();
    window.addEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once on mount
    setParams(p);
    setT(p.t);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!params) return <main style={{ position: "fixed", inset: 0, background: "#0A0D14" }} />;
  const mobile = params.m;

  return (
    <main style={{ position: "fixed", inset: 0, background: "#0A0D14", overflow: "hidden" }}>
      {/* Where the page's HTML will sit (the app panel when stacked), to judge composition. */}
      <div
        aria-hidden="true"
        style={
          stacked
            ? {
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 52,
                height: 245,
                borderRadius: 18,
                border: "1px solid rgba(238,243,251,0.08)",
                background: "rgba(238,243,251,0.03)",
              }
            : {
                position: "absolute",
                left: "5%",
                width: "33%",
                top: "22%",
                bottom: "22%",
                borderRadius: 18,
                border: "1px solid rgba(238,243,251,0.08)",
                background: "rgba(238,243,251,0.03)",
              }
        }
      />
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 45, position: [0, 0, 6.2], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", touchAction: "pan-y" }}
      >
        <CameraDolly mobile={mobile} />
        <DeviceRig mobile={mobile} reduced={params.r} />
      </Canvas>
      {params.ui ? (
        <label
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            display: "flex",
            gap: 10,
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(10,13,20,0.85)",
            border: "1px solid rgba(238,243,251,0.15)",
            color: "#EEF3FB",
            font: "12px/1 ui-monospace, monospace",
            zIndex: 2,
          }}
        >
          t
          <input
            type="range"
            min={0}
            max={5}
            step={0.01}
            value={t}
            onChange={(e) => {
              const v = Number(e.target.value);
              showcase.t = v;
              setT(v);
            }}
            style={{ width: 220 }}
          />
          <span style={{ width: 34, textAlign: "right" }}>{t.toFixed(2)}</span>
        </label>
      ) : null}
    </main>
  );
}
