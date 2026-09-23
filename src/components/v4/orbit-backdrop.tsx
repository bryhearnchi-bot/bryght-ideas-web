"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { StaticBackdrop } from "./static-backdrop";

const OrbitCanvas = dynamic(() => import("./orbit-canvas"), {
  ssr: false,
  loading: () => (
    <div className="so-canvas" aria-hidden="true">
      <StaticBackdrop />
    </div>
  ),
});

let webglCache: boolean | null = null;
function hasWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noopSubscribe = () => () => {};
const serverNull = () => null;

/** true / false once known on the client, null during SSR and hydration. */
export function useWebGL() {
  return useSyncExternalStore(noopSubscribe, hasWebGL, serverNull);
}

export function OrbitBackdrop({
  reduced,
  mobile,
  webgl,
}: {
  reduced: boolean;
  mobile: boolean;
  webgl: boolean | null;
}) {
  if (webgl !== true) {
    return (
      <div className="so-canvas" aria-hidden="true">
        <StaticBackdrop />
      </div>
    );
  }
  // Remount when the device class flips so particle counts follow.
  return <OrbitCanvas key={mobile ? "m" : "d"} reduced={reduced} mobile={mobile} />;
}
