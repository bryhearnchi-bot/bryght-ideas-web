"use client";

import type { DemoProps } from "./types";

/*
 * 03 · Founder-led, every project
 * The usual relay (You → Account manager → Project manager → Dev team) plays
 * first, a dim signal losing itself hop by hop. The middle layers are struck
 * out and dissolve; one bright direct line You ↔ Founder draws in, a pulse
 * runs along it, and a small expert team orbits the founder.
 * All timing is CSS (one 10s loop); the base styles are the finished frame.
 * Hovering with a mouse skips straight to the payoff (data-snap); on touch
 * the active card keeps the whole story and only speeds up the pulses.
 */

const YOU = { x: 46, y: 104 };
const FOUNDER = { x: 306, y: 104 };

function Pill({
  x,
  y,
  w,
  label,
  className,
  strike = false,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  className: string;
  strike?: boolean;
}) {
  return (
    <g className={className}>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={12} className="so-ap-pill" />
      <text x={x} y={y + 4} textAnchor="middle" className="so-ap-pill-t">
        {label}
      </text>
      {strike && (
        <path
          d={`M${x - w / 2 + 10} ${y} H${x + w / 2 - 10}`}
          pathLength={1}
          className="so-ap-strike"
        />
      )}
    </g>
  );
}

export function LinkDemo({ play, hero, hover, reduced }: DemoProps) {
  const span = FOUNDER.x - YOU.x;
  return (
    <div
      className="so-ap-link"
      data-play={play && !reduced ? "true" : undefined}
      data-hero={hero && !reduced ? "true" : undefined}
      data-snap={hover && play && !reduced ? "true" : undefined}
    >
      <p className="so-ap-link-cap">
        <span className="so-ap-link-cap-dot" />
        No account managers.
      </p>
      <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" className="so-ap-link-svg">
        <defs>
          <radialGradient id="so-ap-fglow">
            <stop offset="0" stopColor="#1e90f0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1e90f0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The relay */}
        <g className="so-ap-chain">
          <path
            d={`M${YOU.x} ${YOU.y} L128 48 L222 158 L${FOUNDER.x} ${FOUNDER.y}`}
            className="so-ap-chain-path"
          />
          <path
            d={`M${YOU.x} ${YOU.y} L128 48 L222 158 L${FOUNDER.x} ${FOUNDER.y}`}
            pathLength={1}
            className="so-ap-comet"
          />
          <Pill x={128} y={48} w={112} label="Account manager" className="so-ap-mid so-ap-mid-1" strike />
          <Pill x={222} y={158} w={112} label="Project manager" className="so-ap-mid so-ap-mid-2" strike />
          <Pill x={FOUNDER.x} y={FOUNDER.y} w={74} label="Dev team" className="so-ap-dev" />
        </g>

        {/* The direct line */}
        <path d={`M${YOU.x} ${YOU.y} H${FOUNDER.x}`} pathLength={1} className="so-ap-direct-glow" />
        <path d={`M${YOU.x} ${YOU.y} H${FOUNDER.x}`} pathLength={1} className="so-ap-direct" />
        <g className="so-ap-pulses" style={{ ["--span" as string]: `${span}px` }}>
          <circle cx={YOU.x} cy={YOU.y} r={9} className="so-ap-pulse-halo so-ap-pulse-a" />
          <circle cx={YOU.x} cy={YOU.y} r={3.5} className="so-ap-pulse so-ap-pulse-a" />
          <circle cx={YOU.x} cy={YOU.y} r={9} className="so-ap-pulse-halo so-ap-pulse-b" />
          <circle cx={YOU.x} cy={YOU.y} r={3.5} className="so-ap-pulse so-ap-pulse-b" />
        </g>

        {/* Founder and the lean team */}
        <g className="so-ap-founder">
          <circle cx={FOUNDER.x} cy={FOUNDER.y} r={44} fill="url(#so-ap-fglow)" />
          <circle cx={FOUNDER.x} cy={FOUNDER.y} r={36} className="so-ap-ring" />
          <g className="so-ap-orbit">
            <circle cx={FOUNDER.x + 36} cy={FOUNDER.y} r={4.5} className="so-ap-sat" />
            <circle cx={FOUNDER.x - 18} cy={FOUNDER.y - 31.2} r={4.5} className="so-ap-sat" />
            <circle cx={FOUNDER.x - 18} cy={FOUNDER.y + 31.2} r={4.5} className="so-ap-sat" />
          </g>
          <circle cx={FOUNDER.x} cy={FOUNDER.y} r={15} className="so-ap-fnode" />
          <circle cx={FOUNDER.x} cy={FOUNDER.y} r={5} className="so-ap-fcore" />
          <text x={FOUNDER.x} y={FOUNDER.y + 60} textAnchor="middle" className="so-ap-node-t so-ap-node-t-hi">
            Founder
          </text>
        </g>

        {/* You */}
        <g className="so-ap-you">
          <circle cx={YOU.x} cy={YOU.y} r={15} className="so-ap-ynode" />
          <circle cx={YOU.x} cy={YOU.y} r={5} className="so-ap-ycore" />
          <text x={YOU.x} y={YOU.y + 36} textAnchor="middle" className="so-ap-node-t">
            You
          </text>
        </g>
      </svg>
    </div>
  );
}
