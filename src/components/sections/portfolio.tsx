"use client";

import { motion } from "framer-motion";
import { Plane, Theater, Ship, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/section-wrapper";
import { siteConfig } from "@/config/site";

const iconMap: Record<string, React.ElementType> = {
  Plane,
  Drama: Theater,
  Ship,
  Sparkles,
};

export function Portfolio() {
  return (
    <SectionWrapper id="portfolio" className="relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-purple-vivid/[0.03] blur-[120px]" />
      </div>

      <div className="text-center mb-16">
        <span className="text-xs font-medium tracking-widest uppercase text-gold">
          Our Apps
        </span>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-3 tracking-tight">
          Building a Portfolio of Products
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
          We don&apos;t just build for clients — we build our own apps too.
          Here&apos;s a glimpse of what&apos;s in the lab.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {siteConfig.apps.map((app, i) => {
          const Icon = iconMap[app.icon];
          return (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative card-glow rounded-lg bg-card/50 p-8 backdrop-blur-sm overflow-hidden"
            >
              {/* Colored accent bar */}
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${app.color}, transparent)`,
                }}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${app.color}15` }}
                >
                  {Icon && (
                    <Icon className="h-5 w-5" style={{ color: app.color }} />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] tracking-wider uppercase border-white/10 text-muted-foreground"
                >
                  {app.status}
                </Badge>
              </div>

              <h3 className="font-display text-xl font-semibold mb-1">
                {app.name}
              </h3>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3">
                {app.category}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {app.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
