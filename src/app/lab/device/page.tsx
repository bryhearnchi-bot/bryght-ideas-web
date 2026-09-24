import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LabClient from "./lab-client";

export const metadata: Metadata = {
  title: "Device lab",
  robots: { index: false, follow: false },
};

/** Dev-only test bench: production builds answer 404. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabClient />;
}
