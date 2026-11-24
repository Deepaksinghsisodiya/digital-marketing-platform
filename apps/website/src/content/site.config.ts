// ============================================================
//  NEXORA — SITE CONFIGURATION  (Single Source of Truth)
// ============================================================
//
//  This file holds ALL real business data for the Nexora website.
//  Every field is typed, documented, and either filled or marked
//  with TODO_REAL_VALUE.
//
//  RULES:
//  1. Replace every TODO_REAL_VALUE with actual business data.
//  2. Sections with no real data hide automatically on the site.
//  3. Run  pnpm check:content  to find unfilled fields.
//  4. NEVER invent stats, testimonials, or client names.
//
// ============================================================

// ─── Sentinel & Helpers ────────────────────────────────────

/** Marker for fields that still need real business data. */
export const TODO_REAL_VALUE = '__TODO_REAL_VALUE__' as const;
type Todo = typeof TODO_REAL_VALUE;

/** Type-safe guard: returns true only when the value is real (not a placeholder). */
export function isRealValue<T>(value: T | Todo): value is T {
  if ((value as unknown) === TODO_REAL_VALUE) return false;
  if (value === null || value === undefined || value === '') return false;
  return true;
}

/** Returns true when an array has at least one item. */
export function hasItems<T>(arr: T[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/** Use a value only when it's real; otherwise return the fallback. */
export function realOr<T>(value: T | Todo, fallback: T): T {
  return isRealValue(value) ? value : fallback;
}

// ─── Shared Types ──────────────────────────────────────────

type MaybeProvided<T> = T | Todo;

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Path relative to /public, e.g. "/images/team/jane.jpg" */
  photoPath: string;
}

export interface ServiceCard {
  title: string;
  /** URL slug, e.g. "seo" → /services/seo */
  slug: string;
  /** Lucide icon name, e.g. "Search", "BarChart3" */
  icon: string;
  /** One-line outcome-focused description for the homepage grid */
  shortDescription: string;
}

export interface ClientLogo {
  name: string;
  /** Path relative to /public, e.g. "/images/clients/logos/acme.svg" */
  logoPath: string;
  website?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  /** Headshot path relative to /public */
  photoPath?: string;
  /** 1–5 star rating */
  rating?: number;
}

export interface CaseStudyCard {
  title: string;
  slug: string;
  client: string;
  industry: string;
  service: string;
  /** One-line challenge summary */
  challenge: string;
  /** One-line result, e.g. "3× more leads in 90 days" */
  result: string;
  /** Cover image path relative to /public */
  coverImage?: string;
}

export interface Certification {
  name: string;
  /** Logo path relative to /public */
  logoPath: string;
  /** Verification / profile link */
  link?: string;
}

export interface Award {
  name: string;
  year: number;
  issuer: string;
  link?: string;
}

export interface StatCounter {
  label: string;
  value: number;
  /** Suffix shown after the number, e.g. "+", "%", "×" */
  suffix?: string;
  /** Internal note on where this number comes from */
  source?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: 'pricing' | 'process' | 'results' | 'general';
}

export interface IndustryCard {
  name: string;
  slug: string;
  /** Lucide icon name */
  icon: string;
  shortDescription: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Differentiator {
  title: string;
  description: string;
  icon: string;
}

export interface SocialLinks {
  linkedin?: MaybeProvided<string>;
  instagram?: MaybeProvided<string>;
  twitter?: MaybeProvided<string>;
  facebook?: MaybeProvided<string>;
  youtube?: MaybeProvided<string>;
  github?: MaybeProvided<string>;
}

// ─── The Config ────────────────────────────────────────────

export const siteConfig = {
  // ── Company ─────────────────────────────────────────────
  company: {
    brandName: 'Nexora',
    /** Full legal entity name, e.g. "Nexora Digital Marketing LLP" */
    legalName: TODO_REAL_VALUE as MaybeProvided<string>,
    tagline: 'Digital marketing that actually grows your business',
    description:
      'Nexora is a digital marketing agency that helps businesses get more leads, more sales, and a stronger online presence through SEO, Google & Meta ads, social media, and high-converting websites.',
    /** Year the business was founded, e.g. 2019 */
    yearFounded: TODO_REAL_VALUE as MaybeProvided<number>,
  },

  // ── Contact ─────────────────────────────────────────────
  contact: {
    /** Primary phone with country code, e.g. "+91 98765 43210" */
    phone: TODO_REAL_VALUE as MaybeProvided<string>,
    /** WhatsApp number with country code (no spaces), e.g. "+919876543210" */
    whatsapp: TODO_REAL_VALUE as MaybeProvided<string>,
    /** Business email, e.g. "hello@nexora.in" */
    email: TODO_REAL_VALUE as MaybeProvided<string>,
    address: {
      /** Street address, e.g. "123, ABC Tower, MG Road" */
      street: TODO_REAL_VALUE as MaybeProvided<string>,
      /** City, e.g. "Indore" */
      city: TODO_REAL_VALUE as MaybeProvided<string>,
      /** State, e.g. "Madhya Pradesh" */
      state: TODO_REAL_VALUE as MaybeProvided<string>,
      /** PIN / ZIP code, e.g. "452001" */
      zip: TODO_REAL_VALUE as MaybeProvided<string>,
      country: 'India',
    },
    /** Displayed on the contact page */
    workingHours: 'Mon–Fri, 10:00 AM – 7:00 PM IST',
    /** Google Maps embed URL (the iframe src attribute) */
    mapEmbedUrl: TODO_REAL_VALUE as MaybeProvided<string>,
    /** Promise shown near the contact form */
    responseTime: 'We respond within 4 hours during business hours',
  },

  // ── Founder ─────────────────────────────────────────────
  founder: {
    /** Full name, e.g. "Rahul Sharma" */
    name: TODO_REAL_VALUE as MaybeProvided<string>,
    /** Title, e.g. "Founder & CEO" */
    title: TODO_REAL_VALUE as MaybeProvided<string>,
    /**
     * Short bio for the homepage spotlight (2–3 sentences).
     * Example: "After 8 years leading digital campaigns for brands
     * across India and the US, I started Nexora with one goal:
     * help businesses grow without the BS."
     */
    shortBio: TODO_REAL_VALUE as MaybeProvided<string>,
    /** Longer bio for the about page (3–5 sentences). */
    fullBio: TODO_REAL_VALUE as MaybeProvided<string>,
    /** Portrait photo, 4:5 ratio, min 1200 × 1500 px */
    photoPath: TODO_REAL_VALUE as MaybeProvided<string>,
    socialLinks: {
      linkedin: TODO_REAL_VALUE,
      twitter: TODO_REAL_VALUE,
    } as SocialLinks,
  },

  // ── Team ────────────────────────────────────────────────
  /**
   * Real team members only. Leave empty to hide the team section.
   *
   * Example entry:
   * { name: 'Priya Patel', role: 'SEO Lead',
   *   bio: 'Priya has helped 20+ businesses rank on page 1.',
   *   photoPath: '/images/team/priya.jpg' }
   */
  team: [] as TeamMember[],

  // ── Services ────────────────────────────────────────────
  /**
   * These drive the homepage grid, the nav mega-menu, and the
   * services listing page. Full detail content lives in
   * src/content/services/<slug>.ts
   */
  services: [
    {
      title: 'SEO',
      slug: 'seo',
      icon: 'Search',
      shortDescription:
        'Get found on Google when customers search for what you sell.',
    },
    {
      title: 'Google & Meta Ads',
      slug: 'paid-ads',
      icon: 'TrendingUp',
      shortDescription:
        'Targeted ads that bring ready-to-buy customers — without wasting budget.',
    },
    {
      title: 'Social Media Marketing',
      slug: 'social-media-marketing',
      icon: 'Share2',
      shortDescription:
        'Build a following that trusts your brand and turns into customers.',
    },
    {
      title: 'Web Design & Development',
      slug: 'web-design-development',
      icon: 'Layout',
      shortDescription:
        'Fast, beautiful websites designed to turn visitors into leads.',
    },
    {
      title: 'Content Marketing',
      slug: 'content-marketing',
      icon: 'FileText',
      shortDescription:
        'Useful content that attracts your ideal customers and builds authority.',
    },
    {
      title: 'Branding & Design',
      slug: 'branding',
      icon: 'Palette',
      shortDescription:
        'A brand identity that makes you stand out and earns instant trust.',
    },
    {
      title: 'Lead Generation',
      slug: 'lead-generation',
      icon: 'Target',
      shortDescription:
        'More qualified leads in your inbox through proven funnels and pages.',
    },
    {
      title: 'Email & Marketing Automation',
      slug: 'email-marketing',
      icon: 'Mail',
      shortDescription:
        'Stay in touch with leads automatically and turn them into repeat buyers.',
    },
  ] as ServiceCard[],

  // ── Client Logos ────────────────────────────────────────
  /**
   * Real client logos only (SVG preferred, transparent PNG fallback).
   * Place files in /public/images/clients/logos/
   *
   * Example:
   * { name: 'Acme Corp', logoPath: '/images/clients/logos/acme.svg' }
   */
  clients: [] as ClientLogo[],

  // ── Testimonials ────────────────────────────────────────
  /**
   * Real testimonials with client permission only.
   * Include a headshot if possible.
   *
   * Example:
   * { quote: 'Nexora tripled our leads in 3 months.',
   *   author: 'Amit Verma', role: 'CEO',
   *   company: 'TechBuild Solutions',
   *   photoPath: '/images/testimonials/amit.jpg', rating: 5 }
   */
  testimonials: [] as Testimonial[],

  // ── Case Studies ────────────────────────────────────────
  /**
   * Brief cards for the homepage. Full case study content
   * lives in src/content/case-studies/<slug>.ts
   *
   * Example:
   * { title: 'How We Tripled Organic Traffic for a D2C Brand',
   *   slug: 'acme-seo', client: 'Acme Store',
   *   industry: 'E-Commerce', service: 'SEO',
   *   challenge: 'Low visibility and over-reliance on paid ads.',
   *   result: '3× organic traffic in 6 months',
   *   coverImage: '/images/case-studies/acme/cover.jpg' }
   */
  caseStudies: [] as CaseStudyCard[],

  // ── Certifications & Badges ─────────────────────────────
  /**
   * Real certifications only: Google Partner, Meta Business
   * Partner, HubSpot, Clutch, etc. with verification links.
   *
   * Example:
   * { name: 'Google Partner',
   *   logoPath: '/images/badges/google-partner.svg',
   *   link: 'https://www.google.com/partners/...' }
   */
  certifications: [] as Certification[],

  // ── Awards ──────────────────────────────────────────────
  awards: [] as Award[],

  // ── Stats / Counters ────────────────────────────────────
  /**
   * Real, verifiable numbers only. Each appears on the
   * homepage stats band. Hidden when empty.
   *
   * Example:
   * { label: 'Happy Clients', value: 85, suffix: '+',
   *   source: 'Internal CRM count as of Dec 2024' }
   */
  stats: [] as StatCounter[],

  // ── Social Links ────────────────────────────────────────
  /** Only include links to profiles that actually exist. */
  social: {
    linkedin: TODO_REAL_VALUE,
    instagram: TODO_REAL_VALUE,
    twitter: TODO_REAL_VALUE,
    facebook: TODO_REAL_VALUE,
    youtube: TODO_REAL_VALUE,
  } as SocialLinks,

  // ── FAQ ─────────────────────────────────────────────────
  /**
   * These appear on the homepage FAQ accordion and get
   * FAQPage JSON-LD schema markup for Google.
   */
  faq: [
    {
      question: 'How much does digital marketing cost?',
      answer:
        "It depends on your goals and what services you need. Most of our clients invest between ₹25,000–₹2,00,000 per month (or $500–$5,000 for US clients). We'll give you a clear quote after understanding your business — no hidden fees, no surprises.",
      category: 'pricing',
    },
    {
      question: 'How long does it take to see results?',
      answer:
        'Paid ads (Google/Meta) can start bringing leads within 1–2 weeks. SEO typically takes 3–6 months to show strong results. Social media growth is gradual but compounds over time. We set clear timelines upfront so you know exactly what to expect.',
      category: 'results',
    },
    {
      question: 'Do I need to sign a long-term contract?',
      answer:
        'No. We offer flexible month-to-month agreements. We believe in earning your business every month, not locking you in. That said, digital marketing works best with consistency, so we recommend at least a 3-month commitment to see meaningful results.',
      category: 'pricing',
    },
    {
      question: "What reporting do I get? How will I know it's working?",
      answer:
        "You get a clear monthly report showing exactly what we did, what results we got, and what's planned next. We track real business metrics — leads, calls, sales — not just vanity numbers like impressions. You also get a live dashboard you can check anytime.",
      category: 'process',
    },
    {
      question: 'How much should I budget for Google/Meta ad spend?',
      answer:
        "Your ad budget is separate from our management fee. For most small-to-medium businesses, we recommend starting with ₹30,000–₹1,00,000/month (or $500–$3,000) for ad spend. We'll help you figure out the right budget based on your goals and industry.",
      category: 'pricing',
    },
    {
      question: 'What industries do you work with?',
      answer:
        "We work with businesses across many industries — real estate, healthcare, e-commerce, education, SaaS, hospitality, professional services, and more. What matters most is that you're serious about growing your business online.",
      category: 'general',
    },
    {
      question: 'How do I get started?',
      answer:
        "Simple — book a free strategy call. We'll learn about your business, discuss your goals, and tell you honestly what we can do for you. No hard sell, no jargon, just a straight conversation about growing your business.",
      category: 'process',
    },
    {
      question: 'What makes Nexora different from other agencies?',
      answer:
        "We focus on results, not reports full of fluff. Every rupee you spend is tracked to actual leads and sales. We speak plain language (no confusing jargon), we're transparent about what's working and what's not, and we treat your budget like it's our own.",
      category: 'general',
    },
  ] as FaqItem[],

  // ── Industries ──────────────────────────────────────────
  /**
   * Industries you actively serve. Only industries listed
   * here will get a page. Remove any you don't work in.
   */
  industries: [
    {
      name: 'Real Estate',
      slug: 'real-estate',
      icon: 'Home',
      shortDescription:
        'More qualified property inquiries from serious buyers and investors.',
    },
    {
      name: 'Healthcare',
      slug: 'healthcare',
      icon: 'Stethoscope',
      shortDescription:
        'Attract more patients while staying compliant with regulations.',
    },
    {
      name: 'E-Commerce & Retail',
      slug: 'ecommerce',
      icon: 'ShoppingCart',
      shortDescription:
        'More orders, higher cart value, and customers who keep coming back.',
    },
    {
      name: 'Education & EdTech',
      slug: 'education',
      icon: 'GraduationCap',
      shortDescription:
        'Fill seats and enrollment with campaigns that reach students and parents.',
    },
    {
      name: 'SaaS & Technology',
      slug: 'saas',
      icon: 'Cpu',
      shortDescription:
        'More demo requests and trial signups from your ideal customers.',
    },
    {
      name: 'Hospitality & Restaurants',
      slug: 'hospitality',
      icon: 'Hotel',
      shortDescription:
        'More direct bookings and local search visibility.',
    },
    {
      name: 'Professional Services',
      slug: 'professional-services',
      icon: 'Briefcase',
      shortDescription:
        'Position yourself as the go-to expert and generate quality leads.',
    },
    {
      name: 'Manufacturing & Industrial',
      slug: 'manufacturing',
      icon: 'Building2',
      shortDescription:
        'Reach distributors and B2B buyers with digital marketing that works.',
    },
  ] as IndustryCard[],

  // ── Office Photos ───────────────────────────────────────
  /**
   * Real office / workspace photos (16:9 ratio recommended).
   * Place files in /public/images/office/
   *
   * Example: ['/images/office/workspace.jpg', '/images/office/team.jpg']
   */
  officePhotos: [] as string[],

  // ── How We Work (Homepage process section) ──────────────
  process: [
    {
      step: 1,
      title: 'Free Strategy Call',
      description:
        'We learn about your business, goals, and challenges. No sales pitch — just an honest conversation.',
      icon: 'Phone',
    },
    {
      step: 2,
      title: 'Audit & Custom Plan',
      description:
        'We audit your current marketing, find the gaps, and build a clear action plan tailored to you.',
      icon: 'ClipboardCheck',
    },
    {
      step: 3,
      title: 'Launch & Execute',
      description:
        'We get to work — running campaigns, optimizing your site, creating content, and driving real traffic.',
      icon: 'Rocket',
    },
    {
      step: 4,
      title: 'Report & Scale',
      description:
        'You see clear monthly reports with real results. We double down on what works and scale your growth.',
      icon: 'BarChart3',
    },
  ] as ProcessStep[],

  // ── Why Nexora (Homepage differentiators) ───────────────
  differentiators: [
    {
      title: 'Results you can measure',
      description:
        'Every campaign ties back to real business outcomes — leads, calls, and sales. Not just impressions and clicks.',
      icon: 'Target',
    },
    {
      title: 'No jargon, no BS',
      description:
        "We explain everything in plain language. You'll always know what we're doing and why it matters.",
      icon: 'MessageCircle',
    },
    {
      title: 'Your budget, respected',
      description:
        'We treat your marketing budget like our own money. No wasted spend, no unnecessary upsells.',
      icon: 'ShieldCheck',
    },
    {
      title: 'A real team, not a faceless agency',
      description:
        'You get a dedicated team who knows your business inside-out. Direct access, quick responses.',
      icon: 'Users',
    },
  ] as Differentiator[],

  // ── SEO Defaults ────────────────────────────────────────
  seo: {
    defaultTitle:
      'Nexora — Digital Marketing Agency | SEO, Ads & Web Design',
    defaultDescription:
      'Nexora helps businesses grow with SEO, Google & Meta ads, social media, and high-converting websites. Real results, no fluff.',
    /** Default OG image path (1200 × 630 px) */
    ogImage: '/images/og/default.jpg',
    /** Twitter handle, e.g. "@nexora_in" */
    twitterHandle: TODO_REAL_VALUE as MaybeProvided<string>,
  },

  // ── Analytics (env-var driven, off by default) ──────────
  analytics: {
    /** Set via NEXT_PUBLIC_GA4_ID in .env */
    ga4MeasurementId: '',
    /** Set via NEXT_PUBLIC_META_PIXEL_ID in .env */
    metaPixelId: '',
  },
};

// ─── Type Export ────────────────────────────────────────────
export type SiteConfig = typeof siteConfig;
