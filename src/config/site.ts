export const siteConfig = {
  name: "BRYght Ideas",
  legalName: "BRYght Ideas LLC",
  tagline: "Where bold ideas meet brilliant execution",
  description:
    "Chicago-based app development studio and technology consultancy building beautiful, AI-powered applications.",
  url: "https://bryghtideas.com",
  location: "Chicago, Illinois",
  email: "hello@bryghtideas.com",

  nav: {
    links: [
      { label: "Services", href: "#services" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Approach", href: "#approach" },
      { label: "Founder", href: "#founder" },
    ],
    cta: { label: "Get in Touch", href: "#contact" },
  },

  hero: {
    headline: "We Build Apps\nThat Matter",
    subheadline:
      "Boutique app development & technology consulting from Chicago. We combine 20+ years of tech expertise with AI-augmented development to create exceptional digital experiences.",
    cta: { text: "Start a Conversation", href: "#contact" },
    secondaryCta: { text: "See Our Work", href: "#portfolio" },
  },

  services: [
    {
      icon: "Smartphone",
      title: "Mobile App Development",
      description:
        "Native and cross-platform mobile experiences built with modern frameworks. From concept to App Store.",
    },
    {
      icon: "Globe",
      title: "Web Applications",
      description:
        "Full-stack web applications with stunning interfaces and robust backends. Built to scale.",
    },
    {
      icon: "Brain",
      title: "AI-Powered Solutions",
      description:
        "Intelligent features that transform user experiences. We integrate AI where it creates real value.",
    },
    {
      icon: "Lightbulb",
      title: "Technology Consulting",
      description:
        "Strategic guidance for your tech decisions. Architecture, stack selection, and digital transformation.",
    },
  ],

  apps: [
    {
      name: "KGAY Travel",
      category: "Travel & Hospitality",
      description:
        "Reimagining how travelers discover and book inclusive experiences worldwide.",
      color: "#2563eb",
      icon: "Plane",
      status: "In Development",
    },
    {
      name: "BetweenActs",
      category: "Entertainment",
      description:
        "The ultimate companion for theater lovers — enhancing every moment of the live experience.",
      color: "#7c3aed",
      icon: "Drama",
      status: "In Development",
    },
    {
      name: "Ahoy",
      category: "Travel & Lifestyle",
      description:
        "Your digital cruise companion — making every voyage seamless and unforgettable.",
      color: "#06b6d4",
      icon: "Ship",
      status: "In Development",
    },
    {
      name: "More Coming",
      category: "Various",
      description:
        "Our pipeline is full. We're always building the next thing.",
      color: "#d4a843",
      icon: "Sparkles",
      status: "Stay Tuned",
    },
  ],

  approach: [
    {
      title: "AI-Augmented Development",
      description:
        "We leverage cutting-edge AI tools throughout our development process — from ideation to deployment. This isn't about replacing human creativity; it's about amplifying it.",
    },
    {
      title: "Modern Stack, No Compromises",
      description:
        "React Native, Next.js, TypeScript, Tailwind CSS, and cloud-native architecture. We use the tools that let us build fast without sacrificing quality.",
    },
    {
      title: "Founder-Led, Every Project",
      description:
        "No account managers, no layers of bureaucracy. You work directly with the founder and a lean, expert team that cares deeply about the outcome.",
    },
    {
      title: "Built to Last",
      description:
        "Clean architecture, comprehensive testing, and documentation that actually helps. We build products that your team can maintain and evolve.",
    },
  ],

  founder: {
    name: "Bryan Hearn",
    title: "Founder & Principal",
    bio: "With over 20 years navigating the intersection of technology and business, Bryan brings a rare breadth of experience to every project. From managing enterprise IT infrastructure in hospitality to building recruiting technology platforms, his journey has always centered on one thing: using technology to solve real problems for real people.",
    bio2: "BRYght Ideas is the culmination of that journey — a studio where deep technical knowledge meets creative vision, augmented by the latest in AI-powered development.",
    location: "Chicago, Illinois",
  },

  footer: {
    tagline: "Building the future, one bright idea at a time.",
    links: [
      { label: "Services", href: "#services" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Contact", href: "#contact" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
