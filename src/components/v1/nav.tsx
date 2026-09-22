"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import { useScrolledPast } from "./hooks";

export function FilamentNav() {
  const scrolled = useScrolledPast(24);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 text-black transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-black/10 bg-offwhite/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5 md:h-[76px] md:px-10">
        <a href="#top" aria-label={`${siteConfig.name} home`} className="f1-focus rounded-md">
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="f1-focus rounded-sm text-[15px] font-medium underline-offset-[6px] decoration-2 decoration-blue-block hover:underline"
            >
              {link.label}
            </a>
          ))}
          <a
            href={siteConfig.nav.cta.href}
            className="f1-focus rounded-full bg-black px-5 py-2.5 text-[15px] font-medium text-offwhite transition-colors hover:bg-blue-ink"
          >
            {siteConfig.nav.cta.label}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="f1-focus -mr-2 rounded-md p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="f1-mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open ? (
        <nav
          id="f1-mobile-menu"
          aria-label="Mobile"
          className="border-t border-black/10 px-5 pt-3 pb-7 md:hidden"
        >
          <ul className="flex flex-col">
            {siteConfig.nav.links.map((link) => (
              <li key={link.href} className="border-b border-black/10">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="f1-focus display block py-3.5 text-[34px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={siteConfig.nav.cta.href}
            onClick={() => setOpen(false)}
            className="f1-focus mt-6 flex items-center justify-center rounded-full bg-blue-block px-5 py-4 text-[16px] font-semibold text-black"
          >
            {siteConfig.nav.cta.label}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
