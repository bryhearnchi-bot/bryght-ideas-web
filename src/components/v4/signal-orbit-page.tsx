"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import { OrbitBackdrop, useWebGL } from "./orbit-backdrop";
import { OrbitNav, VersionSwitcher } from "./orbit-nav";
import { Showcase } from "./showcase";
import { Approach } from "./approach";
import { Founder } from "./founder";
import { setSignal, signalStore } from "./signal-store";
import "./signal-orbit.css";

/* ------------------------------------------------------------ helpers */

function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Anchor = { top: number; bottom: number; center: number; morph: number; dim: number };

/**
 * Scroll → particle shape. Every element with data-morph is an anchor; the
 * field holds a shape while its anchor is centred and blends between anchors
 * in the gaps. Reduced motion snaps to the nearest anchor instead.
 */
function useScrollSignal(reduced: boolean) {
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let anchors: Anchor[] = [];
    let raf = 0;

    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-morph]"));
      anchors = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          const top = r.top + window.scrollY;
          return {
            top,
            bottom: top + r.height,
            center: top + r.height / 2,
            morph: Number(el.dataset.morph ?? 0),
            dim: Number(el.dataset.dim ?? 1),
          };
        })
        .sort((a, b) => a.center - b.center);
    };

    const update = () => {
      raf = 0;
      if (!anchors.length) return;
      const focus = window.scrollY + window.innerHeight * 0.5;
      let morph = anchors[0].morph;
      let dim = anchors[0].dim;

      if (reduced) {
        let best = anchors[0];
        let bestD = Infinity;
        for (const a of anchors) {
          const d = focus >= a.top && focus <= a.bottom ? 0 : Math.abs(focus - a.center);
          if (d < bestD) {
            bestD = d;
            best = a;
          }
        }
        morph = best.morph;
        dim = best.dim;
      } else if (focus >= anchors[anchors.length - 1].center) {
        morph = anchors[anchors.length - 1].morph;
        dim = anchors[anchors.length - 1].dim;
      } else if (focus > anchors[0].center) {
        for (let i = 0; i < anchors.length - 1; i++) {
          const a = anchors[i];
          const b = anchors[i + 1];
          if (focus >= a.center && focus <= b.center) {
            const t = (focus - a.center) / Math.max(1, b.center - a.center);
            // Plateau: hold each shape, then blend through the middle.
            let s = Math.min(1, Math.max(0, (t - 0.22) / 0.56));
            s = s * s * (3 - 2 * s);
            morph = a.morph + (b.morph - a.morph) * s;
            dim = a.dim + (b.dim - a.dim) * s;
            break;
          }
        }
      }

      setSignal(morph, dim);
      setActive(Math.min(3, Math.max(0, Math.round(morph) - 1)));
      setScrolled(window.scrollY > 24);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    schedule();
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, [reduced]);

  return { active, scrolled };
}

