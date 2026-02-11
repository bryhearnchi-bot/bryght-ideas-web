import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-[1152px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium mb-8"
        >
          <Sparkles size={14} className="text-primary" />
          <span>Award Winning App Studio</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter mb-8 leading-[0.9]"
        >
          We Build <span className="text-primary italic">Exceptional</span> <br /> Digital Experiences.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans"
        >
          Bryght Ideas is a premium development studio focusing on high-performance mobile apps and cinematic web interfaces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold flex items-center gap-2 group hover:gap-4 transition-all">
            Start a Project <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 rounded-full border border-border hover:bg-muted transition-colors font-medium">
            View Portfolio
          </button>
        </motion.div>
      </div>
    </section>
  );
}
