"use client";

import { useId } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * Slowly spinning ring of text with the lightbulb mark at its centre.
 * 260px and pinned to the top right of the hero on large screens; 150px and
 * right-aligned in the flow (above the subheadline) on everything smaller.
 */
export function RingBadge() {
  const pathId = useId();

  return (
    <div className="relative mt-8 ml-auto h-[150px] w-[150px] lg:absolute lg:top-10 lg:right-24 lg:mt-0 lg:h-[260px] lg:w-[260px]">
      <svg
        viewBox="0 0 260 260"
        aria-hidden="true"
        className="animate-spin-slow absolute inset-0 h-full w-full [transform-origin:center]"
      >
        <defs>
          <path
            id={pathId}
            d="M 130 130 m -104 0 a 104 104 0 1 1 208 0 a 104 104 0 1 1 -208 0"
          />
        </defs>
        <text
          className="label"
          style={{
            fontSize: "15px",
            letterSpacing: "0.22em",
            fill: "#111111",
            fontWeight: 700,
          }}
        >
          <textPath href={`#${pathId}`}>
            {siteConfig.hero.ringText.repeat(2)}
          </textPath>
        </text>
      </svg>

      <div className="absolute inset-[35px] flex items-center justify-center rounded-full bg-black lg:inset-[60px]">
        <Image
          src="/logo-lightbulb.png"
          alt=""
          width={64}
          height={96}
          className="h-[55px] w-auto object-contain lg:h-[96px]"
        />
      </div>
    </div>
  );
}
