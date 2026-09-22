"use client";

import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { RollingWord } from "./rolling-word";
import { siteConfig } from "@/config/site";
import { orbitStore } from "./store";
import { OrbitNav } from "./orbit-nav";

const OrbitScene = dynamic(() => import("./orbit-scene"), { ssr: false, loading: () => null });

type AppEntry = (typeof siteConfig.apps)[number];
const featuredApps = siteConfig.apps.filter((a) => a.name !== "More Coming");
const screenshotOf = (app: AppEntry) => ("screenshot" in app ? app.screenshot : undefined);

/* ---------- WebGL support, read once on the client ---------- */

let webglCache: boolean | null = null;
function detectWebGL() {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noopSubscribe = () => () => {};

/* ---------- Colour ramp for the stage backdrop: blue -> black ---------- */

const BLUE = [0x1e, 0x90, 0xf0];
const INK = [0x11, 0x11, 0x11];
function backdrop(t: number) {
  const f = Math.min(Math.max((t - 0.45) / 0.5, 0), 1);
  const e = f * f * (3 - 2 * f);
  const c = BLUE.map((b, i) => Math.round(b + (INK[i] - b) * e));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/* ---------- Static phones: loading placeholder and no-WebGL fallback ---------- */

function StillPhone({ app, className, eager }: { app: AppEntry; className?: string; eager?: boolean }) {
  const shot = screenshotOf(app);
  // Stay invisible until the screenshot has decoded, so a still never shows as an empty black slab.
  const [loaded, setLoaded] = useState(!shot);
  return (
    <div className={`o2-still-phone ${className ?? ""}`} data-loaded={loaded}>
      {shot ? (
        <Image
          src={shot}
          alt={`${app.name} app screenshot`}
          fill
          sizes="(max-width: 768px) 30vw, 300px"
          className="object-cover"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="o2-still-ahoy">
          <span className="display">{app.name}</span>
          <span className="o2-still-pill">{app.status}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- One app's moment in the showcase ---------- */

function AppPanel({ app, index }: { app: AppEntry; index: number }) {
  const ref = useRef<HTMLElement>(null);
  // The copy fades in while its panel holds the middle of the viewport. It is
  // driven by a class + CSS transition (not per-frame scroll maths) so the
  // active app's text always settles at full opacity.
  const [inView, setInView] = useState<boolean | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "-30% 0px -30% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const live = app.status === "Live";

  return (
    <section
      ref={ref}
      data-orbit-panel
      data-in={inView === null ? undefined : String(inView)}
      className="o2-panel o2-app"
      aria-labelledby={`o2-app-${index}`}
    >
      <div className="o2-app-still">
        <StillPhone app={app} />
      </div>
      <div className="o2-app-copy">
        <div className="o2-app-meta">
          <span className="o2-counter">
            {String(index + 1).padStart(2, "0")}
            <span className="o2-counter-of">/{String(featuredApps.length).padStart(2, "0")}</span>
          </span>
          <span>{app.category}</span>
        </div>
        <h3 id={`o2-app-${index}`} className="display o2-app-name">
          {app.name}
        </h3>
        <p className="o2-app-desc">{app.description}</p>
        <span className={`o2-status ${live ? "o2-status-live" : ""}`}>
          <span className="o2-status-dot" aria-hidden="true" />
          {app.status}
        </span>
      </div>
    </section>
  );
}

/* ---------- The stage: hero + work, with the 3D phones pinned behind ---------- */

export function OrbitStage() {
  const reduced = useReducedMotion() ?? false;
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const mode = !webgl || failed ? "off" : ready ? "on" : "loading";
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  // Scroll -> stage progress (0 hero, 1 intro, 2..4 apps) + backdrop colour.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let tops: number[] = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const s = -stage.getBoundingClientRect().top;
      let t = 0;
      const last = tops.length - 1;
      if (last > 0) {
        if (s >= tops[last]) t = last;
        else if (s > tops[0]) {
          let k = 0;
          while (k < last - 1 && s >= tops[k + 1]) k++;
          t = k + (s - tops[k]) / Math.max(1, tops[k + 1] - tops[k]);
        }
      }
      orbitStore.setProgress(t);
      const color = backdrop(t);
      stage.style.backgroundColor = color;
      if (bgRef.current) bgRef.current.style.backgroundColor = color;
    };
    const measure = () => {
      const base = stage.getBoundingClientRect().top;
      tops = Array.from(stage.querySelectorAll<HTMLElement>("[data-orbit-panel]")).map(
        (p) => p.getBoundingClientRect().top - base,
      );
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Pointer parallax, desktop mice/trackpads only.
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      orbitStore.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const headlineLines = siteConfig.hero.headline.split("\n");
  const workLines = siteConfig.work.heading.split("\n");

  return (
    <div ref={stageRef} className="o2-stage" data-3d={mode} id="top">
      <div className="o2-sticky" aria-hidden="true">
        <div ref={bgRef} className="o2-bg" />
        {webgl && !failed && <OrbitScene reduced={reduced} onReady={onReady} onError={onError} />}
      </div>

      <div className="o2-content">
        {/* Hero */}
        <section data-orbit-panel className="o2-panel o2-hero">
          <OrbitNav />
          <div className="o2-hero-body">
            <div className="o2-hero-copy">
              <p className="label o2-eyebrow o2-rise">{siteConfig.hero.eyebrow}</p>
              <h1 className="display o2-h1 o2-rise" style={{ animationDelay: "80ms" }}>
                {headlineLines.map((line, i) => (
                  <Fragment key={i}>
                    {line}
                    <br />
                  </Fragment>
                ))}
                <RollingWord words={siteConfig.hero.rollingWords} />
              </h1>
            </div>

            <div className="o2-hero-art" aria-hidden="true">
              <div className="o2-hero-still">
                {featuredApps.map((app, i) => (
                  <StillPhone key={app.name} app={app} className={`o2-still-${i}`} eager />
                ))}
              </div>
            </div>

            <div className="o2-hero-foot o2-rise" style={{ animationDelay: "160ms" }}>
              <p className="o2-sub">{siteConfig.hero.subheadline}</p>
              <div className="o2-ctas">
                <a href={siteConfig.hero.cta.href} className="o2-btn o2-btn-dark">
                  {siteConfig.hero.cta.text}
                  <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
                </a>
                <a href={siteConfig.hero.secondaryCta.href} className="o2-btn o2-btn-line">
                  {siteConfig.hero.secondaryCta.text}
                  <ArrowDown size={16} strokeWidth={3} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Work intro: the phones fan out beside it */}
        <section id="work" data-orbit-panel className="o2-panel o2-intro" aria-labelledby="o2-work-h">
          <div className="o2-intro-copy">
            <h2 id="o2-work-h" className="display o2-h2">
              {workLines.map((line, i) => (
                <span key={i} className={i === workLines.length - 1 ? "block o2-blue" : "block"}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="o2-intro-text">{siteConfig.work.intro}</p>
            <ul className="o2-intro-list">
              {featuredApps.map((app) => (
                <li key={app.name}>
                  <span className="display">{app.name}</span>
                  <span className={app.status === "Live" ? "o2-blue" : ""}>{app.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {featuredApps.map((app, i) => (
          <AppPanel key={app.name} app={app} index={i} />
        ))}
      </div>
    </div>
  );
}
