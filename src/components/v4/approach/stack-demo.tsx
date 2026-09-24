"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "./hooks";
import type { DemoProps } from "./types";

/*
 * 02 · Modern stack, no compromises
 * Five thin glass slabs in a real CSS 3D isometric stack. They drop in once;
 * the hero moment spreads them into an exploded view with leader-line labels
 * (the same move the phone UI makes in the Work showcase).
 *
 * The projection is orthographic (no perspective), so a label can sit on the
 * slab's right-hand corner with plain maths: see .so-ap-lab in approach.css.
 */

// Top of the stack first; --i counts from the bottom.
const LAYERS = ["React Native", "Next.js", "Tailwind", "TypeScript", "Cloud-native"];

export function StackDemo({ play, hero, reduced }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const landed = useInView(ref, { once: true, rootMargin: "0px 0px -15% 0px" });
  const n = LAYERS.length;

  return (
    <div
      ref={ref}
      className="so-ap-stack"
      data-play={play ? "true" : undefined}
      data-hero={hero || reduced ? "true" : undefined}
      data-landed={landed === false && !reduced ? "false" : undefined}
    >
      <div className="so-ap-float">
        <div className="so-ap-iso">
          {LAYERS.map((name, k) => {
            const i = n - 1 - k;
            return (
              <div key={name} className="so-ap-slab" style={{ "--i": i } as CSSProperties}>
                <div className="so-ap-face">
                  <span className="so-ap-face-glow" />
                </div>
                <div className="so-ap-edge so-ap-edge-s" />
                <div className="so-ap-edge so-ap-edge-w" />
              </div>
            );
          })}
        </div>
        <div className="so-ap-labels">
          {LAYERS.map((name, k) => (
            <span key={name} className="so-ap-lab" style={{ "--i": n - 1 - k } as CSSProperties}>
              <span className="so-ap-lab-line" />
              <span className="so-ap-lab-text">{name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
