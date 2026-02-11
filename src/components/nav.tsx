"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { siteConfig } from "@/config/site";

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  const handleMobileLink = useCallback((href: string) => {
    setMobileOpen(false);
    // Small delay to let menu close animation start, then scroll
    setTimeout(() => {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-2xl bg-background/70">
      <div className="max-w-[1152px] mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {siteConfig.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href={siteConfig.nav.cta.href}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 h-9 inline-flex items-center rounded-full transition-colors duration-200"
          >
            {siteConfig.nav.cta.label}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={toggleMobile}
          className="md:hidden text-muted-foreground p-2 hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {siteConfig.nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleMobileLink(link.href); }}
                  className="text-muted-foreground text-base hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={siteConfig.nav.cta.href}
                onClick={(e) => { e.preventDefault(); handleMobileLink(siteConfig.nav.cta.href); }}
                className="bg-primary text-white text-sm font-semibold px-4 py-3 rounded-full text-center mt-2"
              >
                {siteConfig.nav.cta.label}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
