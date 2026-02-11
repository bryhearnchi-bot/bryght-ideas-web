"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/section-wrapper";
import { siteConfig } from "@/config/site";

export function Approach() {
  return (
    <SectionWrapper id="approach">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left column — heading */}
        <div className="lg:sticky lg:top-32">
          <span className="text-xs font-medium tracking-widest uppercase text-gold">
            Our Approach
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-3 tracking-tight">
            Small Team,{" "}
            <span className="text-gradient-blue">Big Ambition</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            We&apos;re a lean, AI-augmented studio that moves fast and builds
            right. No bloated teams, no wasted cycles — just focused expertise
            and modern tooling.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <div className="font-display text-3xl font-bold text-gradient-gold">
                20+
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Years in Tech
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="font-display text-3xl font-bold text-gradient-gold">
                AI+
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Augmented Team
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="font-display text-3xl font-bold text-gradient-gold">
                4+
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Apps in Pipeline
              </div>
            </div>
          </div>
        </div>

        {/* Right column — approach items */}
        <div className="space-y-6">
          {siteConfig.approach.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative pl-8 border-l border-white/[0.06] hover:border-primary/40 transition-colors duration-300"
            >
              <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary -translate-x-[5px]" />
              <h3 className="font-display text-lg font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
