"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";

/**
 * Card treatments, in the order the mockup lays them out:
 * white / black / white / blue. Card 3's numeral carries the
 * only yellow on the site.
 */
const cardStyles = [
  {
    card: "bg-white",
    numeral: "text-blue-block [-webkit-text-stroke:2px_#111111]",
    description: "text-[#444444]",
  },
  {
    card: "bg-black text-offwhite",
    numeral: "text-blue-block",
    description: "text-[#C5CBD6]",
  },
  {
    card: "bg-white",
    numeral: "text-yellow [-webkit-text-stroke:2px_#111111]",
    description: "text-[#444444]",
  },
  {
    card: "bg-blue-block",
    numeral: "text-black",
    description: "text-[#0B1A33]",
  },
] as const;

// "What we do" -> "What we" / "do": the last word drops to its own line.
const headingWords = siteConfig.servicesSection.heading.split(" ");
const headingLastWord = headingWords[headingWords.length - 1];
const headingFirstLine = headingWords.slice(0, -1).join(" ");

export function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="bg-offwhite px-[24px] pt-[72px] pb-[72px] text-black md:px-[56px] md:pt-[112px] md:pb-[96px]"
    >
      <div className="mb-10 flex flex-col items-start gap-8 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-10">
        <h2 className="display m-0 text-[clamp(48px,6.7vw,96px)] uppercase">
          {headingFirstLine}
          <br />
          {headingLastWord}
        </h2>
        <p className="m-0 max-w-[420px] text-[18px] leading-[1.5] text-[#444444]">
          {siteConfig.servicesSection.intro}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {siteConfig.services.map((service, index) => {
          const treatment = cardStyles[index % cardStyles.length];
          return (
            <motion.div
              key={service.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : index * 0.08,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className={`flex min-h-[360px] flex-col justify-between gap-10 rounded-[12px] border-2 border-black p-7 ${treatment.card}`}
            >
              <span
                className={`display text-[120px] leading-[0.8] ${treatment.numeral}`}
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-2.5">
                <span className="display text-[30px]">{service.title}</span>
                <span
                  className={`text-[15px] leading-[1.5] ${treatment.description}`}
                >
                  {service.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
