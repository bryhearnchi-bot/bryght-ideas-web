"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";

const headingWords = siteConfig.contact.heading.split(" ");
const headingLead = headingWords.slice(0, -1).join(" ");
const headingLast = headingWords[headingWords.length - 1];

export function Contact() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="contact"
      className="bg-black px-6 pt-20 pb-14 text-offwhite lg:px-14 lg:pt-28 lg:pb-[72px]"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-10 lg:gap-12"
      >
        <h2
          className="display m-0 uppercase"
          style={{ fontSize: "clamp(72px, 15.3vw, 220px)", lineHeight: 0.85 }}
        >
          {headingLead ? <span className="block">{headingLead}</span> : null}
          <span className="block text-blue-block">{headingLast}</span>
        </h2>

        <p className="m-0 max-w-[460px] text-[18px] leading-[1.5] text-[#C5CBD6]">
          {siteConfig.contact.note}
        </p>

        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-offwhite/20 pt-8 lg:gap-10">
          <a
            href={`mailto:${siteConfig.email}`}
            className="display inline-block border-b-4 border-blue-block text-offwhite"
            style={{ fontSize: "clamp(24px, 3vw, 44px)" }}
          >
            {siteConfig.email}
          </a>
          <span className="label text-[#C5CBD6]">
            {siteConfig.legalName} · {siteConfig.location}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
