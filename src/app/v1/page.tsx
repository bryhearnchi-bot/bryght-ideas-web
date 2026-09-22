import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { FilamentShell } from "@/components/v1/shell";
import {
  Approach,
  Contact,
  Footer,
  Founder,
  Hero,
  Services,
  Work,
} from "@/components/v1/sections";

export const metadata: Metadata = {
  title: `Filament (3D·1) · ${siteConfig.legalName}`,
  description: siteConfig.description,
};

export default function FilamentPage() {
  return (
    <FilamentShell>
      <Hero />
      <Services />
      <Work />
      <Approach />
      <Founder />
      <Contact />
      <Footer />
    </FilamentShell>
  );
}
