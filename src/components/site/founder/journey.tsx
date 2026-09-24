"use client";

import { useEffect, useRef, type RefObject } from "react";
import { PATH_LABEL, STOPS } from "./copy";

/**
 * "The journey": three stops from the bio joined by a signal line that draws
 * itself with scroll (SVG stroke-dashoffset). Each stop lights as the line
 * reaches it, and lights its phrase in the bio above (data-step on the
 * section root); the last one, the studio, gets the yellow spark. Once the
 * whole line is drawn a faint pulse runs along it while it is on screen.
 *
 * Reduced motion: the finished line, no pulse.
 */
export function Journey({
  reduced,
  rootRef,
}: {
  reduced: boolean;
  rootRef: RefObject<HTMLElement | null>;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const svg = svgRef.current;
    if (!list || !svg) return;
    const lines = Array.from(svg.querySelectorAll<SVGLineElement>("line"));
    const fill = svg.querySelector<SVGLineElement>(".so-fd-wire-fill");
    const head = svg.querySelector<SVGGElement>(".so-fd-wire-head");
    const stops = Array.from(list.querySelectorAll<HTMLElement>(".so-fd-stop"));
    const geo = {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      fracs: STOPS.map((_, i) => i / (STOPS.length - 1)),
    };
    let progress = reduced ? 1 : 0;
    let step = -1;

    const measure = () => {
      const box = list.getBoundingClientRect();
      const dots = stops.map((s) => {
        const r = s.querySelector(".so-fd-dot")!.getBoundingClientRect();
        return [
          r.left + r.width / 2 - box.left,
          r.top + r.height / 2 - box.top,
        ] as const;
      });
      const [a, b] = [dots[0], dots[dots.length - 1]];
      geo.x0 = a[0];
      geo.y0 = a[1];
      geo.x1 = b[0];
      geo.y1 = b[1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      geo.fracs = dots.map((d) => Math.hypot(d[0] - a[0], d[1] - a[1]) / len);
      svg.setAttribute(
        "viewBox",
        `0 0 ${Math.max(1, box.width)} ${Math.max(1, box.height)}`,
      );
      for (const l of lines) {
        l.setAttribute("x1", String(a[0]));
        l.setAttribute("y1", String(a[1]));
        l.setAttribute("x2", String(b[0]));
        l.setAttribute("y2", String(b[1]));
      }
      apply(progress, true);
    };

    const apply = (p: number, force = false) => {
      progress = p;
      fill?.style.setProperty("stroke-dashoffset", String(1 - p));
      if (head) {
        const x = geo.x0 + (geo.x1 - geo.x0) * p;
        const y = geo.y0 + (geo.y1 - geo.y0) * p;
        head.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${y.toFixed(1)})`,
        );
        head.style.opacity = p > 0.005 && p < 0.995 ? "1" : "0";
      }
      const n = p <= 0.01 ? 0 : geo.fracs.filter((f) => p >= f - 0.002).length;
      if (n !== step || force) {
        step = n;
        stops.forEach((s, i) => (s.dataset.on = i < n ? "true" : "false"));
        rootRef.current?.setAttribute("data-step", String(n));
        list.dataset.done = n >= stops.length ? "true" : "false";
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(list);
    measure();
    if (reduced) {
      return () => ro.disconnect();
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts as the path enters the lower screen, done by ~40% from the top.
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.48)));
      if (Math.abs(p - progress) > 0.0005) apply(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        list.dataset.inview = e.isIntersecting ? "true" : "false";
        if (e.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else {
          window.removeEventListener("scroll", onScroll);
          // Settle to whichever end it left from.
          apply(e.boundingClientRect.top < 0 ? 1 : 0);
        }
      },
      { rootMargin: "10% 0px 10% 0px" },
    );
    io.observe(list);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, rootRef]);

  return (
    <div className="so-fd-journey">
      <p className="label m-0 text-[#9aa6ba]">{PATH_LABEL}</p>
      <div
        ref={listRef}
        className="so-fd-path"
        data-done={reduced ? "true" : "false"}
      >
        <svg
          ref={svgRef}
          className="so-fd-wire"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="so-fd-wire-g"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="100%"
              y2="100%"
            >
              <stop offset="0" stopColor="#1565D8" />
              <stop offset="1" stopColor="#6DB8FF" />
            </linearGradient>
          </defs>
          <line className="so-fd-wire-track" pathLength={1} />
          <line
            className="so-fd-wire-fill"
            pathLength={1}
            style={{ strokeDashoffset: reduced ? 0 : 1 }}
          />
          <line className="so-fd-wire-pulse" pathLength={1} />
          <g className="so-fd-wire-head" style={{ opacity: 0 }}>
            <circle r="9" className="so-fd-wire-halo" />
            <circle r="3" className="so-fd-wire-core" />
          </g>
        </svg>
        <ol className="so-fd-stops">
          {STOPS.map((s, i) => (
            <li
              key={s.label}
              className="so-fd-stop"
              data-k={i}
              data-now={s.now ? "true" : undefined}
              data-on={reduced ? "true" : "false"}
            >
              <span className="so-fd-dot" aria-hidden="true">
                <span className="so-fd-dot-ring" />
                <span className="so-fd-dot-core" />
                {s.now ? (
                  <svg className="so-fd-glint" viewBox="-12 -12 24 24">
                    <path d="M0 -11 C0.9 -3 3 -0.9 11 0 C3 0.9 0.9 3 0 11 C-0.9 3 -3 0.9 -11 0 C-3 -0.9 -0.9 -3 0 -11 Z" />
                  </svg>
                ) : null}
              </span>
              <span className="so-fd-stop-text">
                <span className="so-fd-stop-label">{s.label}</span>
                {s.now ? <span className="so-fd-now">Now</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
