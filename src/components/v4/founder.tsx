"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import type { SectionProps } from "./section-props";

export function Founder({}: SectionProps) {
  const f = siteConfig.founder;
  return (
    <section
      id="founder"
      data-morph="6"
      data-dim="0.45"
      aria-labelledby="so-founder-h"
      className="relative py-24 md:py-40"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[28px] ring-1 ring-[rgba(238,243,251,0.12)]">
          <Image
            src="/bryan-hearn.jpg"
            alt={`${f.name}, ${f.title} of ${siteConfig.name}`}
            fill
            sizes="(max-width: 1024px) 90vw, 440px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[rgba(5,7,12,0.85)] to-transparent p-5 pt-16">
            <span className="so-display text-[24px] text-[#eef3fb]">{f.name}</span>
            <span className="text-[13px] font-medium text-[#b9c3d4]">{f.location}</span>
          </div>
        </div>

        <div className="so-glass rounded-[28px] p-6 md:p-10">
          <p className="label m-0 text-blue-block">{f.title}</p>
          <h2
            id="so-founder-h"
            className="so-display m-0 mt-4 text-[#eef3fb]"
            style={{ fontSize: "clamp(44px, 5.5vw, 84px)" }}
          >
            {f.heading}
          </h2>
          <p className="m-0 mt-6 max-w-[62ch] text-[17px] leading-[1.6] text-[#c9d2e0] md:text-[18px]">
            {f.bio}
          </p>
          <p className="m-0 mt-4 max-w-[62ch] text-[17px] leading-[1.6] text-[#c9d2e0] md:text-[18px]">
            {f.bio2}
          </p>
        </div>
      </div>
    </section>
  );
}

