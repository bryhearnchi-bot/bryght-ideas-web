"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Ship } from "lucide-react";
import { siteConfig } from "@/config/site";

type AppEntry = (typeof siteConfig.apps)[number];

/** Not every app in siteConfig ships a screenshot, so narrow instead of casting. */
function screenshotOf(app: AppEntry): string | undefined {
  return "screenshot" in app ? app.screenshot : undefined;
}

const featuredApps = siteConfig.apps.filter((app) => app.name !== "More Coming");
const headingLines = siteConfig.work.heading.split("\n");

type FrameSpec = {
  left: number;
  top: number;
  width: number;
  rotate: number;
  maxHeight: number;
  radius: number;
  borderClass: string;
};

/** Positions of the tilted screens on the 720px desktop stage. */
const frameSpecs: FrameSpec[] = [
  {
    left: 40,
    top: 60,
    width: 300,
    rotate: -6,
    maxHeight: 640,
    radius: 32,
    borderClass: "border-solid border-offwhite",
  },
  {
    left: 340,
    top: 20,
    width: 300,
    rotate: 5,
    maxHeight: 640,
    radius: 32,
    borderClass: "border-solid border-blue-block",
  },
  {
    left: 596,
    top: 120,
    width: 220,
    rotate: -3,
    maxHeight: 480,
    radius: 28,
    borderClass: "border-dashed border-offwhite/50",
  },
];

const MOBILE_FRAME_WIDTH = 220;

function PhoneFrame({
  app,
  spec,
  width,
  rotate,
  className = "",
  style,
}: {
  app: AppEntry;
  spec: FrameSpec;
  width: number;
  rotate: number;
  className?: string;
  style?: CSSProperties;
}) {
  const screenshot = screenshotOf(app);

  return (
    <div
      className={`relative border-[3px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] ${spec.borderClass} ${
        screenshot
          ? "overflow-hidden"
          : "flex flex-col items-center justify-center gap-3 px-4 text-center"
      } ${className}`}
      style={{
        width,
        aspectRatio: "1320 / 2868",
        maxHeight: spec.maxHeight,
        borderRadius: spec.radius,
        transform: rotate === 0 ? undefined : `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {screenshot ? (
        <Image
          src={screenshot}
          alt={`${app.name} app screenshot`}
          fill
          sizes="(max-width: 1024px) 220px, 300px"
          className="object-cover object-top"
        />
      ) : (
        <>
          <Ship
            size={56}
            strokeWidth={1.5}
            aria-hidden="true"
            className="text-blue-block"
          />
          <span className="label leading-snug text-blue-block">
            {app.name} · {app.status}
          </span>
        </>
      )}
    </div>
  );
}

export function Portfolio() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="work"
      className="overflow-hidden bg-black px-6 py-20 text-offwhite lg:px-14 lg:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-center lg:gap-16">
        {/* Left: heading, intro, app index */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-7"
        >
          <h2
            className="display m-0 uppercase"
            style={{ fontSize: "clamp(48px, 6.7vw, 96px)" }}
          >
            {headingLines.map((line, idx) => (
              <span
                key={line}
                className={
                  idx === headingLines.length - 1 ? "block text-blue-block" : "block"
                }
              >
                {line}
              </span>
            ))}
          </h2>

          <p className="m-0 max-w-[380px] text-[18px] leading-[1.5] text-[#C5CBD6]">
            {siteConfig.work.intro}
          </p>

          <div className="flex flex-col gap-3.5 border-t border-offwhite/20 pt-6">
            {featuredApps.map((app) => (
              <div
                key={app.name}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="display text-[28px]">{app.name}</span>
                <span
                  className={`label text-right ${
                    app.status === "Live" ? "text-blue-block" : "text-[#C5CBD6]"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: the tilted stage (desktop) */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative hidden h-[720px] lg:block"
        >
          {featuredApps.map((app, idx) => {
            const spec = frameSpecs[idx];
            if (!spec) return null;
            return (
              <PhoneFrame
                key={app.name}
                app={app}
                spec={spec}
                width={spec.width}
                rotate={spec.rotate}
                className="absolute"
                style={{ left: spec.left, top: spec.top }}
              />
            );
          })}
        </motion.div>

        {/* Right: scroll-snap row (mobile / tablet) */}
        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:hidden">
          {featuredApps.map((app, idx) => {
            const spec = frameSpecs[idx];
            if (!spec) return null;
            return (
              <PhoneFrame
                key={app.name}
                app={app}
                spec={spec}
                width={MOBILE_FRAME_WIDTH}
                rotate={0}
                className="shrink-0 snap-start"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
