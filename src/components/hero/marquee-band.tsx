import { siteConfig } from "@/config/site";

function Star() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#F7FAFF"
      aria-hidden="true"
      className="shrink-0 self-center"
    >
      <path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" />
    </svg>
  );
}

function MarqueeRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {siteConfig.hero.marquee.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-8">{item}</span>
          <Star />
        </span>
      ))}
    </div>
  );
}

/**
 * Full-bleed strip of app names running under the hero. The list is rendered
 * twice so the -50% slide loops seamlessly.
 */
export function MarqueeBand() {
  return (
    <div className="overflow-hidden bg-black py-4 text-blue-block">
      <div className="animate-slide display flex w-max tracking-[-0.02em] whitespace-nowrap uppercase text-[28px] md:text-[40px]">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