/** Pointer repulsion input — fine pointers with hover only. */
function usePointerSignal(enabled: boolean) {
  useEffect(() => {
    const p = signalStore.pointer;
    if (!enabled) {
      p.active = false;
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -(e.clientY / window.innerHeight) * 2 + 1;
      p.active = true;
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) p.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      p.active = false;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [enabled]);
}

/* --------------------------------------------------------------- hero */

function RollingWord({ reduced }: { reduced: boolean }) {
  const words = siteConfig.hero.rollingWords;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  const word = reduced ? words[0] : words[i];

  return (
    <span className="relative block overflow-hidden pb-[0.06em]">
      <span className="sr-only">{words.join(" ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          aria-hidden="true"
          className="inline-block"
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-105%" }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
      <span className="so-cursor" aria-hidden="true" />
    </span>
  );
}

function Hero({ reduced }: { reduced: boolean }) {
  const lines = siteConfig.hero.headline.split("\n");
  // Entrance is pure CSS (see .so-rise): the copy is in the server HTML at
  // full strength and never waits on hydration or a JS animation frame.
  const rise = (delay: number) => ({
    className: "so-rise",
    style: { "--so-d": `${delay}s` } as CSSProperties,
  });

  return (
    <section
      id="top"
      data-morph="0"
      className="relative flex flex-col justify-start px-5 pt-[max(52svh,400px)] pb-16 lg:justify-end lg:px-10 lg:pt-24 lg:pb-20"
      style={{ minHeight: "100svh" }}
    >
      {/* Phones: a scrim under the copy so it stays crisp over the field. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#0a0d14] via-[rgba(10,13,20,0.82)] to-transparent lg:hidden"
      />
      <div className="relative mx-auto w-full max-w-[1440px]">
        <p {...rise(0.1)}>
          <span className="label m-0 mb-5 block text-balance text-[#9aa6ba] lg:mb-6">
            {siteConfig.hero.eyebrow}
          </span>
        </p>

        <h1
          className="so-display m-0 max-w-[11ch] text-[#eef3fb]"
          style={{ fontSize: "clamp(52px, 9.5vw, 150px)" }}
        >
          {lines.map((line, idx) => (
            <span key={line} {...rise(0.18 + idx * 0.08)}>
              <span className="block">{line}</span>
            </span>
          ))}
          <span {...rise(0.34)}>
            <span className="block text-blue-block">
              <RollingWord reduced={reduced} />
            </span>
          </span>
        </h1>

        <div
          {...rise(0.5)}
        >
          <div className="mt-8 grid gap-7 lg:mt-12 lg:grid-cols-[minmax(0,560px)_auto] lg:items-end lg:justify-between lg:gap-8">
            <p className="m-0 max-w-[560px] text-[16px] leading-[1.55] text-[#b9c3d4] lg:text-[19px]">
              {siteConfig.hero.subheadline}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.hero.cta.href}
                className="label inline-flex items-center justify-center gap-2 rounded-full bg-blue-block px-7 py-4 text-[#0a0d14] transition-colors duration-200 hover:bg-yellow"
              >
                {siteConfig.hero.cta.text}
                <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden="true" />
              </a>
              <a
                href={siteConfig.hero.secondaryCta.href}
                className="label inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(238,243,251,0.22)] px-7 py-4 text-[#eef3fb] transition-colors duration-200 hover:border-[#eef3fb]"
              >
                {siteConfig.hero.secondaryCta.text}
                <ArrowDown size={16} strokeWidth={2.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- services */

function ServiceCopy({
  index,
  compact = false,
}: {
  index: number;
  compact?: boolean;
}) {
  const s = siteConfig.services[index];
  const total = siteConfig.services.length;
  return (
    <>
      <p className="label m-0 text-blue-block">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <h3
        className="so-display m-0 mt-2 text-[#eef3fb] md:mt-4"
        style={{ fontSize: compact ? "clamp(40px, 7.4vw, 112px)" : "clamp(52px, 8vw, 128px)" }}
      >
        {s.title}
      </h3>
      <p className="m-0 mt-3 max-w-[440px] text-[15px] leading-[1.5] text-[#b9c3d4] md:mt-5 md:text-[19px]">
        {s.description}
      </p>
    </>
  );
}

function Services({ reduced, active }: { reduced: boolean; active: number }) {
  const services = siteConfig.services;
  const heading = siteConfig.servicesSection.heading;

  const header = (
    <div className="max-w-[600px]">
      <h2
        id="so-services-h"
        className="so-display m-0 text-[#eef3fb]"
        style={{ fontSize: "clamp(40px, 5.6vw, 88px)" }}
      >
        {heading}
      </h2>
      <p className="m-0 mt-3 max-w-[420px] text-[15px] leading-[1.5] text-[#9aa6ba] lg:mt-5 lg:text-[18px]">
        {siteConfig.servicesSection.intro}
      </p>
    </div>
  );

  if (reduced) {
    // Reduced motion: no pinning, one panel per service.
    return (
      <section id="services" aria-labelledby="so-services-h" className="relative">
        <div className="mx-auto max-w-[1440px] px-5 pt-28 lg:px-10 lg:pt-40">{header}</div>
        <div className="mx-auto flex max-w-[1440px] flex-col px-5 lg:px-10">
          {services.map((s, i) => (
            <div
              key={s.title}
              data-morph={i + 1}
              className="flex min-h-[80svh] items-end pb-16 lg:items-center lg:pb-0"
            >
              <div className="so-glass-sm w-full max-w-[560px] rounded-[24px] p-6 lg:p-0">
                <ServiceCopy index={i} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="services"
      aria-labelledby="so-services-h"
      className="relative"
      style={{ height: `${services.length * 100}svh` }}
    >
      {services.map((s, i) => (
        <div
          key={s.title}
          data-morph={i + 1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0"
          style={{ top: `${i * 100}svh`, height: "100svh" }}
        />
      ))}

      <ul className="sr-only">
        {services.map((s) => (
          <li key={s.title}>
            {s.title}: {s.description}
          </li>
        ))}
      </ul>

      {/*
        The whole stage pins, heading included, and it starts below the fixed
        nav: nothing in it can slide under the nav while it is pinned.
      */}
      <div className="sticky top-0 flex h-svh flex-col px-5 pt-[84px] pb-20 md:pt-[108px] lg:px-10 lg:pt-[120px] lg:pb-16">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-between lg:justify-start">
          {header}
          <div
            aria-hidden="true"
            className="so-glass-sm w-full max-w-[600px] rounded-[24px] p-5 lg:mt-14 lg:p-0"
          >
            <div className="mb-5 grid grid-cols-4 gap-2 lg:mb-10">
              {services.map((s, i) => (
                <div key={s.title} className="flex flex-col gap-2">
                  <div className="so-rail-tick" data-on={i <= active ? "true" : "false"}>
                    <span />
                  </div>
                  <span
                    className={`hidden text-[12px] font-medium transition-colors duration-300 sm:block ${
                      i === active ? "text-[#eef3fb]" : "text-[#6f7b90]"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative min-h-[150px] lg:min-h-[250px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <ServiceCopy index={active} compact />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ contact */

function Contact() {
  const words = siteConfig.contact.heading.split(" ");
  return (
    <section
      id="contact"
      data-morph="6"
      aria-labelledby="so-contact-h"
      className="relative flex flex-col justify-center py-24 md:py-40"
      style={{ minHeight: "100svh" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <h2
          id="so-contact-h"
          className="so-display m-0 text-[#eef3fb]"
          style={{ fontSize: "clamp(76px, 17vw, 260px)" }}
        >
          {words.map((w) => (
            <span key={w} className="block">
              {w}
            </span>
          ))}
        </h2>
        <p className="m-0 mt-8 max-w-[460px] text-[18px] leading-[1.55] text-[#b9c3d4] md:text-[20px]">
          {siteConfig.contact.note}
        </p>
        <a
          href={`mailto:${siteConfig.email}`}
          className="so-display so-underline mt-10 inline-block pb-2 break-all text-[#eef3fb]"
          style={{ fontSize: "clamp(26px, 4.2vw, 60px)", lineHeight: 1.1 }}
        >
          {siteConfig.email}
        </a>
        <p className="m-0 mt-10 text-[13px] font-medium text-[#6f7b90]">
          {siteConfig.legalName}, {siteConfig.location}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-[rgba(238,243,251,0.08)] bg-[rgba(10,13,20,0.7)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-10 pb-24 md:flex-row md:items-center md:justify-between md:px-10 md:pb-10">
        <div className="flex flex-col gap-3 text-[#eef3fb]">
          <Logo />
          <p className="m-0 text-[14px] text-[#9aa6ba]">{siteConfig.footer.tagline}</p>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-6 p-0">
          {siteConfig.footer.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[14px] font-medium text-[#9aa6ba] transition-colors hover:text-[#eef3fb]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="m-0 text-[13px] text-[#6f7b90]">
          © {year} {siteConfig.legalName}
        </p>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------------- page */

export function SignalOrbitPage() {
  // Through useSyncExternalStore (server value false) so a reduced-motion
  // visitor never hits a hydration mismatch; the page settles right after.
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 767px)");
  const finePointer = useMedia("(hover: hover) and (pointer: fine)");
  const webgl = useWebGL();
  const { active, scrolled } = useScrollSignal(reduced);
  usePointerSignal(finePointer && !reduced);

  return (
    <div className="so-root">
      <OrbitBackdrop reduced={reduced} mobile={mobile} webgl={webgl} />
      <div className="so-vignette" aria-hidden="true" />
      <OrbitNav scrolled={scrolled} />
      <main className="so-content">
        <Hero reduced={reduced} />
        <Services reduced={reduced} active={active} />
        <Showcase reduced={reduced} webgl={webgl} />
        <Approach reduced={reduced} webgl={webgl} finePointer={finePointer} />
        <Founder reduced={reduced} webgl={webgl} finePointer={finePointer} />
        <Contact />
      </main>
      <div className="so-content">
        <Footer />
      </div>
      <VersionSwitcher current="/v4" />
    </div>
  );
}
