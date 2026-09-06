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
    <nav className="relative z-50 text-black">
      <div className="flex items-center justify-between px-6 py-5 md:px-14 md:py-7">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label text-current transition-colors duration-200 hover:text-blue-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href={siteConfig.nav.cta.href}
            className="label inline-flex items-center rounded-[6px] bg-black px-5 py-3.5 text-offwhite transition-opacity duration-200 hover:opacity-85"
          >
            {siteConfig.nav.cta.label}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={toggleMobile}
          className="p-2 text-current transition-colors hover:text-blue-ink md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="overflow-hidden bg-offwhite text-black md:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {siteConfig.nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileLink(link.href);
                  }}
                  className="label text-current transition-colors hover:text-blue-ink"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={siteConfig.nav.cta.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleMobileLink(siteConfig.nav.cta.href);
                }}
                className="label mt-1 rounded-[6px] bg-black px-5 py-3.5 text-center text-offwhite"
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
