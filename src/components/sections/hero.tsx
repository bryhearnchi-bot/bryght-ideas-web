import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { MarqueeBand } from "@/components/hero/marquee-band";
import { RingBadge } from "@/components/hero/ring-badge";
import { RollingWord } from "@/components/hero/rolling-word";
import { siteConfig } from "@/config/site";

export function Hero() {
  const headlineLines = siteConfig.hero.headline.split("\n");

  return (
    <section className="overflow-hidden bg-blue-block text-black">
      <div className="relative px-6 pt-10 md:px-14 md:pt-[72px]">
        <div className="label animate-pop mb-7">{siteConfig.hero.eyebrow}</div>

        <h1
          className="display animate-pop m-0 uppercase [animation-delay:.1s]"
          style={{ fontSize: "clamp(64px, 13.6vw, 196px)" }}
        >
          {headlineLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              <br />
            </Fragment>
          ))}
          <RollingWord words={siteConfig.hero.rollingWords} />
        </h1>

        <RingBadge />

        <div className="animate-pop grid items-end gap-8 pt-14 pb-16 [animation-delay:.2s] md:grid-cols-[minmax(0,1fr)_420px] md:gap-12">
          <p className="m-0 max-w-[620px] text-[22px] leading-[1.45] font-medium">
            {siteConfig.hero.subheadline}
          </p>

          <div className="flex flex-col gap-3.5 sm:flex-row sm:justify-end">
            <a
              href={siteConfig.hero.cta.href}
              className="label inline-flex items-center justify-center gap-3 rounded-[6px] bg-black px-[26px] py-5 text-offwhite transition-opacity duration-200 hover:opacity-85"
            >
              {siteConfig.hero.cta.text}
              <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
            </a>
            <a
              href={siteConfig.hero.secondaryCta.href}
              className="label inline-flex items-center justify-center rounded-[6px] border-2 border-black px-6 py-[18px] transition-colors duration-200 hover:bg-black hover:text-offwhite"
            >
              {siteConfig.hero.secondaryCta.text}
            </a>
          </div>
        </div>
      </div>

      <MarqueeBand />
    </section>
  );
}
