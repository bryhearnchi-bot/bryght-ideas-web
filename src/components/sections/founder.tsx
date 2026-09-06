"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";

export function Founder() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="founder"
      className="grid gap-12 px-6 pb-20 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-14 lg:pb-28"
    >
      {/* Photo, tilted a couple of degrees */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative aspect-[4/5] w-full -rotate-2 overflow-hidden rounded-[16px] border-[3px] border-black"
      >
        <Image
          src="/bryan-hearn.jpg"
          alt={`${siteConfig.founder.name} — ${siteConfig.founder.title}, ${siteConfig.name}`}
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-cover"
        />
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        <span className="label text-blue-ink">{siteConfig.founder.title}</span>

        <h2
          className="display m-0"
          style={{ fontSize: "clamp(44px, 5vw, 72px)" }}
        >
          {siteConfig.founder.heading}
        </h2>

        <p className="m-0 max-w-[640px] text-[19px] leading-[1.5] text-[#333333]">
          {siteConfig.founder.bio}
        </p>
        <p className="m-0 max-w-[640px] text-[19px] leading-[1.5] text-[#333333]">
          {siteConfig.founder.bio2}
        </p>

        <span className="label text-[#444444]">
          {siteConfig.founder.location}
        </span>
      </motion.div>
    </section>
  );
}
