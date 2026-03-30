// =============================================================================
// JeevanChain Site Configuration
// Blockchain-powered public records platform
// =============================================================================

// -- Site-wide settings -------------------------------------------------------
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "JeevanChain - Blockchain Public Records",
  description: "Revolutionizing public records with blockchain technology. Secure, transparent, and tamper-proof record management for citizens, hospitals, and civil registry.",
  language: "en",
};

// -- Hero Section -------------------------------------------------------------
export interface HeroNavItem {
  label: string;
  sectionId: string;
  icon: "disc" | "play" | "calendar" | "music" | "shield" | "users" | "network";
}

export interface HeroConfig {
  backgroundImage: string;
  brandName: string;
  decodeText: string;
  decodeChars: string;
  subtitle: string;
  ctaPrimary: string;
  ctaPrimaryTarget: string;
  ctaSecondary: string;
  ctaSecondaryTarget: string;
  cornerLabel: string;
  cornerDetail: string;
  navItems: HeroNavItem[];
}

export const heroConfig: HeroConfig = {
  backgroundImage: "/hero-city-data.jpg",
  brandName: "JeevanChain",
  decodeText: "PUBLIC RECORDS",
  decodeChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
  subtitle: "IMMUTABLE PROOF",
  ctaPrimary: "Request Demo",
  ctaPrimaryTarget: "dashboard",
  ctaSecondary: "Explore Platform",
  ctaSecondaryTarget: "features",
  cornerLabel: "BLOCKCHAIN-POWERED",
  cornerDetail: "v2.4.0",
  navItems: [
    { label: "Platform", sectionId: "dashboard", icon: "disc" },
    { label: "Features", sectionId: "features", icon: "play" },
    { label: "Security", sectionId: "security", icon: "shield" },
    { label: "Network", sectionId: "network", icon: "network" },
  ],
};

