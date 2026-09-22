"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Brain, Globe, Lightbulb, Smartphone, type LucideIcon } from "lucide-react";
import { MarqueeBand } from "@/components/hero/marquee-band";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

const ICONS: Record<string, LucideIcon> = { Smartphone, Globe, Brain, Lightbulb };

const splitLast = (heading: string) => {
  const words = heading.split(" ");
  return [words.slice(0, -1).join(" "), words[words.length - 1]] as const;
};

/* ---------- Services: cards that tilt toward the cursor ---------- */

const CARD_TONES = ["o2-card-white", "o2-card-ink", "o2-card-yellow", "o2-card-blue"];

function TiltCard({ index, children }: { index: number; children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), spring);
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="o2-tilt-wrap">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
        className={`o2-card ${CARD_TONES[index % CARD_TONES.length]}`}
      >
        {children}
        {!reduced && (
          <motion.span
            aria-hidden="true"
            className="o2-card-glare"
            style={{ ["--gx" as string]: glareX, ["--gy" as string]: glareY }}
          />
        )}
      </motion.div>
    </div>
  );
}

function Services() {
  const [lead, last] = splitLast(siteConfig.servicesSection.heading);
  return (
    <section id="services" className="o2-section o2-services" aria-labelledby="o2-services-h">
      <div className="o2-section-head">
        <h2 id="o2-services-h" className="display o2-h2">
          {lead}
          <br />
          {last}
        </h2>
        <p className="o2-lede">{siteConfig.servicesSection.intro}</p>
      </div>
      <div className="o2-cards">
        {siteConfig.services.map((service, i) => {
          const Icon = ICONS[service.icon] ?? Lightbulb;
          return (
            <TiltCard key={service.title} index={i}>
              <span className="o2-card-icon" aria-hidden="true">
                <Icon size={30} strokeWidth={2.25} />
              </span>
              <div className="o2-card-text">
                <h3 className="display o2-card-title">{service.title}</h3>
                <p className="o2-card-desc">{service.description}</p>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Approach ---------- */

function Approach() {
  const [lead, last] = splitLast(siteConfig.approachSection.heading);
  return (
    <section id="approach" className="o2-section o2-approach" aria-labelledby="o2-approach-h">
      <h2 id="o2-approach-h" className="display o2-h2 o2-approach-h">
        {lead}
        <br />
        {last}
      </h2>
      <ul className="o2-principles">
        {siteConfig.approach.map((item) => (
          <li key={item.title}>
            <h3 className="display">{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Founder ---------- */

function Founder() {
  const f = siteConfig.founder;
  return (
    <section id="founder" className="o2-section o2-founder" aria-labelledby="o2-founder-h">
      <div className="o2-portrait">
        <Image
          src="/bryan-hearn.jpg"
          alt={`${f.name}, ${f.title}, ${siteConfig.name}`}
          fill
          sizes="(max-width: 1024px) 90vw, 440px"
          className="object-cover"
        />
      </div>
      <div className="o2-founder-copy">
        <p className="o2-founder-role">
          {f.name}, {f.title}
        </p>
        <h2 id="o2-founder-h" className="display o2-h2">
          {f.heading}
        </h2>
        <p>{f.bio}</p>
        <p>{f.bio2}</p>
        <p className="o2-founder-loc">{f.location}</p>
      </div>
    </section>
  );
}

/* ---------- Contact + footer ---------- */

function Contact() {
  const [lead, last] = splitLast(siteConfig.contact.heading);
  return (
    <section id="contact" className="o2-contact" aria-labelledby="o2-contact-h">
      <h2 id="o2-contact-h" className="display o2-contact-h">
        {lead && <span className="block">{lead}</span>}
        <span className="block o2-blue">{last}</span>
      </h2>
      <p className="o2-contact-note">{siteConfig.contact.note}</p>
      <div className="o2-contact-row">
        <a href={`mailto:${siteConfig.email}`} className="display o2-email">
          {siteConfig.email}
        </a>
        <span className="o2-contact-legal">
          {siteConfig.legalName}, {siteConfig.location}
        </span>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="o2-footer">
      <Logo />
      <p className="o2-footer-tag">{siteConfig.footer.tagline}</p>
      <nav aria-label="Footer" className="o2-footer-links">
        {siteConfig.footer.links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <p className="o2-footer-legal">
        © {year} {siteConfig.legalName}
      </p>
    </footer>
  );
}

export function OrbitSections() {
  return (
    <>
      <MarqueeBand />
      <Services />
      <Approach />
      <Founder />
      <Contact />
      <Footer />
    </>
  );
}
