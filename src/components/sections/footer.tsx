import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-offwhite/20 bg-black px-6 py-6 text-offwhite lg:px-14">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <Logo />

        <div className="flex flex-wrap items-center gap-6 lg:gap-8">
          {siteConfig.footer.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label text-[#C5CBD6] transition-colors duration-200 hover:text-offwhite"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="m-0 text-[12px] text-[#C5CBD6]">
          © {year} {siteConfig.legalName}
        </p>
      </div>
    </footer>
  );
}
