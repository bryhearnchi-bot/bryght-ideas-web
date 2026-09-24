"use client";

import type { CSSProperties } from "react";
import type { DemoProps } from "./types";

/*
 * 04 · Built to last
 * A blueprint: a clean frame draws itself line by line (foundation, columns,
 * floors, bracing, roof truss, dimensions) while a checklist ticks in order
 * and ends on a "passing" pill. One 9s CSS loop; every element runs the same
 * keyframes on its own delay, so the drawing erases and rebuilds as a wave.
 * Base styles are the finished frame (reduced motion, and before first view).
 */

type Stroke = { d: string; delay: number; kind?: "main" | "fine" | "dim" };

const STROKES: Stroke[] = [
  { d: "M12 178 H212", delay: 0, kind: "main" },
  { d: "M40 178 V98", delay: 0.2, kind: "main" },
  { d: "M90 178 V98", delay: 0.3, kind: "main" },
  { d: "M140 178 V98", delay: 0.4, kind: "main" },
  { d: "M190 178 V98", delay: 0.5, kind: "main" },
  { d: "M40 152 H190", delay: 0.8 },
  { d: "M40 125 H190", delay: 0.95 },
  { d: "M40 98 H190", delay: 1.1, kind: "main" },
  { d: "M40 178 L90 152 M90 178 L40 152", delay: 1.35, kind: "fine" },
  { d: "M140 152 L190 125 M140 125 L190 152", delay: 1.55, kind: "fine" },
  { d: "M90 125 L140 98 M90 98 L140 125", delay: 1.75, kind: "fine" },
  { d: "M30 98 L115 46 L200 98", delay: 2.0, kind: "main" },
  { d: "M115 46 V98 M72.5 98 L115 72 L157.5 98", delay: 2.3, kind: "fine" },
  { d: "M22 98 V178 M18 98 H26 M18 178 H26", delay: 2.65, kind: "dim" },
  { d: "M40 28 H190 M40 24 V32 M190 24 V32", delay: 2.85, kind: "dim" },
];

const JOINTS: [number, number][] = [
  [40, 178], [90, 178], [140, 178], [190, 178],
  [40, 152], [90, 152], [140, 152], [190, 152],
  [40, 125], [90, 125], [140, 125], [190, 125],
  [40, 98], [90, 98], [140, 98], [190, 98], [115, 46],
];

const CHECKS = [
  { label: "Clean architecture", delay: 1.0 },
  { label: "Real tests", delay: 2.1 },
  { label: "Documentation that helps", delay: 3.2 },
];

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function BuildDemo({ play, hero, reduced }: DemoProps) {
  return (
    <div
      className="so-ap-build"
      data-play={play && !reduced ? "true" : undefined}
      data-hero={hero && !reduced ? "true" : undefined}
    >
      <div className="so-ap-bp">
        <svg viewBox="0 0 224 196" preserveAspectRatio="xMidYMid meet" className="so-ap-bp-svg">
          {STROKES.map((s, i) => (
            <path
              key={i}
              d={s.d}
              pathLength={1}
              className={`so-ap-bp-l so-ap-bp-${s.kind ?? "mid"}`}
              style={d(s.delay)}
            />
          ))}
          {JOINTS.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.2}
              className="so-ap-bp-j"
              style={d(1.0 + (i % 4) * 0.06 + Math.floor(i / 4) * 0.22)}
            />
          ))}
        </svg>
        <span className="so-ap-scan" />
      </div>
      <ul className="so-ap-checks">
        {CHECKS.map((c) => (
          <li key={c.label} className="so-ap-check" style={d(c.delay)}>
            <span className="so-ap-tick">
              <svg viewBox="0 0 16 16">
                <path d="M4 8.4 L7 11 L12 5.2" pathLength={1} />
              </svg>
            </span>
            <span className="so-ap-check-t">{c.label}</span>
          </li>
        ))}
        <li className="so-ap-pass" style={d(4.1)}>
          <span className="so-ap-pass-dot" />
          All checks passing
        </li>
      </ul>
    </div>
  );
}
