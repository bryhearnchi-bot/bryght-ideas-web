export const siteConfig = {
  name: "BRYght Ideas",
  legalName: "BRYght Ideas LLC",
  tagline: "Where bold ideas meet brilliant execution",
  description:
    "Chicago app studio and technology consultancy. Mobile apps, web apps, AI features and consulting, founder-led on every project.",
  url: "https://bryghtideas.com",
  location: "Chicago, Illinois",
  email: "hello@bryghtideas.com",

  nav: {
    links: [
      { label: "Services", href: "#services" },
      { label: "Work", href: "#work" },
      { label: "Approach", href: "#approach" },
      { label: "Founder", href: "#founder" },
    ],
    cta: { label: "Start a conversation", href: "#contact" },
  },

  hero: {
    eyebrow: "Chicago app studio · Founder-led · AI-augmented",
    headline: "We build\napps that",
    rollingWords: ["matter.", "travel.", "perform.", "sail."],
    subheadline:
      "Boutique app development and technology consulting from Chicago. Twenty-plus years of experience, AI-augmented development, and the founder on every project.",
    cta: { text: "Start a conversation", href: "#contact" },
    secondaryCta: { text: "See the work", href: "#work" },
    ringText: "Bold ideas · Brilliant execution · ",
    marquee: ["KGAY Travel", "BetweenActs", "MyCruiseCard", "Your app next"],
  },

  // Heading + intro for the services section. Kept alongside `services`
  // (which stays an array) so existing consumers keep compiling.
  servicesSection: {
    heading: "What we do",
    intro: "Four services. One small team that does all of them well.",
  },

  services: [
    {
      icon: "Smartphone",
      title: "Mobile apps",
      description: "Native and cross-platform. From concept to App Store.",
    },
    {
      icon: "Globe",
      title: "Web apps",
      description:
        "Full-stack, stunning interfaces, robust backends. Built to scale.",
    },
    {
      icon: "Brain",
      title: "AI features",
      description:
        "AI where it creates real value for the people using the app.",
    },
    {
      icon: "Lightbulb",
      title: "Consulting",
      description:
        "Architecture, stack selection, and digital transformation.",
    },
  ],

  // Heading + intro for the work section (renders the `apps` list).
  work: {
    heading: "Our own\napps,\ntoo.",
    intro:
      "We don’t just build for clients. The lab is where the process gets tested first.",
  },

  apps: [
    {
      name: "KGAY Travel",
      category: "Travel & Hospitality",
      description:
        "Reimagining how travelers discover and book inclusive experiences worldwide.",
      color: "#F7FAFF",
      icon: "Plane",
      status: "Live",
      screenshot: "/kgay-app-screenshot.png",
    },
    {
      name: "BetweenActs",
      category: "Entertainment",
      description:
        "The ultimate companion for theater lovers — enhancing every moment of the live experience.",
      color: "#1E90F0",
      icon: "Drama",
      status: "In development",
      screenshot: "/betweenacts-app-screenshot.png",
    },
    {
      name: "MyCruiseCard",
      category: "Travel & Lifestyle",
      description:
        "Your digital cruise companion — making every voyage seamless and unforgettable.",
      color: "#1E90F0",
      icon: "Ship",
      status: "In development",
      screenshot: "/mycruisecard-app-screenshot.png",
    },
    {
      name: "More Coming",
      category: "Various",
      description: "Our pipeline is full. We're always building the next thing.",
      color: "#F7FAFF",
      icon: "Sparkles",
      status: "Stay Tuned",
    },
  ],

  // Heading for the approach section. Kept alongside `approach`
  // (which stays an array) so existing consumers keep compiling.
  approachSection: {
    heading: "How we work",
  },

  approach: [
    {
      title: "AI-augmented development",
      description:
        "AI tools from ideation to deployment. Amplifying human creativity, not replacing it.",
    },
    {
      title: "Modern stack, no compromises",
      description:
        "React Native, Next.js, TypeScript, Tailwind, cloud-native architecture.",
    },
    {
      title: "Founder-led, every project",
      description:
        "No account managers. You work with the founder and a lean expert team.",
    },
    {
      title: "Built to last",
      description: "Clean architecture, real tests, documentation that helps.",
    },
  ],

  founder: {
    heading: "Hi, I’m Bryan.",
    name: "Bryan Hearn",
    title: "Founder & Principal",
    bio: "Over 20 years at the intersection of technology and business: enterprise IT in hospitality, recruiting technology platforms, and now a studio where deep technical knowledge meets creative vision, augmented by AI-powered development.",
    bio2: "BRYght Ideas is the culmination of that journey — a studio where deep technical knowledge meets creative vision, augmented by the latest in AI-powered development.",
    location: "Chicago, Illinois",
  },

  contact: {
    heading: "Let’s talk.",
    note: "Tell us what you’re building. You’ll hear back from Bryan, not a form.",
  },

  footer: {
    tagline: "Building the future, one bright idea at a time.",
    links: [
      { label: "Services", href: "#services" },
      { label: "Work", href: "#work" },
      { label: "Contact", href: "#contact" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
