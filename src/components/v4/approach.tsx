"use client";

import { siteConfig } from "@/config/site";
import type { SectionProps } from "./section-props";

export function Approach({}: SectionProps) {
  return (
    <section
      id="approach"
      data-morph="6"
      data-dim="0.4"
      aria-labelledby="so-approach-h"
      className="relative py-24 md:py-40"
    >
      {/*
        Early wave anchor: the field starts rolling into the wave as soon as
        the showcase lets go, instead of leaving a dark gap after the phones.
      */}
      <div
        data-morph="6"
        data-dim="0.4"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[50svh]"
      />
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <h2
          id="so-approach-h"
          className="so-display m-0 text-[#eef3fb]"
          style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
        >
          {siteConfig.approachSection.heading}
        </h2>
        <ul className="m-0 mt-12 grid max-w-[760px] list-none gap-3 p-0 sm:grid-cols-2 md:mt-16">
          {siteConfig.approach.map((item) => (
            <li key={item.title} className="so-glass rounded-[22px] p-6 md:p-7">
              <span
                aria-hidden="true"
                className="mb-6 block h-3 w-3 rounded-full border-2 border-blue-block"
              />
              <h3 className="so-display m-0 text-[26px] leading-[1] text-[#eef3fb] md:text-[28px]">
                {item.title}
              </h3>
              <p className="m-0 mt-3 text-[15px] leading-[1.55] text-[#b9c3d4]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

