"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { PHONE_COUNT, STAGE, showcase } from "./showcase-store";
import { pokeSignal } from "./signal-store";

/* ------------------------------------------------------------- data */

type AppEntry = (typeof siteConfig.apps)[number];

export const featuredApps = siteConfig.apps.filter((a) => a.name !== "More Coming");

function screenshotOf(app: AppEntry): string | undefined {
  return "screenshot" in app ? app.screenshot : undefined;
}

const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The intro copy holds until the fan starts swinging into the carousel. */
const INTRO_END = 1.6;
/** The panel switches halfway through the ring's turn to the next app. */
const SWITCH = 0.875;
/** Stacked layout: gap between the stage top and the intro card while it leads in. */
const LEAD_GAP = 24;

type Phase = "intro" | "apps";

function appAt(t: number) {
  return Math.min(PHONE_COUNT - 1, Math.max(0, Math.floor(t - STAGE.APP0 + (1 - SWITCH))));
}

/** Span of t during which app k's panel is showing (for its rail fill). */
function appSpan(k: number): [number, number] {
  const start = k === 0 ? INTRO_END : STAGE.APP0 + k - (1 - SWITCH);
  const end = k === PHONE_COUNT - 1 ? STAGE.EXIT : STAGE.APP0 + k + SWITCH;
  return [start, end];
}

/** Reduced motion: no scrubbing, the stage snaps to the nearest beat. */
function snapStage(raw: number) {
  if (raw < 1.5) return STAGE.FAN;
  if (raw >= 4.6) return STAGE.EXIT;
  return Math.min(STAGE.APP2, Math.max(STAGE.APP0, Math.round(raw)));
}

/* ------------------------------------------------------------ scroll */

/**
 * Pinned-section scroll → showcase.t / presence. Runs on a passive,
 * rAF-throttled listener; continuous values go straight to the shared store
 * and to CSS variables on the stage. React state changes only when the
 * phase or the front app changes.
 */
function useShowcaseScroll(
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
  reduced: boolean,
) {
  const [view, setView] = useState<{ phase: Phase; app: number }>({ phase: "intro", app: 0 });

  useEffect(() => {
    let raf = 0;
    let lastKey = "";

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const stageH = stage.offsetHeight || vh;
      const span = Math.max(1, r.height - stageH);
      const raw = clamp01(-r.top / span) * STAGE.EXIT;
      const t = reduced ? snapStage(raw) : raw;

      // 0 beyond 1.5 viewports away, 1 from half a viewport away onwards.
      const away = Math.max(0, (r.top - vh) / vh, -r.bottom / vh);
      const presence = clamp01((1.5 - away) / 1.0);

      const changed = t !== showcase.t || presence !== showcase.presence;
      showcase.t = t;
      showcase.presence = presence;
      if (changed && reduced) pokeSignal();

      for (let k = 0; k < PHONE_COUNT; k++) {
        const [a, b] = appSpan(k);
        stage.style.setProperty(`--so-f${k}`, (reduced ? (t >= a ? 1 : 0) : clamp01((t - a) / (b - a))).toFixed(4));
      }

      const phase: Phase = t < INTRO_END ? "intro" : "apps";
      const app = appAt(t);
      const key = `${phase}:${app}`;
      if (key !== lastKey) {
        lastKey = key;
        setView({ phase, app });
      }
    };

    /*
     * Stacked layout: the stage pins early by --so-lead px (a negative top
     * margin, see the CSS), so the intro card rides in right behind Services
     * and parks at the bottom of the screen while the particles are still
     * forming the outlines, instead of arriving after them. Only the copy
     * lives in the stage (the 3D is in the fixed canvas), and t is measured
     * from the section, so nothing else moves. Layout-only: measured on
     * resize, never per scroll frame, so the card cannot lag the scroll.
     */
    const measureLead = () => {
      const stage = stageRef.current;
      const intro = stage?.querySelector<HTMLElement>(".so-intro");
      const copy = intro?.offsetParent as HTMLElement | null | undefined;
      if (!stage || !intro || !copy) return;
      const vh = window.innerHeight || 1;
      // Card top within the stage (offsetTop ignores transforms).
      const cardTop = copy.offsetTop + intro.offsetTop;
      const lead = Math.round(Math.min(vh * 0.6, Math.max(0, cardTop - LEAD_GAP)));
      stage.style.setProperty("--so-lead", String(lead));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measureLead();
      schedule();
    };

    measureLead();
    update();
    const intro = stageRef.current?.querySelector(".so-intro");
    const ro = typeof ResizeObserver !== "undefined" && intro ? new ResizeObserver(measureLead) : null;
    if (ro && intro) ro.observe(intro);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      showcase.presence = 0;
    };
  }, [sectionRef, stageRef, reduced]);

  return view;
}

/* ------------------------------------------------------------ pieces */

function StatusPill({ status }: { status: string }) {
  const live = status === "Live";
  return (
    <span className="so-pill" data-live={live ? "true" : "false"}>
      {live ? <span className="so-live-dot" aria-hidden="true" /> : null}
      {status}
    </span>
  );
}

