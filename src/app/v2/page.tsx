import type { Metadata } from "next";
import { OrbitPage } from "@/components/v2/orbit-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Orbit (3D·2) — ${siteConfig.legalName}`,
  description: siteConfig.description,
};

export default function Page() {
  return <OrbitPage />;
}
