"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { StaticBackdrop } from "./static-backdrop";

const SignalCanvas = dynamic(() => import("./signal-canvas"), {
  ssr: false,
  loading: () => (
    <div className="sg-canvas" aria-hidden="true">
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

export function SignalBackdrop({
  reduced,
  mobile,
}: {
  reduced: boolean;
  mobile: boolean;
}) {
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, serverNull);

  if (webgl !== true) {
    return (
      <div className="sg-canvas" aria-hidden="true">
        <StaticBackdrop />
      </div>
    );
  }
  // Remount when the device class flips so particle counts follow.
  return <SignalCanvas key={mobile ? "m" : "d"} reduced={reduced} mobile={mobile} />;
}
