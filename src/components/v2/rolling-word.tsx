"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

/**
 * The headline's last word, flipping like a departure board.
 *
 * Only the current word is ever rendered inside the mask: each change
 * remounts it and it rises in from below, so no neighbouring word can
 * bleed into the box at any width. The box sizes to the word it holds.
 */
export function RollingWord({
  words,
  interval = 2300,
}: {
  words: readonly string[];
  interval?: number;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const visible = usePageVisible();
  const [index, setIndex] = useState(0);

  // Paused while the tab is hidden so a word never freezes mid-rise.
  useEffect(() => {
    if (reduced || !visible || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), interval);
    return () => window.clearInterval(id);
  }, [reduced, visible, words.length, interval]);

  if (words.length === 0) return null;
  const word = words[reduced ? 0 : index % words.length];

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true" className="o2-roll">
        <span
          key={`${index}-${word}`}
          className="o2-roll-word"
          data-enter={index > 0 ? "true" : undefined}
        >
          {word}
        </span>
      </span>
    </>
  );
}
