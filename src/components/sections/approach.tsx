"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

export function Approach() {
  return (
    <section id="approach" className="py-24 px-6 bg-primary/5">
      <div className="max-w-[1152px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Our Approach
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We&apos;re a lean, AI-augmented studio that moves fast and builds
            right. No bloated teams, no wasted cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {siteConfig.approach.map((item, idx) => {
            const num = String(idx + 1).padStart(2, "0");
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <span className="text-7xl font-serif font-black text-foreground/5 absolute -top-10 -left-4 select-none">
                  {num}
                </span>
                <h3 className="text-xl font-bold mb-4 relative z-10">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-12">
          <div className="text-center">
            <div className="text-3xl font-serif font-bold text-gradient-gold">
              20+
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Years in Tech
            </div>
          </div>
          <div className="w-px h-12 bg-white/10 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl font-serif font-bold text-gradient-gold">
              AI+
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Augmented Team
            </div>
          </div>
          <div className="w-px h-12 bg-white/10 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl font-serif font-bold text-gradient-gold">
              4+
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Apps in Pipeline
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
