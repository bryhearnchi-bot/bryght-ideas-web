"use client";

import { Fragment, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Ship } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import { SignalBackdrop } from "./signal-backdrop";
import { SignalNav, VersionSwitcher } from "./signal-nav";
import { setSignal, signalStore } from "./signal-store";
import "./signal.css";

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
      <span className="sg-cursor" aria-hidden="true" />
    </span>
  );
}

function Hero({ reduced }: { reduced: boolean }) {
  const lines = siteConfig.hero.headline.split("\n");
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <section
      id="top"
      data-morph="0"
      className="relative flex flex-col justify-end px-5 pt-24 pb-16 md:px-10 md:pb-20"
      style={{ minHeight: "100svh" }}
    >
      {/* Phones: a scrim so the copy stays crisp over the field. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#0a0d14] via-[rgba(10,13,20,0.78)] to-transparent md:hidden"
      />
      <div className="relative mx-auto w-full max-w-[1440px]">
        <motion.p {...rise(0.1)} className="label m-0 mb-6 text-[#9aa6ba]">
          {siteConfig.hero.eyebrow}
        </motion.p>

        <h1
          className="sg-display m-0 max-w-[11ch] text-[#eef3fb]"
          style={{ fontSize: "clamp(58px, 9.5vw, 150px)" }}
        >
          {lines.map((line, idx) => (
            <Fragment key={line}>
              <motion.span {...rise(0.18 + idx * 0.08)} className="block">
                {line}
              </motion.span>
            </Fragment>
          ))}
          <motion.span {...rise(0.34)} className="block text-blue-block">
            <RollingWord reduced={reduced} />
          </motion.span>
        </h1>

        <motion.div
          {...rise(0.5)}
          className="mt-10 grid gap-8 md:mt-12 md:grid-cols-[minmax(0,560px)_auto] md:items-end md:justify-between"
        >
          <p className="m-0 max-w-[560px] text-[17px] leading-[1.55] text-[#b9c3d4] md:text-[19px]">
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
        </motion.div>
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
        className="sg-display m-0 mt-4 text-[#eef3fb]"
        style={{ fontSize: compact ? "clamp(44px, 12vw, 64px)" : "clamp(52px, 8vw, 128px)" }}
      >
        {s.title}
      </h3>
      <p className="m-0 mt-5 max-w-[440px] text-[17px] leading-[1.55] text-[#b9c3d4] md:text-[19px]">
        {s.description}
      </p>
    </>
  );
}

function Services({ reduced, active }: { reduced: boolean; active: number }) {
  const services = siteConfig.services;
  const heading = siteConfig.servicesSection.heading;

  return (
    <section id="services" aria-labelledby="sg-services-h" className="relative">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 pt-24 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end md:px-10 md:pt-40">
        <h2
          id="sg-services-h"
          className="sg-display m-0 text-[#eef3fb]"
          style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
        >
          {heading}
        </h2>
        <p className="m-0 text-[17px] leading-[1.55] text-[#9aa6ba] md:text-[19px]">
          {siteConfig.servicesSection.intro}
        </p>
      </div>

      {reduced ? (
        // Reduced motion: no pinning, one panel per service.
        <div className="mx-auto flex max-w-[1440px] flex-col px-5 md:px-10">
          {services.map((s, i) => (
            <div
              key={s.title}
              data-morph={i + 1}
              className="flex min-h-[80svh] items-end pb-16 md:items-center md:pb-0"
            >
              <div className="sg-glass-sm w-full max-w-[560px] rounded-[24px] p-6 md:p-0">
                <ServiceCopy index={i} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative" style={{ height: `${services.length * 100}svh` }}>
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

          <div className="sticky top-0 flex h-svh items-end px-5 pb-20 md:items-center md:px-10 md:pb-0">
            <div className="mx-auto w-full max-w-[1440px]">
              <div
                aria-hidden="true"
                className="sg-glass-sm w-full max-w-[600px] rounded-[24px] p-6 md:p-0"
              >
                <div className="mb-8 grid grid-cols-4 gap-2 md:mb-12">
                  {services.map((s, i) => (
                    <div key={s.title} className="flex flex-col gap-2">
                      <div className="sg-rail-tick" data-on={i <= active ? "true" : "false"}>
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
                <div className="relative min-h-[230px] md:min-h-[300px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <ServiceCopy index={active} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- work */

type AppEntry = (typeof siteConfig.apps)[number];

function screenshotOf(app: AppEntry): string | undefined {
  return "screenshot" in app ? app.screenshot : undefined;
}

const featuredApps = siteConfig.apps.filter((a) => a.name !== "More Coming");

function AppCard({ app }: { app: AppEntry }) {
  const shot = screenshotOf(app);
  const live = app.status === "Live";
  return (
    <article className="sg-glass flex w-[78vw] max-w-[360px] shrink-0 snap-center flex-col rounded-[28px] p-5 sm:w-[340px] md:p-6 lg:w-auto lg:max-w-none">
      <div className="mx-auto w-[64%] max-w-[230px]">
        <div className="sg-device">
          {shot ? (
            <div className="sg-device-screen">
              <Image
                src={shot}
                alt={`${app.name} app screenshot`}
                fill
                sizes="(max-width: 1024px) 50vw, 230px"
                className="object-cover object-top"
              />
            </div>
          ) : (
            <div className="sg-device-empty">
              <Ship size={44} strokeWidth={1.4} className="text-blue-block" aria-hidden="true" />
              <span className="text-[13px] font-medium text-[#9aa6ba]">{app.status}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-7 flex items-center justify-between gap-3">
        <h3 className="sg-display m-0 text-[30px] text-[#eef3fb] md:text-[34px]">{app.name}</h3>
        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${
            live
              ? "bg-[rgba(30,144,240,0.14)] text-blue-block"
              : "bg-[rgba(255,210,63,0.1)] text-yellow"
          }`}
        >
          {live ? <span className="sg-live-dot" aria-hidden="true" /> : null}
          {app.status}
        </span>
      </div>
      <p className="m-0 mt-1 text-[13px] font-medium text-[#6f7b90]">{app.category}</p>
      <p className="m-0 mt-4 text-[15px] leading-[1.55] text-[#b9c3d4]">{app.description}</p>
    </article>
  );
}

function Work() {
  const lines = siteConfig.work.heading.split("\n");
  return (
    <section
      id="work"
      data-morph="4"
      data-dim="0.3"
      aria-labelledby="sg-work-h"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-end">
          <h2
            id="sg-work-h"
            className="sg-display m-0 text-[#eef3fb]"
            style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
          >
            {lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="m-0 text-[17px] leading-[1.55] text-[#9aa6ba] md:text-[19px]">
            {siteConfig.work.intro}
          </p>
        </div>
      </div>

      <div className="sg-scroll-row mx-auto mt-12 flex max-w-[1440px] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mt-16 md:px-10 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
        {featuredApps.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- approach */

function Approach() {
  return (
    <section
      id="approach"
      data-morph="4"
      aria-labelledby="sg-approach-h"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <h2
          id="sg-approach-h"
          className="sg-display m-0 text-[#eef3fb]"
          style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
        >
          {siteConfig.approachSection.heading}
        </h2>
        <ul className="m-0 mt-12 grid max-w-[760px] list-none gap-3 p-0 sm:grid-cols-2 md:mt-16">
          {siteConfig.approach.map((item) => (
            <li key={item.title} className="sg-glass rounded-[22px] p-6 md:p-7">
              <span
                aria-hidden="true"
                className="mb-6 block h-3 w-3 rounded-full border-2 border-blue-block"
              />
              <h3 className="sg-display m-0 text-[26px] leading-[1] text-[#eef3fb] md:text-[28px]">
                {item.title}
              </h3>
              <p className="m-0 mt-3 text-[15px] leading-[1.55] text-[#b9c3d4]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ founder */

function Founder() {
  const f = siteConfig.founder;
  return (
    <section
      id="founder"
      data-morph="5"
      data-dim="0.45"
      aria-labelledby="sg-founder-h"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[28px] ring-1 ring-[rgba(238,243,251,0.12)]">
          <Image
            src="/bryan-hearn.jpg"
            alt={`${f.name}, ${f.title} of ${siteConfig.name}`}
            fill
            sizes="(max-width: 1024px) 90vw, 440px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[rgba(5,7,12,0.85)] to-transparent p-5 pt-16">
            <span className="sg-display text-[24px] text-[#eef3fb]">{f.name}</span>
            <span className="text-[13px] font-medium text-[#b9c3d4]">{f.location}</span>
          </div>
        </div>

        <div className="sg-glass rounded-[28px] p-6 md:p-10">
          <p className="label m-0 text-blue-block">{f.title}</p>
          <h2
            id="sg-founder-h"
            className="sg-display m-0 mt-4 text-[#eef3fb]"
            style={{ fontSize: "clamp(44px, 5.5vw, 84px)" }}
          >
            {f.heading}
          </h2>
          <p className="m-0 mt-6 max-w-[62ch] text-[17px] leading-[1.6] text-[#c9d2e0] md:text-[18px]">
            {f.bio}
          </p>
          <p className="m-0 mt-4 max-w-[62ch] text-[17px] leading-[1.6] text-[#c9d2e0] md:text-[18px]">
            {f.bio2}
          </p>
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
      data-morph="5"
      aria-labelledby="sg-contact-h"
      className="relative flex flex-col justify-center py-24 md:py-40"
      style={{ minHeight: "100svh" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <h2
          id="sg-contact-h"
          className="sg-display m-0 text-[#eef3fb]"
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
          className="sg-display sg-underline mt-10 inline-block pb-2 break-all text-[#eef3fb]"
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

export function SignalPage() {
  const reduced = useReducedMotion() ?? false;
  const mobile = useMedia("(max-width: 767px)");
  const finePointer = useMedia("(hover: hover) and (pointer: fine)");
  const { active, scrolled } = useScrollSignal(reduced);
  usePointerSignal(finePointer && !reduced);

  return (
    <div className="sg-root">
      <SignalBackdrop reduced={reduced} mobile={mobile} />
      <div className="sg-vignette" aria-hidden="true" />
      <SignalNav scrolled={scrolled} />
      <main className="sg-content">
        <Hero reduced={reduced} />
        <Services reduced={reduced} active={active} />
        <Work />
        <Approach />
        <Founder />
        <Contact />
      </main>
      <div className="sg-content">
        <Footer />
      </div>
      <VersionSwitcher current="/v3" />
    </div>
  );
}
