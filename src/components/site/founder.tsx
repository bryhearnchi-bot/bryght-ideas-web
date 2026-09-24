"use client";

import { Fragment, useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import type { SectionProps } from "./section-props";
import { founder as founderStore } from "./founder/founder-store";
import { PHOTO, PHOTO_OBJECT_POSITION } from "./founder/photo";
import { splitBio } from "./founder/copy";
import { Journey } from "./founder/journey";
import { Years } from "./founder/years";
import "./founder.css";

function useStacked() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 1023px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 1023px)").matches,
    () => false,
  );
}

/**
 * Morph anchors around the card, placed by where the card's centre sits in
 * the viewport (f = fraction of the viewport height from the top): an anchor
 * at `50% + (0.5 - f) * 100svh` of the card box is centred on screen exactly
 * when the card's centre is at f. The field blends through the middle of
 * each gap (see useScrollSignal), so the halftone forms between f ~1.05 and
 * ~0.67 and holds while the card is on screen.
 */
type MorphAnchor = { f: number; morph: number; dim: number };
const ANCHORS_WIDE: MorphAnchor[] = [
  { f: 1.25, morph: 6, dim: 0.4 },
  { f: 0.6, morph: 7, dim: 1 },
  { f: 0.25, morph: 7, dim: 1 },
  // Contact is a long way below: hand the particles back while the card is
  // still half on screen, so the photo visibly breaks up into the wave.
  { f: -0.25, morph: 6, dim: 0.8 },
];
// Stacked: the text runs on under the card, so the wave comes back once the
// card has gone off the top.
const ANCHORS_STACKED: MorphAnchor[] = [
  { f: 1.25, morph: 6, dim: 0.4 },
  { f: 0.6, morph: 7, dim: 1 },
  { f: 0.12, morph: 7, dim: 1 },
  { f: -0.6, morph: 6, dim: 0.45 },
];

function Bio({ text, para }: { text: string; para: 0 | 1 }) {
  return (
    <p className="so-fd-bio so-fd-rise m-0" style={{ "--i": 2 + para } as CSSProperties}>
      {splitBio(text, para).map((part, i) =>
        part.stop === undefined ? (
          <span key={i}>{part.text}</span>
        ) : (
          <span key={i} className="so-fd-mark" data-k={part.stop}>
            {part.text}
          </span>
        ),
      )}
    </p>
  );
}

export function Founder({ reduced, webgl }: SectionProps) {
  const f = siteConfig.founder;
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const stacked = useStacked();
  // The halftone portrait needs the particle field and motion.
  const portrait = !reduced && webgl !== false;
  const anchors = stacked ? ANCHORS_STACKED : ANCHORS_WIDE;

  // Hand the card's layout box to the WebGL rig.
  useEffect(() => {
    const el = cardRef.current;
    founderStore.el = el;
    return () => {
      if (founderStore.el === el) founderStore.el = null;
    };
  }, []);

  // Text entrance: only armed if the section is still below the fold, so
  // the copy is never hidden without a reason (or without JS).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    if (root.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    root.dataset.arm = "true";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        root.dataset.inview = "true";
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      delete root.dataset.arm;
      delete root.dataset.inview;
    };
  }, [reduced]);

  const words = f.heading.split(" ");

  return (
    <section
      ref={rootRef}
      id="founder"
      data-morph={portrait ? undefined : "6"}
      data-dim={portrait ? undefined : "0.45"}
      data-step={reduced ? "3" : "0"}
      aria-labelledby="so-founder-h"
      className="so-fd relative py-24 md:py-40"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="so-fd-cardwrap">
          {portrait
            ? anchors.map((a, i) => (
                <div
                  key={`${stacked ? "s" : "w"}${i}`}
                  className="so-fd-anchor"
                  data-morph={a.morph}
                  data-dim={a.dim}
                  aria-hidden="true"
                  style={{ top: `calc(50% + ${((0.5 - a.f) * 100).toFixed(1)}svh)` }}
                />
              ))
            : null}
          <figure ref={cardRef} className="so-fd-card m-0">
            <div className="so-fd-img">
              <Image
                src={PHOTO.src}
                alt={`${f.name}, ${f.title} of ${siteConfig.name}`}
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover"
                style={{ objectPosition: PHOTO_OBJECT_POSITION }}
              />
            </div>
            <div className="so-fd-frame" aria-hidden="true" />
            {/* Follows the WebGL card's pointer tilt (--fd-rx / --fd-ry from the rig). */}
            <div className="so-fd-tilt">
              <figcaption className="so-fd-caption">
                <span className="so-display text-[24px] text-[#eef3fb]">{f.name}</span>
                <span className="so-fd-loc">
                  <span className="so-fd-loc-dot" aria-hidden="true" />
                  {f.location}
                </span>
              </figcaption>
            </div>
          </figure>
        </div>

        <div className="so-glass so-fd-panel rounded-[28px]">
          <p className="label so-fd-rise m-0 text-blue-block" style={{ "--i": 0 } as CSSProperties}>
            {f.title}
          </p>
          <h2
            id="so-founder-h"
            className="so-display so-fd-h m-0 mt-4 text-[#eef3fb]"
            style={{ fontSize: "clamp(44px, 5.5vw, 84px)" }}
          >
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className="so-fd-w">
                  <span style={{ "--i": i } as CSSProperties}>{w}</span>
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h2>
          <div className="mt-6 flex max-w-[62ch] flex-col gap-4">
            <Bio text={f.bio} para={0} />
            <Bio text={f.bio2} para={1} />
          </div>
          <div className="so-fd-foot so-fd-rise" style={{ "--i": 4 } as CSSProperties}>
            <Years reduced={reduced} />
            <Journey reduced={reduced} rootRef={rootRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
