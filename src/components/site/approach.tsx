"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { emitRipple } from "./fx-store";
import type { SectionProps } from "./section-props";
import { useInView, usePageVisible } from "./approach/hooks";
import type { DemoProps } from "./approach/types";
import { CodeDemo } from "./approach/code-demo";
import { StackDemo } from "./approach/stack-demo";
import { LinkDemo } from "./approach/link-demo";
import { BuildDemo } from "./approach/build-demo";
import "./approach.css";

/*
 * How we work — a bento of four live cards. Each principle gets a small,
 * looping micro-demo on top of its title and copy.
 *
 * Fine pointer: cursor spotlight + border glow, a gentle 3D tilt toward the
 * pointer, and hovering plays the demo's hero moment. Touch: the card nearest
 * the middle of the screen is "active" and plays its hero moment instead.
 * Both nudge the particle wave behind the page through emitRipple().
 */

const DEMOS: ComponentType<DemoProps>[] = [CodeDemo, StackDemo, LinkDemo, BuildDemo];
const MAX_TILT = 5;

const pad = (n: number) => String(n).padStart(2, "0");

function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

type Item = (typeof siteConfig.approach)[number];

function Card({
  item,
  index,
  total,
  reduced,
  finePointer,
  active,
  pageVisible,
}: {
  item: Item;
  index: number;
  total: number;
  reduced: boolean;
  finePointer: boolean;
  active: boolean;
  pageVisible: boolean;
}) {
  const cellRef = useRef<HTMLLIElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cellRef, { rootMargin: "80px 0px" });
  const seen = useInView(cellRef, { once: true, rootMargin: "0px 0px -8% 0px" });
  const [hover, setHover] = useState(false);
  const raf = useRef(0);
  const rect = useRef<DOMRect | null>(null);
  const Demo = DEMOS[index];

  const hoverable = finePointer;
  const lit = hoverable ? hover : active;
  const hero = lit && !reduced;
  const play = inView === true && pageVisible;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const setVars = (x: number, y: number, tilt: boolean) => {
    const el = cardRef.current;
    const r = rect.current;
    if (!el || !r) return;
    const px = (x - r.left) / r.width;
    const py = (y - r.top) / r.height;
    el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    if (tilt) {
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
    }
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (!hoverable || e.pointerType !== "mouse") return;
    const el = cardRef.current;
    if (!el) return;
    rect.current = el.getBoundingClientRect();
    setVars(e.clientX, e.clientY, false);
    setHover(true);
    const c = centerOf(el);
    emitRipple(c.x, c.y, 0.6);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!hoverable || e.pointerType !== "mouse" || !rect.current) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setVars(clientX, clientY, !reduced));
  };

  const onPointerLeave = () => {
    if (!hoverable) return;
    cancelAnimationFrame(raf.current);
    const el = cardRef.current;
    el?.style.setProperty("--rx", "0deg");
    el?.style.setProperty("--ry", "0deg");
    rect.current = null;
    setHover(false);
  };

  const onClick = (e: React.MouseEvent) => {
    // Keyboard "clicks" have no pointer position; nothing to ripple from.
    if (e.detail === 0) return;
    emitRipple(e.clientX, e.clientY, 1);
  };

  return (
    <li
      ref={cellRef}
      className="so-ap-cell"
      data-seen={seen === false && !reduced ? "false" : undefined}
      style={{ "--k": index } as CSSProperties}
    >
      <div
        ref={cardRef}
        className="so-ap-card"
        data-lit={lit ? "true" : undefined}
        data-hover={hover ? "true" : undefined}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <div className="so-ap-stage" aria-hidden="true">
          <Demo play={play} hero={hero} hover={hero && hover} reduced={reduced} />
        </div>
        <div className="so-ap-body">
          <p className="so-ap-meta" aria-hidden="true">
            <span className="so-ap-idx">{pad(index + 1)}</span>
            <span className="so-ap-meta-rule" />
            <span>{pad(total)}</span>
          </p>
          <h3 className="so-display so-ap-title">{item.title}</h3>
          <p className="so-ap-desc">{item.description}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * Touch screens: the card nearest the middle of the viewport is active. It
 * plays its hero moment and sends one ripple through the wave when it takes
 * over.
 */
function useActiveCard(
  listRef: React.RefObject<HTMLUListElement | null>,
  enabled: boolean,
  reduced: boolean,
) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list || typeof IntersectionObserver === "undefined") return;
    const cells = Array.from(list.children) as HTMLElement[];
    const hits = new Set<number>();
    let current = -1;

    const pick = () => {
      let best = -1;
      let bestD = Infinity;
      const mid = window.innerHeight / 2;
      hits.forEach((i) => {
        const d = Math.abs(centerOf(cells[i]).y - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best === current) return;
      current = best;
      setActive(best);
      if (best >= 0 && !reduced) {
        const c = centerOf(cells[best]);
        emitRipple(c.x, c.y, 0.8);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = cells.indexOf(e.target as HTMLElement);
          if (e.isIntersecting) hits.add(i);
          else hits.delete(i);
        }
        pick();
      },
      { rootMargin: "-38% 0px -38% 0px" },
    );
    cells.forEach((c) => io.observe(c));
    return () => {
      io.disconnect();
      setActive(-1);
    };
  }, [listRef, enabled, reduced]);

  return enabled ? active : -1;
}

export function Approach({ reduced, finePointer }: SectionProps) {
  const items = siteConfig.approach;
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const headIn = useInView(headRef, { once: true, rootMargin: "0px 0px -12% 0px" });
  const pageVisible = usePageVisible();
  const active = useActiveCard(listRef, !finePointer, reduced);

  return (
    <section
      id="approach"
      data-morph="6"
      data-dim="0.4"
      aria-labelledby="so-approach-h"
      className="so-ap relative py-24 md:py-40"
      data-reduced={reduced ? "true" : undefined}
    >
      {/*
        Early wave anchor: the field starts rolling into the wave as soon as
        the showcase lets go, instead of leaving a dark gap after the phones.
      */}
      <div
        data-morph="6"
        data-dim="0.4"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[50svh]"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div
          ref={headRef}
          className="so-ap-head"
          data-in={headIn === false && !reduced ? "false" : undefined}
        >
          <p className="label so-ap-eyebrow m-0" aria-hidden="true">
            <span className="so-ap-eyebrow-line" />
            {siteConfig.nav.links.find((l) => l.href === "#approach")?.label ?? "Approach"}
            <span className="so-ap-eyebrow-count">
              01 — {pad(items.length)}
            </span>
          </p>
          <h2 id="so-approach-h" className="so-display so-ap-h m-0">
            <span className="so-ap-mask">
              <span>{siteConfig.approachSection.heading}</span>
            </span>
          </h2>
        </div>
        <ul ref={listRef} className="so-ap-grid">
          {items.map((item, i) => (
            <Card
              key={item.title}
              item={item}
              index={i}
              total={items.length}
              reduced={reduced}
              finePointer={finePointer}
              active={active === i}
              pageVisible={pageVisible}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
