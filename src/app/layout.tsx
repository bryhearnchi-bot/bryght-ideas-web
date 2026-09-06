import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "BRYght Ideas LLC — App Development & Technology Consulting",
  description:
    "Chicago app studio and technology consultancy. Mobile apps, web apps, AI features and consulting, founder-led on every project.",
  keywords: [
    "app development",
    "technology consulting",
    "Chicago",
    "mobile apps",
    "web apps",
    "AI",
  ],
  openGraph: {
    title: "BRYght Ideas LLC",
    description:
      "App Development & Technology Consulting — Chicago, Illinois",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bricolage.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {/* The nav rides on the blue hero block, so the band behind it is blue too. */}
        <div className="bg-blue-block">
          <Nav />
        </div>
        {children}
      </body>
    </html>
  );
}
