"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/section-wrapper";
import { siteConfig } from "@/config/site";

export function Contact() {
  return (
    <SectionWrapper id="contact" className="relative">
      <div className="absolute inset-0 -z-10 bg-mesh opacity-60" />

      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-medium tracking-widest uppercase text-gold">
            Let&apos;s Talk
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-3 tracking-tight">
            Have an Idea?{" "}
            <span className="text-gradient-blue">Let&apos;s Build It.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto leading-relaxed">
            Whether you need a custom app, technology guidance, or want to
            explore what&apos;s possible with AI — we&apos;d love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold group"
          >
            <a href={`mailto:${siteConfig.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {siteConfig.email}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <MapPin className="h-4 w-4" />
          {siteConfig.location}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
