"use client";

import { useEffect, useRef } from "react";
import { YEARS, YEARS_CAPTION } from "./copy";

/**
 * "20+ years": the figure counts up once, the first time it scrolls into
 * view. The server HTML (and reduced motion) shows the final number; the
 * count only resets to zero if the figure is still below the fold when the
 * page hydrates, so nobody ever sees it jump backwards.
 */
export function Years({ reduced }: { reduced: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const num = numRef.current;
    if (!box || !num || reduced) return;
    if (box.getBoundingClientRect().top < window.innerHeight) return;
    num.textContent = "0";
    box.dataset.count = "waiting";
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        box.dataset.count = "running";
        const t0 = performance.now();
        const dur = 1500;
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / dur);
          // Ease out expo: quick start, long soft landing on the number.
          const k = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          num.textContent = String(Math.round(k * YEARS));
          if (t < 1) raf = requestAnimationFrame(tick);
          else box.dataset.count = "done";
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      num.textContent = String(YEARS);
    };
  }, [reduced]);

  return (
    // A visual restatement of the bio's first line: hidden from screen
    // readers, which already get it from the paragraph above.
    <div ref={boxRef} className="so-fd-years" data-count="done" aria-hidden="true">
      <p className="m-0 flex items-start">
        <span className="so-display so-fd-years-num">
          <span ref={numRef}>{YEARS}</span>
          <span className="so-fd-years-plus">+</span>
        </span>
      </p>
      <p className="so-fd-years-cap m-0">{YEARS_CAPTION}</p>
    </div>
  );
}
