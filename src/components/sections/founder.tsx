"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/section-wrapper";
import { siteConfig } from "@/config/site";

export function Founder() {
  return (
    <SectionWrapper id="founder" className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-vivid/[0.04] blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-medium tracking-widest uppercase text-gold">
            The Founder
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-3 tracking-tight">
            {siteConfig.founder.name}
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            {siteConfig.founder.title}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-glow rounded-lg bg-card/50 p-8 md:p-12 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <p className="text-foreground/90 leading-relaxed text-base md:text-lg">
              {siteConfig.founder.bio}
            </p>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {siteConfig.founder.bio2}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-white/[0.06]">
              <MapPin className="h-4 w-4 text-primary" />
              {siteConfig.founder.location}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
