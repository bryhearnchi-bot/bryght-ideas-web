"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUpRight, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Contact() {
  return (
    <section id="contact" className="py-24 px-6 border-t border-border/40">
      <div className="max-w-[1152px] mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-serif font-bold mb-8"
        >
          Ready to shine?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto"
        >
          Whether you need a custom app, technology guidance, or want to explore
          what&apos;s possible with AI — we&apos;d love to hear from you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16"
        >
          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary transition-all w-full md:w-auto"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground m-0">Email us</p>
              <p className="font-bold m-0">{siteConfig.email}</p>
            </div>
          </a>
        </motion.div>

        <motion.a
          href={`mailto:${siteConfig.email}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 group text-2xl font-bold hover:text-primary transition-colors"
        >
          Start your inquiry{" "}
          <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <MapPin className="h-4 w-4" />
          {siteConfig.location}
        </motion.div>
      </div>
    </section>
  );
}
