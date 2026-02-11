import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "BRYght Ideas LLC — App Development & Technology Consulting",
  description:
    "Chicago-based app development studio and technology consultancy. We build beautiful, AI-powered mobile and web applications.",
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${playfair.variable} ${plusJakarta.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <div className="grain" />
        <Nav />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
