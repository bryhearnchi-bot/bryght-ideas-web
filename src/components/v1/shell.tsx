"use client";

import { Component, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMediaQuery, useWebGLSupport } from "./hooks";
import { FilamentNav } from "./nav";
import { VersionSwitcher } from "./version-switcher";
import "./filament.css";

const FilamentCanvas = dynamic(() => import("./scene/filament-canvas"), {
  ssr: false,
  loading: () => null,
});

/** Catches a WebGL / renderer failure and swaps in the static fallback. */
class CanvasBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Non-3D stand-in: shown while the scene loads and when WebGL is absent. */
function StaticBulb() {
  return (
    <div className="f1-static-bulb">
      <Image
        src="/logo-lightbulb.png"
        alt=""
        width={1024}
        height={1536}
        priority
        sizes="(min-width: 1024px) 360px, 200px"
      />
    </div>
  );
}

export function FilamentShell({ children }: { children: ReactNode }) {
  const webgl = useWebGLSupport();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const canRender = webgl === true && !failed;
  // Reduced motion: one still frame, confined to the hero, no scroll scrub.
  const pinned = canRender && !reduced;
  const sceneOn = canRender && ready && !reduced;

  return (
    <div
      className="f1-root"
      data-scene={sceneOn ? "on" : "off"}
    >
      <div className="f1-stage" data-pinned={pinned} aria-hidden="true">
        <div className="f1-placeholder" data-hidden={canRender && ready}>
          <StaticBulb />
        </div>
        {canRender ? (
          <div className="f1-canvas" data-ready={ready}>
            <CanvasBoundary onError={() => setFailed(true)}>
              <FilamentCanvas still={reduced} onReady={() => setReady(true)} />
            </CanvasBoundary>
          </div>
        ) : null}
      </div>

      <FilamentNav />
      <main className="relative z-10">{children}</main>
      <VersionSwitcher current="/v1" />
    </div>
  );
}
