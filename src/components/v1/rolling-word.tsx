"use client";

import { useEffect, useState } from "react";
import { useMediaQuery, usePageVisible } from "./hooks";

/**
 * The headline's last word, flipping like a departure board.
 *
 * Only the current word is ever rendered inside the mask: each change
 * remounts it and it rises in from below, so no neighbouring word can
 * bleed into the box at any width or at any moment of the animation.
 * The box sizes to the word it holds.
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

  // Paused while the tab is hidden: CSS animations freeze there, and a
  // word frozen mid-rise would leave the box half empty.
  useEffect(() => {
    if (reduced || !visible || words.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => i + 1),
      interval,
    );
    return () => window.clearInterval(id);
  }, [reduced, visible, words.length, interval]);

  if (words.length === 0) return null;
  const word = words[reduced ? 0 : index % words.length];

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true" className="f1-roll">
        <span
          key={`${index}-${word}`}
          className="f1-roll-word"
          data-enter={index > 0 ? "true" : undefined}
        >
          {word}
        </span>
      </span>
    </>
  );
}