function Heading({ id }: { id?: string }) {
  const lines = siteConfig.work.heading.split("\n");
  return (
    <h2 id={id} className="so-display so-work-h m-0 text-[#eef3fb]">
      {lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </h2>
  );
}

function Intro({ on }: { on: boolean }) {
  return (
    <div className="so-intro" data-on={on ? "true" : "false"}>
      <p className="label m-0 mb-4 flex items-center gap-3 text-blue-block md:mb-6">
        <span className="so-eyebrow-line" aria-hidden="true" />
        {siteConfig.nav.links.find((l) => l.href === "#work")?.label}
      </p>
      <Heading id="so-work-h" />
      <p className="so-intro-copy m-0 mt-4 max-w-[400px] text-[15px] leading-[1.5] text-[#9aa6ba] md:mt-7 md:text-[18px]">
        {siteConfig.work.intro}
      </p>
      <ol className="so-index m-0 mt-5 list-none p-0 md:mt-10">
        {featuredApps.map((app, i) => (
          <li key={app.name} className="so-index-row">
            <span className="so-index-num">{pad(i + 1)}</span>
            <span className="so-index-name">{app.name}</span>
            <span
              className="so-index-status"
              data-live={app.status === "Live" ? "true" : "false"}
            >
              {app.status}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AppPanel({ app, index, state }: { app: AppEntry; index: number; state: "before" | "active" | "after" }) {
  return (
    <article className="so-panel" data-state={state} aria-label={app.name}>
      <p className="so-panel-meta label m-0">
        <span className="text-blue-block">
          {pad(index + 1)} / {pad(featuredApps.length)}
        </span>
        <span className="so-meta-rule" aria-hidden="true" />
        <span className="text-[#9aa6ba]">{app.category}</span>
      </p>
      <h3 className="so-display so-panel-name m-0 text-[#eef3fb]">
        <span className="so-mask">
          <span>{app.name}</span>
        </span>
      </h3>
      <p className="so-panel-copy m-0 text-[#b9c3d4]">{app.description}</p>
      <div className="so-panel-pill">
        <StatusPill status={app.status} />
      </div>
    </article>
  );
}

function ProgressRail({ app, on }: { app: number; on: boolean }) {
  return (
    <div className="so-rail" data-on={on ? "true" : "false"} aria-hidden="true">
      {featuredApps.map((a, i) => (
        <div key={a.name} className="so-rail-seg" data-current={i === app ? "true" : "false"}>
          <span className="so-rail-num">
            {pad(i + 1)}
            <span className="so-rail-name">{a.name}</span>
          </span>
          <span className="so-rail-track">
            <span style={{ "--so-fill": `var(--so-f${i}, 0)` } as CSSProperties} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- showcase */

/**
 * The Work section as a pinned showcase. The 3D (phones and their particle
 * outlines) lives in the page's single fixed canvas; this section only owns
 * the scroll timeline and the copy laid over it.
 */
export function Showcase({ reduced, webgl }: { reduced: boolean; webgl: boolean | null }) {
  if (webgl === false) return <StaticWork />;
  return <PinnedShowcase reduced={reduced} />;
}

function PinnedShowcase({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { phase, app } = useShowcaseScroll(sectionRef, stageRef, reduced);
  const inApps = phase === "apps";

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="so-work-h"
      className="so-show relative"
    >
      {/*
        Morph anchors: the field is fully on the phone trio (5) from the
        moment the stage pins until it lets go. The run-in before the pin
        is where the ring (4) flies into the outlines.
      */}
      <div data-morph="5" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-svh" />
      <div data-morph="5" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-svh" />

      <div
        ref={stageRef}
        className="so-stage sticky top-0 h-svh overflow-hidden"
        data-phase={phase}
      >
        <div className="relative mx-auto h-full max-w-[1440px] px-4 md:px-10">
          <div className="so-copy">
            <div className="so-stack">
              <Intro on={!inApps} />
              <div className="so-apps" data-on={inApps ? "true" : "false"}>
                <ProgressRail app={app} on={inApps} />
                <div className="so-stack">
                  {featuredApps.map((a, i) => (
                    <AppPanel
                      key={a.name}
                      app={a}
                      index={i}
                      state={!inApps ? "after" : i < app ? "before" : i === app ? "active" : "after"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- no-WebGL fallback */

function StaticWork() {
  return (
    <section id="work" data-morph="5" aria-labelledby="so-work-h" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end">
          <Heading id="so-work-h" />
          <p className="m-0 text-[17px] leading-[1.55] text-[#9aa6ba] md:text-[19px]">
            {siteConfig.work.intro}
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {featuredApps.map((app, i) => {
            const shot = screenshotOf(app);
            return (
              <article key={app.name} className="so-glass flex flex-col rounded-[28px] p-5 md:p-6">
                <div className="mx-auto w-[60%] max-w-[220px]">
                  <div className={shot ? "so-device" : "so-device so-device-blueprint"}>
                    {shot ? (
                      <div className="so-device-screen">
                        <Image
                          src={shot}
                          alt={`${app.name} app screenshot`}
                          fill
                          sizes="(max-width: 768px) 60vw, 220px"
                          className="object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="so-device-empty">
                        <span className="so-display text-[22px] text-[#8cc4ff]">{app.name}</span>
                        <span className="label text-[11px] text-yellow">{app.status}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="label m-0 mt-7 text-blue-block">
                  {pad(i + 1)} / {pad(featuredApps.length)} · <span className="text-[#9aa6ba]">{app.category}</span>
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="so-display m-0 text-[30px] text-[#eef3fb] md:text-[34px]">{app.name}</h3>
                  <StatusPill status={app.status} />
                </div>
                <p className="m-0 mt-4 text-[15px] leading-[1.55] text-[#b9c3d4]">{app.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
