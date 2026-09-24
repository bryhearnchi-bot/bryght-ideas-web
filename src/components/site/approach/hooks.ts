"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/**
 * true / false once the observer has reported, null before that (SSR and the
 * first client render), so nothing is hidden until we know it is off screen.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "0px", once = false }: { rootMargin?: string; once?: boolean } = {},
) {
  const [inView, setInView] = useState<boolean | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (once && entry.isIntersecting) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

/** false while the tab is hidden. */
export function usePageVisible() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener("visibilitychange", cb);
      return () => document.removeEventListener("visibilitychange", cb);
    },
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

/**
 * A looping clock in ms (0..duration) that only ticks while `running`.
 * It pauses in place and resumes from where it stopped. `speed` scales time
 * (the hero moment plays faster) without a jump.
 */
export function useLoopClock(duration: number, running: boolean, speed = 1, step = 40) {
  const [t, setT] = useState(0);
  const acc = useRef(0);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      acc.current = (acc.current + (now - last) * speedRef.current) % duration;
      last = now;
      setT(acc.current);
    }, step);
    return () => window.clearInterval(id);
  }, [running, duration, step]);

  return t;
}
