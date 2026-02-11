import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Approach } from "@/components/sections/approach";
import { Founder } from "@/components/sections/founder";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Hero />
      <Services />
      <Portfolio />
      <Approach />
      <Founder />
      <Contact />
      <Footer />
    </main>
  );
}