// -- Blockchain Cube Section (3D Visualization) -------------------------------
export interface BlockchainFeature {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

export interface BlockchainCubeConfig {
  features: BlockchainFeature[];
  cubeTextures: string[];
  scrollHint: string;
}

export const blockchainCubeConfig: BlockchainCubeConfig = {
  features: [
    { id: 1, title: "Tamper-Proof", subtitle: "IMMUTABLE", image: "/cube-1.jpg" },
    { id: 2, title: "Decentralized", subtitle: "DISTRIBUTED", image: "/cube-2.jpg" },
    { id: 3, title: "Encrypted", subtitle: "SECURE", image: "/cube-3.jpg" },
    { id: 4, title: "Transparent", subtitle: "VERIFIED", image: "/cube-4.jpg" },
  ],
  cubeTextures: [
    "/cube-1.jpg",
    "/cube-2.jpg",
    "/cube-3.jpg",
    "/cube-4.jpg",
    "/cube-5.jpg",
    "/cube-6.jpg",
  ],
  scrollHint: "Scroll to explore",
};

// -- Dashboard Preview Section ------------------------------------------------
export interface DashboardConfig {
  sectionLabel: string;
  sectionTitle: string;
  body: string;
  cta: string;
  ctaTarget: string;
  dashboardImage: string;
  stats: {
    label: string;
    value: string;
  }[];
}

export const dashboardConfig: DashboardConfig = {
  sectionLabel: "PLATFORM OVERVIEW",
  sectionTitle: "One dashboard. Total visibility.",
  body: "Monitor records, verify updates, and manage permissions in real time—with an interface designed for clarity.",
  cta: "View live demo",
  ctaTarget: "features",
  dashboardImage: "/dashboard-ui.jpg",
  stats: [
    { label: "Total Records", value: "2.4M" },
    { label: "Verified Today", value: "1,248" },
    { label: "Active Nodes", value: "182" },
  ],
};

// -- Features Section ---------------------------------------------------------
export interface FeatureCard {
  id: number;
  title: string;
  body: string;
  image: string;
}

export interface FeaturesConfig {
  sectionLabel: string;
  sectionTitle: string;
  cards: FeatureCard[];
}

export const featuresConfig: FeaturesConfig = {
  sectionLabel: "CAPABILITIES",
  sectionTitle: "Built for scale. Designed for people.",
  cards: [
    {
      id: 1,
      title: "Citizen Portal",
      body: "Access your records, track updates, and share verified proofs with institutions—in seconds.",
      image: "/citizen-portal.jpg",
    },
    {
      id: 2,
      title: "Hospital Integration",
      body: "Submit and verify records with cryptographic timestamps—no paperwork, no doubt.",
      image: "/hospital-tech.jpg",
    },
    {
      id: 3,
      title: "Civil Registry Sync",
      body: "Maintain an authoritative ledger that stays consistent across departments and time.",
      image: "/admin-office.jpg",
    },
  ],
};

// -- How It Works Section -----------------------------------------------------
export interface Step {
  id: number;
  title: string;
  body: string;
}

export interface HowItWorksConfig {
  sectionLabel: string;
  sectionTitle: string;
  steps: Step[];
}

export const howItWorksConfig: HowItWorksConfig = {
  sectionLabel: "HOW IT WORKS",
  sectionTitle: "Three steps. Lifetime trust.",
  steps: [
    {
      id: 1,
      title: "Register",
      body: "Create your identity once. Cryptographic keys keep it yours.",
    },
    {
      id: 2,
      title: "Record",
      body: "Every entry is hashed, signed, and stored across the network.",
    },
    {
      id: 3,
      title: "Verify",
      body: "Anyone with permission can verify instantly—no middlemen.",
    },
  ],
};

// -- Role-Based Access Section ------------------------------------------------
export interface RoleCard {
  id: number;
  title: string;
  bullets: string[];
  image: string;
}

export interface RoleAccessConfig {
  sectionLabel: string;
  sectionTitle: string;
  cards: RoleCard[];
}

export const roleAccessConfig: RoleAccessConfig = {
  sectionLabel: "ROLE-BASED ACCESS",
  sectionTitle: "The right data. The right hands.",
  cards: [
    {
      id: 1,
      title: "Citizen",
      bullets: ["View records", "Share proofs", "Control consent"],
      image: "/role-citizen.jpg",
    },
    {
      id: 2,
      title: "Hospital",
      bullets: ["Submit updates", "Verify history", "Audit trail"],
      image: "/role-hospital.jpg",
    },
    {
      id: 3,
      title: "Admin",
      bullets: ["Manage permissions", "Monitor integrity", "Compliance reports"],
      image: "/role-admin.jpg",
    },
  ],
};

// -- Trust & Security Section -------------------------------------------------
export interface SecurityConfig {
  sectionLabel: string;
  sectionTitle: string;
  body: string;
  backgroundImage: string;
  proofPoints: {
    title: string;
    description: string;
  }[];
}

export const securityConfig: SecurityConfig = {
  sectionLabel: "SECURITY",
  sectionTitle: "Tamper-proof by design.",
  body: "Cryptographic hashing, distributed consensus, and immutable logs mean once a record is written—it stays true.",
  backgroundImage: "/security-vault.jpg",
  proofPoints: [
    { title: "256-bit", description: "Encryption" },
    { title: "Immutable", description: "Audit trail" },
    { title: "Compliance", description: "Ready" },
  ],
};

// -- Live Network Section -----------------------------------------------------
export interface NetworkConfig {
  sectionLabel: string;
  sectionTitle: string;
  body: string;
  backgroundImage: string;
  stats: {
    value: string;
    label: string;
  }[];
}

export const networkConfig: NetworkConfig = {
  sectionLabel: "NETWORK",
  sectionTitle: "Always on. Always verifiable.",
  body: "Nodes across regions keep the ledger online, synchronized, and resilient—24/7.",
  backgroundImage: "/network-city.jpg",
  stats: [
    { value: "182", label: "Active nodes" },
    { value: "< 1.2s", label: "Avg verification" },
    { value: "99.99%", label: "Uptime" },
  ],
};

// -- CTA Section --------------------------------------------------------------
export interface CTAConfig {
  headline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  backgroundImage: string;
}

export const ctaConfig: CTAConfig = {
  headline: "Ready to modernize public records?",
  body: "Get a demo and see how JeevanChain brings trust to your data.",
  ctaPrimary: "Request demo",
  ctaSecondary: "Contact sales",
  backgroundImage: "/cta-city.jpg",
};

// -- Footer Section -----------------------------------------------------------
export interface SocialLink {
  icon: "twitter" | "linkedin" | "github" | "instagram";
  label: string;
  href: string;
}

export interface FooterConfig {
  tagline: string;
  email: string;
  quickLinks: string[];
  socialLinks: SocialLink[];
  copyright: string;
}

export const footerConfig: FooterConfig = {
  tagline: "Public records. Immutable proof.",
  email: "hello@jeevanchain.io",
  quickLinks: ["Platform", "Solutions", "Security", "Privacy", "Terms"],
  socialLinks: [
    { icon: "twitter", label: "Twitter", href: "#" },
    { icon: "linkedin", label: "LinkedIn", href: "#" },
    { icon: "github", label: "GitHub", href: "#" },
  ],
  copyright: "© 2026 JeevanChain. All rights reserved.",
};
