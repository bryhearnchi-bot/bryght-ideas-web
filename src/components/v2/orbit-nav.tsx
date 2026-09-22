"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function OrbitNav() {
  const [open, setOpen] = useState(false);

  // Close first (which unlocks body scroll), then glide to the section.
  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="relative z-30 text-black">
      <div className="flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
        <a href="#top" aria-label={`${siteConfig.name} home`}>
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.links.map((link) => (
            <a key={link.href} href={link.href} className="o2-navlink">
              {link.label}
            </a>
          ))}
          <a href={siteConfig.nav.cta.href} className="o2-btn o2-btn-dark">
            {siteConfig.nav.cta.label}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="o2-iconbtn o2-navtoggle lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="o2-menu"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
      </div>

      {open && (
        <div id="o2-menu" role="dialog" aria-modal="true" aria-label="Menu" className="o2-menu">
          <div className="flex items-center justify-between px-5 py-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="o2-iconbtn o2-iconbtn-light"
              aria-label="Close menu"
              autoFocus
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-2 px-5">
            {siteConfig.nav.links.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => go(e, link.href)} className="o2-menu-link display">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="px-5 pb-[max(88px,env(safe-area-inset-bottom))]">
            <a
              href={siteConfig.nav.cta.href}
              onClick={(e) => go(e, siteConfig.nav.cta.href)}
              className="o2-btn o2-btn-blue w-full justify-center"
            >
              {siteConfig.nav.cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
