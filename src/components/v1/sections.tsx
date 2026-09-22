import Image from "next/image";
import {
  Brain,
  Globe,
  Lightbulb,
  Ship,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { RollingWord } from "./rolling-word";
import { siteConfig } from "@/config/site";

/*
 * Layout contract with the 3D stage (see scene/choreography.ts):
 *  ≥1024px  hero text left / bulb right; services right; work text left
 *           with phones + bulb right; approach right; founder photo left
 *           (bulb above it); contact text left / bulb right.
 *  <1024px  bulb sits in the top of the hero and the contact section,
 *           and docks bottom-right between them. Text is always HTML.
 */

const PAD = "px-5 md:px-10";

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Globe,
  Brain,
  Lightbulb,
};

type AppEntry = (typeof siteConfig.apps)[number];
const featuredApps = siteConfig.apps.filter((a) => a.name !== "More Coming");
const screenshotOf = (app: AppEntry) =>
  "screenshot" in app ? app.screenshot : undefined;

export function Hero() {
  const lines = siteConfig.hero.headline.split("\n");
  return (
    <section
      id="top"
      className={`relative flex min-h-[100svh] flex-col justify-end pt-[50svh] pb-10 lg:justify-center lg:pt-32 lg:pb-24 ${PAD}`}
    >
      <div className="lg:max-w-[54%]">
        <p className="mb-5 text-[14px] font-medium text-black/65 md:text-[15px]">
          {siteConfig.hero.eyebrow}
        </p>
        <h1 className="display m-0 text-[clamp(50px,14.2vw,112px)] text-black uppercase lg:text-[clamp(64px,8.2vw,148px)]">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <RollingWord words={siteConfig.hero.rollingWords} />
        </h1>
        <p className="mt-7 max-w-[36ch] text-[17px] leading-[1.55] text-black/80 md:text-[19px]">
          {siteConfig.hero.subheadline}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={siteConfig.hero.cta.href}
            className="f1-focus inline-flex items-center justify-center rounded-full bg-blue-block px-7 py-4 text-[16px] font-semibold text-black transition-colors hover:bg-black hover:text-offwhite"
          >
            {siteConfig.hero.cta.text}
          </a>
          <a
            href={siteConfig.hero.secondaryCta.href}
            className="f1-focus inline-flex items-center justify-center rounded-full px-2 py-3 text-[16px] font-semibold text-black underline decoration-2 decoration-blue-block underline-offset-[6px] hover:decoration-black"
          >
            {siteConfig.hero.secondaryCta.text}
          </a>
        </div>
        <ul
          aria-label="Apps from the studio"
          className="mt-12 flex flex-wrap gap-x-5 gap-y-1 border-t border-black/15 pt-5 text-[14px] font-medium text-black/55"
        >
          {siteConfig.hero.marquee.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className={`relative scroll-mt-20 py-24 lg:py-40 ${PAD}`}>
      <div className="lg:ml-[50%] lg:max-w-[620px]">
        <h2 className="display m-0 text-[clamp(44px,11vw,96px)] uppercase lg:text-[clamp(56px,6vw,96px)]">
          {siteConfig.servicesSection.heading}
        </h2>
        <p className="mt-5 max-w-[40ch] text-[18px] leading-[1.55] text-black/70">
          {siteConfig.servicesSection.intro}
        </p>
        <ul className="mt-12 border-t-2 border-black">
          {siteConfig.services.map((s) => {
            const Icon = ICONS[s.icon] ?? Lightbulb;
            return (
              <li
                key={s.title}
                className="grid grid-cols-[44px_minmax(0,1fr)] gap-5 border-b-2 border-black py-7 md:grid-cols-[52px_minmax(0,1fr)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-blue-block text-black md:h-[52px] md:w-[52px]">
                  <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="display m-0 text-[28px] leading-none md:text-[34px]">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 max-w-[46ch] text-[16px] leading-[1.55] text-black/70">
                    {s.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function PhoneShot({ app }: { app: AppEntry }) {
  const shot = screenshotOf(app);
  return (
    <figure className="relative m-0 aspect-[1320/2868] w-[200px] shrink-0 snap-start overflow-hidden rounded-[30px] border-[6px] border-black bg-black shadow-[0_24px_50px_-20px_rgba(13,42,82,0.45)] lg:w-[210px]">
      {shot ? (
        <Image
          src={shot}
          alt={`${app.name} app screenshot`}
          fill
          sizes="210px"
          className="object-cover object-top"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-blue-block px-4 text-center text-black">
          <Ship size={48} strokeWidth={1.6} aria-hidden="true" />
          <span className="display text-[28px]">{app.name}</span>
          <span className="text-[13px] font-semibold">{app.status}</span>
        </div>
      )}
    </figure>
  );
}

export function Work() {
  const lines = siteConfig.work.heading.split("\n");
  return (
    <section id="work" className={`relative scroll-mt-20 py-24 lg:min-h-[110vh] lg:py-40 ${PAD}`}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="lg:max-w-[560px]">
          <h2 className="display m-0 text-[clamp(44px,11vw,96px)] uppercase lg:text-[clamp(56px,6vw,96px)]">
            {lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[40ch] text-[18px] leading-[1.55] text-black/70">
            {siteConfig.work.intro}
          </p>
          <ul className="mt-10 border-t-2 border-black">
            {featuredApps.map((app) => {
              const live = app.status === "Live";
              return (
                <li key={app.name} className="border-b-2 border-black py-6">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <h3 className="display m-0 text-[30px] leading-none md:text-[36px]">
                      {app.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-[13px] font-semibold ${
                        live ? "bg-blue-block text-black" : "border-[1.5px] border-black/40 text-black/70"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-semibold text-blue-ink">
                    {app.category}
                  </p>
                  <p className="mt-2 max-w-[46ch] text-[16px] leading-[1.55] text-black/70">
                    {app.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* HTML screens: always on small screens; on desktop they give way
            to the 3D phones once the scene is running. */}
        <div className="f1-phones-html -mx-5 md:-mx-10 lg:mx-0">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10 lg:justify-center lg:overflow-visible lg:px-0">
            {featuredApps.map((app) => (
              <PhoneShot key={app.name} app={app} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Approach() {
  return (
    <section id="approach" className={`relative scroll-mt-20 py-24 lg:py-40 ${PAD}`}>
      <div className="lg:ml-[50%] lg:max-w-[620px]">
        <h2 className="display m-0 text-[clamp(44px,11vw,96px)] uppercase lg:text-[clamp(56px,6vw,96px)]">
          {siteConfig.approachSection.heading}
        </h2>
        <ul className="mt-12 flex flex-col gap-9">
          {siteConfig.approach.map((a) => (
            <li key={a.title} className="border-l-4 border-blue-block pl-5">
              <h3 className="display m-0 text-[26px] leading-[1.05] md:text-[32px]">
                {a.title}
              </h3>
              <p className="mt-2 max-w-[46ch] text-[16px] leading-[1.55] text-black/70">
                {a.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Founder() {
  const f = siteConfig.founder;
  return (
    <section id="founder" className={`relative scroll-mt-20 py-24 lg:py-40 ${PAD}`}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-20">
        <div className="mx-auto w-full max-w-[360px] lg:mx-0 lg:mt-24">
          <div className="relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[22px] border-2 border-black bg-black">
            <Image
              src="/bryan-hearn.jpg"
              alt={`${f.name}, ${f.title} of ${siteConfig.name}`}
              fill
              sizes="(min-width: 1024px) 360px, 90vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="max-w-[640px]">
          <p className="text-[15px] font-semibold text-blue-ink">{f.title}</p>
          <h2 className="display mt-3 mb-0 text-[clamp(44px,10vw,80px)]">{f.heading}</h2>
          <p className="mt-6 text-[18px] leading-[1.6] text-black/80">{f.bio}</p>
          <p className="mt-4 text-[18px] leading-[1.6] text-black/80">{f.bio2}</p>
          <p className="mt-7 text-[15px] font-medium text-black/60">
            {f.name}, {f.location}
          </p>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const words = siteConfig.contact.heading.split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words[words.length - 1];
  return (
    <section
      id="contact"
      className={`f1-contact relative flex min-h-[100svh] scroll-mt-20 flex-col justify-end bg-black pt-[52svh] pb-20 text-offwhite lg:justify-center lg:pt-32 lg:pb-32 ${PAD}`}
    >
      <div className="lg:max-w-[52%]">
        <h2 className="display m-0 text-[clamp(72px,21vw,180px)] leading-[0.85] uppercase lg:text-[clamp(96px,11vw,200px)]">
          {lead ? <span className="block">{lead}</span> : null}
          <span className="block text-blue-block">{last}</span>
        </h2>
        <p className="mt-7 max-w-[40ch] text-[18px] leading-[1.55] text-offwhite/75">
          {siteConfig.contact.note}
        </p>
        <a
          href={`mailto:${siteConfig.email}`}
          className="f1-focus display mt-9 inline-block border-b-4 border-blue-block pb-1 text-[clamp(24px,6.4vw,48px)] text-offwhite transition-colors hover:text-yellow"
        >
          {siteConfig.email}
        </a>
        <p className="mt-8 text-[14px] text-offwhite/55">
          {siteConfig.legalName}, {siteConfig.location}
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={`relative bg-black pt-10 pb-24 text-offwhite md:pb-10 ${PAD}`}>
      <div className="flex flex-col gap-8 border-t border-offwhite/15 pt-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="m-0 text-[14px] text-offwhite/60">{siteConfig.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {siteConfig.footer.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="f1-focus rounded-sm text-[15px] font-medium text-offwhite/75 hover:text-offwhite"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <p className="m-0 text-[13px] text-offwhite/50">
          © {year} {siteConfig.legalName}
        </p>
      </div>
    </footer>
  );
}
