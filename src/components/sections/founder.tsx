"use client";

import { motion } from "framer-motion";
import { Quote, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Founder() {
  return (
    <section id="founder" className="py-24 px-6">
      <div className="max-w-[1152px] mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Photo placeholder — tasteful gradient */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-3" />
            <div className="relative rounded-3xl w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-blue-vivid/30 via-purple-vivid/20 to-gold/10 flex items-center justify-center">
              {/* Abstract pattern placeholder */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/40 blur-2xl" />
                <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-gold/30 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-purple-vivid/30 blur-3xl" />
              </div>
              <div className="relative z-10 text-center px-8">
                <div className="text-6xl font-serif font-bold text-foreground/20 mb-2">
                  BH
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Photo coming soon
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quote + bio */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full md:w-1/2"
        >
          <Quote size={48} className="text-primary/20 mb-8" />
          <h2 className="text-3xl md:text-4xl font-serif italic font-medium leading-tight mb-8">
            &ldquo;Technology should solve real problems for real people. That&apos;s what drives everything we build.&rdquo;
          </h2>
          <div className="mb-8">
            <p className="font-bold text-xl">{siteConfig.founder.name}</p>
            <p className="text-muted-foreground">{siteConfig.founder.title}</p>
          </div>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>{siteConfig.founder.bio}</p>
            <p>{siteConfig.founder.bio2}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-6 mt-6 border-t border-white/[0.06]">
            <MapPin className="h-4 w-4 text-primary" />
            {siteConfig.founder.location}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
