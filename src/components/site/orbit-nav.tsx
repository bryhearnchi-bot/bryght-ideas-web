"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function OrbitNav({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          scrolled
            ? "border-b border-[rgba(238,243,251,0.08)] bg-[rgba(10,13,20,0.84)] backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10"
        >
          <a href="#top" aria-label={`${siteConfig.name} home`} className="text-[#eef3fb]">
            <Logo />
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {siteConfig.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="label text-[#9aa6ba] transition-colors duration-200 hover:text-[#eef3fb]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={siteConfig.nav.cta.href}
              className="label rounded-full bg-blue-block px-5 py-3 text-[#0a0d14] transition-colors duration-200 hover:bg-yellow"
            >
              {siteConfig.nav.cta.label}
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-mr-2 p-2 text-[#eef3fb] lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="so-mobile-menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="so-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[55] flex flex-col bg-[rgba(10,13,20,0.94)] px-5 pb-24 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between">
              <span className="text-[#eef3fb]">
                <Logo />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-2 p-2 text-[#eef3fb]"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <ul className="mt-10 flex flex-col gap-2">
              {siteConfig.nav.links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="so-display block py-2 text-[44px] text-[#eef3fb]"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href={siteConfig.nav.cta.href}
              onClick={() => setOpen(false)}
              className="label mt-auto rounded-full bg-blue-block px-6 py-4 text-center text-[#0a0d14]"
            >
              {siteConfig.nav.cta.label}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
