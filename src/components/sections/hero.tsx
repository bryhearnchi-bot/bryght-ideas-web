"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute inset-0 bg-mesh -z-10" />

      <div className="max-w-[1152px] mx-auto text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/[0.05] text-xs font-medium mb-8"
        >
          <Sparkles size={14} className="text-gold" />
          <span className="text-gold tracking-wider uppercase">Chicago-Based Studio</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter mb-8 leading-[0.9]"
        >
          We Build <span className="text-primary italic">Apps</span>
          <br />
          That Matter.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans leading-relaxed"
        >
          {siteConfig.hero.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={siteConfig.hero.cta.href}
            className="bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 group hover:gap-4 transition-all hover:bg-primary/90"
          >
            {siteConfig.hero.cta.text}
            <ArrowRight size={20} />
          </a>
          <a
            href={siteConfig.hero.secondaryCta.href}
            className="px-8 py-4 rounded-full border border-border hover:bg-muted transition-colors font-medium text-foreground"
          >
            {siteConfig.hero.secondaryCta.text}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
