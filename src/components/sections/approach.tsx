"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";

// "How we work" -> "How we" / "work": the last word drops to its own line.
const headingWords = siteConfig.approachSection.heading.split(" ");
const headingLastWord = headingWords[headingWords.length - 1];
const headingFirstLine = headingWords.slice(0, -1).join(" ");

export function Approach() {
  const reduceMotion = useReducedMotion();
  const lastIndex = siteConfig.approach.length - 1;

  return (
    <section
      id="approach"
      className="grid grid-cols-1 items-start gap-10 bg-offwhite px-[24px] pt-[72px] pb-[72px] text-black md:px-[56px] md:pt-[112px] md:pb-[96px] lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-16"
    >
      <h2 className="display m-0 text-[clamp(48px,6.7vw,96px)] uppercase">
        {headingFirstLine}
        <br />
        {headingLastWord}
      </h2>

      <div className="flex flex-col">
        {siteConfig.approach.map((item, index) => (
          <motion.div
            key={item.title}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : index * 0.06,
              ease: [0.2, 0.7, 0.2, 1],
            }}
            className={`grid grid-cols-[80px_minmax(0,1fr)] items-baseline gap-6 border-t-2 border-black py-7 ${
              index === lastIndex ? "border-b-2" : ""
            }`}
          >
            <span className="display text-[40px] text-blue-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="display text-[34px]">{item.title}</span>
              <span className="text-[16px] leading-[1.5] text-[#444444]">
                {item.description}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
