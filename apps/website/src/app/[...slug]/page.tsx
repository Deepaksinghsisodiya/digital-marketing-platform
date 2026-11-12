import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "../../config/region";
import {
  getPublicPage,
  getPublicSiteSettings,
  getPublicMenu,
  type CmsBlock,
  type PublicPageDetail,
} from "../../lib/cms";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { BlockRenderer } from "../../components/blocks/BlockRenderer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Comprehensive catalog of fallback pages ensuring zero 404s across all marketing capabilities
const FALLBACK_PAGES: Record<
  string,
  { title: string; metaDescription: string; blocks: CmsBlock[] }
> = {
  solutions: {
    title: "Enterprise Solutions & Services — Nexora",
    metaDescription:
      "Comprehensive B2B performance marketing, high-intent SEO, and deterministic attribution.",
    blocks: [
      {
        id: "fb_sol_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Enterprise Marketing Infrastructure",
          subheadline:
            "Accelerate pipeline velocity, dominate high-intent search, and eliminate attribution blindspots with Nexora Engine.",
          primaryCtaText: "Request Solutions Diagnostic",
          primaryCtaLink: "/contact",
          secondaryCtaText: "Explore Insights",
          secondaryCtaLink: "/blog",
        },
      },
      {
        id: "fb_sol_stats",
        type: "Stats",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          metrics: [
            { value: "340%", label: "Pipeline Velocity Increase" },
            { value: "$120M+", label: "Influenced Pipeline" },
            { value: "99.8%", label: "Attribution Precision" },
          ],
        },
      },
      {
        id: "fb_sol_features",
        type: "FeatureGrid",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Full-Funnel Enterprise Capabilities",
          sectionSubtitle:
            "Engineered for high-performing marketing teams requiring scale, security, and predictability.",
          features: [
            {
              title: "High-Intent Performance SEO",
              description:
                "Dominate commercial search terms with programmatic content and technical architecture.",
            },
            {
              title: "Deterministic Revenue Attribution",
              description:
                "Multi-touch server-side tracking mapping ad spend directly to closed institutional contracts.",
            },
            {
              title: "Conversion Rate Optimization (CRO)",
              description:
                "High-velocity experimentation frameworks turning traffic into validated SQL opportunities.",
            },
          ],
        },
      },
    ],
  },
  "case-studies": {
    title: "Enterprise Client Case Studies — Nexora",
    metaDescription:
      "Verifiable outcomes and enterprise attribution studies across B2B SaaS, E-Commerce, and Healthcare.",
    blocks: [
      {
        id: "fb_cs_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Verifiable Enterprise Growth Case Studies",
          subheadline:
            "Explore how category leaders scaled pipeline velocity and eliminated CAC waste with deterministic performance marketing.",
          primaryCtaText: "Request Diagnostic",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_cs_stats",
        type: "Stats",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          metrics: [
            { value: "410%", label: "Qualified Pipeline Lift" },
            { value: "-42%", label: "Blended CAC Reduction" },
            { value: "14 Days", label: "Average Setup Speed" },
          ],
        },
      },
    ],
  },
  pricing: {
    title: "Transparent Enterprise Pricing — Nexora",
    metaDescription:
      "Predictable, scalable digital marketing pricing tiers for high-performing enterprise marketing teams.",
    blocks: [
      {
        id: "fb_pricing_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Transparent, Performance-Driven Investment",
          subheadline:
            "Scalable retainers with deterministic ROI guarantees, transparent scope, and zero hidden platform fees.",
          primaryCtaText: "Book Discovery Call",
          primaryCtaLink: "/book-a-call",
        },
      },
      {
        id: "fb_pricing_block",
        type: "Pricing",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Growth Packages Designed for Speed",
          sectionSubtitle:
            "Select the engagement tier that aligns with your revenue targets.",
        },
      },
      {
        id: "fb_pricing_compare",
        type: "ComparisonTable",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Feature & Deliverables Matrix",
          sectionSubtitle:
            "Comprehensive side-by-side comparison across tiers.",
        },
      },
    ],
  },
  about: {
    title: "About Us & Institutional Leadership — Nexora",
    metaDescription:
      "Learn about Nexora's mission to transform digital marketing into an engineering-grade growth discipline.",
    blocks: [
      {
        id: "fb_about_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Engineering Digital Growth at Global Scale",
          subheadline:
            "Nexora was founded by marketing technologists and performance engineers dedicated to replacing vanity metrics with deterministic attribution.",
          primaryCtaText: "Explore Opportunities",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_about_process",
        type: "ProcessSteps",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Our Institutional Operating Model",
          sectionSubtitle:
            "How we deliver consistent 10x ROI across quarterly marketing sprints.",
        },
      },
    ],
  },
  privacy: {
    title: "Privacy Policy & Data Protection — Nexora",
    metaDescription:
      "Our commitments to data protection, compliance (DPDP Act, GDPR, CCPA), and customer privacy.",
    blocks: [
      {
        id: "fb_priv_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Privacy Policy & Data Protection",
          subheadline:
            "Sample policy — legal review required. Version 2.0 (Updated 2026). Clear disclosure of how we collect, store, and process business data.",
          primaryCtaText: "Contact Privacy Officer",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_priv_text",
        type: "RichText",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          html: `
            <div class="prose prose-invert max-w-4xl mx-auto py-12 text-slate-300">
              <h3>1. Commitment to Enterprise Privacy</h3>
              <p>Nexora Technologies Inc. ("Nexora", "we", "us") respects the privacy and integrity of all client and visitor data. We design our multi-region marketing infrastructure to adhere to regional data governance frameworks, including the Digital Personal Data Protection Act (DPDP Act India), General Data Protection Regulation (GDPR Europe), and California Consumer Privacy Act (CCPA).</p>
              <h3>2. Data Collection and Usage</h3>
              <p>We collect business contact information (name, business email, phone number, company name) strictly when voluntarily provided via diagnostic forms, appointment bookings, or newsletter subscriptions. We do not sell or lease client data to third-party brokers.</p>
              <h3>3. Cookies and Attribution</h3>
              <p>Our website utilizes strictly necessary cookies for security, session state, and CSRF token defense. Optional analytical and attribution cookies are only deployed following affirmative user consent via our cookie preferences manager.</p>
              <h3>4. Contact and Inquiries</h3>
              <p>For data subject access requests (DSAR) or privacy inquiries, contact our Data Protection Officer at privacy@nexora.digital.</p>
            </div>
          `,
        },
      },
    ],
  },
  terms: {
    title: "Terms of Service — Nexora",
    metaDescription:
      "Contractual terms and operational agreements governing access to Nexora platforms and services.",
    blocks: [
      {
        id: "fb_terms_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Terms of Service",
          subheadline:
            "Sample terms — legal review required. Standards of engagement, intellectual property, and service level commitments.",
          primaryCtaText: "Contact Support",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_terms_text",
        type: "RichText",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          html: `
            <div class="prose prose-invert max-w-4xl mx-auto py-12 text-slate-300">
              <h3>1. Agreement to Terms</h3>
              <p>By accessing or utilizing Nexora websites, applications, and performance marketing infrastructure, you agree to be bound by these Terms of Service.</p>
              <h3>2. Intellectual Property Rights</h3>
              <p>All software architectures, proprietary algorithms, design tokens, and attribution frameworks remain the exclusive intellectual property of Nexora Technologies Inc. Customized client deliverables are granted under the terms of executed client master services agreements (MSA).</p>
              <h3>3. Limitation of Liability</h3>
              <p>Services are provided with institutional care and professional skill. Sample metrics, simulated calculators, and diagnostic projections represent illustrative modeling and do not constitute guaranteed contractual outcomes.</p>
            </div>
          `,
        },
      },
    ],
  },
  cookies: {
    title: "Cookie Policy & Transparency — Nexora",
    metaDescription:
      "Comprehensive disclosure of essential, analytical, and marketing cookies utilized across the platform.",
    blocks: [
      {
        id: "fb_cookies_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Cookie Policy & Transparency",
          subheadline:
            "Sample policy — legal review required. Transparent categorization of tracking technologies and browser storage.",
          primaryCtaText: "Manage Cookie Preferences",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_cookies_text",
        type: "RichText",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          html: `
            <div class="prose prose-invert max-w-4xl mx-auto py-12 text-slate-300">
              <h3>What Are Cookies</h3>
              <p>Cookies are small text identifiers placed on your browser by websites you visit. They ensure secure authentication, session consistency, and localized currency presentation.</p>
              <h3>Categories We Deploy</h3>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for CSRF protection, secure cookie auth, and region identification. Cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us measure aggregate conversion rates, scroll depths, and site velocity.</li>
                <li><strong>Marketing Cookies:</strong> Provide deterministic attribution linking ad impressions to pipeline ROI.</li>
              </ul>
              <p>You can adjust your preferences at any time using the "Cookie Preferences" link in the website footer.</p>
            </div>
          `,
        },
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement (WCAG AA) — Nexora",
    metaDescription:
      "Nexora's commitment to digital inclusion and WCAG 2.1 Level AA conformance.",
    blocks: [
      {
        id: "fb_a11y_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Accessibility Statement",
          subheadline:
            "Committed to digital inclusion, keyboard navigability, and Section 508 / WCAG 2.1 Level AA conformance.",
          primaryCtaText: "Report an A11y Issue",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_a11y_text",
        type: "RichText",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          html: `
            <div class="prose prose-invert max-w-4xl mx-auto py-12 text-slate-300">
              <h3>Our Standard</h3>
              <p>Nexora is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards (WCAG 2.1 Level AA).</p>
              <h3>Key Accessibility Features</h3>
              <ul>
                <li>High contrast color tokens exceeding the 4.5:1 ratio for normal text.</li>
                <li>Full keyboard navigation across all interactive elements (buttons, dialogs, drawers, accordions).</li>
                <li>Automated respect for <code>prefers-reduced-motion</code> reducing all CSS transitions and animated loops.</li>
                <li>Accessible ARIA landmark regions, alt descriptions for visual media, and clear form field labeling.</li>
              </ul>
            </div>
          `,
        },
      },
    ],
  },
  trust: {
    title: "Trust, Security & Institutional Compliance — Nexora",
    metaDescription:
      "SOC 2 Type II controls, AES-256 data protection, and immutable audit logging.",
    blocks: [
      {
        id: "fb_trust_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Enterprise Trust & Security Infrastructure",
          subheadline:
            "Sample content. Institutional data safeguards, role-based access control, and zero-trust perimeter defense.",
          primaryCtaText: "Request Security Whitepaper",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_trust_features",
        type: "FeatureGrid",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Security Engineered Into Every Layer",
          sectionSubtitle:
            "We treat marketing data with the same cryptographic rigor as financial records.",
          features: [
            {
              title: "AES-256 Encryption",
              description:
                "All database backups, outbox payloads, and credential tokens are encrypted at rest.",
            },
            {
              title: "RBAC & Last-Owner Guard",
              description:
                "Strict role matrices with immutable audit trails recording all admin actions.",
            },
            {
              title: "SSRF & Domain Shield",
              description:
                "Outbound webhooks rigorously validate DNS IP targets against private CIDR blocks.",
            },
          ],
        },
      },
    ],
  },
  "book-a-call": {
    title: "Schedule Discovery Consultation — Nexora",
    metaDescription:
      "Reserve an institutional discovery session with Nexora's performance marketing strategists.",
    blocks: [
      {
        id: "fb_book_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Schedule Your Executive Growth Diagnostic",
          subheadline:
            "Direct 30-minute consultation with our senior digital marketing architects. We review your current funnel, attribution gaps, and pipeline roadmap.",
          primaryCtaText: "Fill Intake Form",
          primaryCtaLink: "/contact",
        },
      },
      {
        id: "fb_book_embed",
        type: "BookingEmbed",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Reserve Meeting Slot",
          subheadline: "Select a convenient time for your team.",
          url: "https://cal.com/nexora-digital/growth-strategy",
        },
      },
    ],
  },
  resources: {
    title: "Knowledge Hub & Performance Playbooks — Nexora",
    metaDescription:
      "Authoritative marketing research, conversion rate playbooks, and attribution models.",
    blocks: [
      {
        id: "fb_res_hero",
        type: "Hero",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          headline: "Enterprise Performance Playbooks",
          subheadline:
            "Proven frameworks, ROI formulas, and strategic research papers curated by Nexora growth engineers.",
          primaryCtaText: "Browse Insights",
          primaryCtaLink: "/blog",
        },
      },
      {
        id: "fb_res_roi",
        type: "RoiCalculator",
        schemaVersion: 1,
        enabled: true,
        settings: {},
        content: {
          sectionTitle: "Interactive Growth & Pipeline Simulator",
          sectionSubtitle:
            "Model your pipeline revenue potential based on realistic conversion multipliers.",
        },
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  let cmsPage = await getPublicPage(slugPath, region.code);

  if (!cmsPage && FALLBACK_PAGES[slugPath.toLowerCase()]) {
    const fb = FALLBACK_PAGES[slugPath.toLowerCase()]!;
    return {
      title: fb.title,
      description: fb.metaDescription,
    };
  }

  // Format nice generic title for services and industries if not explicitly caught
  if (!cmsPage && slugPath.startsWith("services/")) {
    const serviceName = slugPath
      .split("/")[1]
      ?.replace(/-/g, " ")
      .toUpperCase();
    return {
      title: `${serviceName} Services — Nexora`,
      description: `Institutional digital marketing and execution for ${serviceName}.`,
    };
  }

  if (!cmsPage && slugPath.startsWith("industries/")) {
    const industryName = slugPath
      .split("/")[1]
      ?.replace(/-/g, " ")
      .toUpperCase();
    return {
      title: `${industryName} Marketing Architecture — Nexora`,
      description: `High-velocity growth strategies tailored for ${industryName}.`,
    };
  }

  if (!cmsPage) {
    return {
      title: "Page Not Found — Nexora",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: cmsPage.metaTitle || `${cmsPage.title} — Nexora`,
    description: cmsPage.metaDescription || undefined,
    alternates: {
      canonical: cmsPage.canonicalUrl || undefined,
    },
    robots: cmsPage.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  const [cmsPageRaw, siteSettings, headerMenu] = await Promise.all([
    getPublicPage(slugPath, region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  let cmsPage: PublicPageDetail | null = cmsPageRaw;

  // 1. Direct structured fallback
  if (!cmsPage && FALLBACK_PAGES[slugPath.toLowerCase()]) {
    const fb = FALLBACK_PAGES[slugPath.toLowerCase()]!;
    cmsPage = {
      id: `fallback-${slugPath}`,
      slug: slugPath,
      locale: region.code,
      title: fb.title,
      blocks: fb.blocks,
      metaTitle: fb.title,
      metaDescription: fb.metaDescription,
      canonicalUrl: `/${slugPath}`,
      noIndex: false,
      versionNumber: 1,
      publishedAtUtc: new Date().toISOString(),
    };
  }

  // 2. Dynamic auto-fallback for any /services/[service]
  if (!cmsPage && slugPath.startsWith("services/")) {
    const serviceName =
      slugPath
        .split("/")[1]
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Digital Marketing";
    cmsPage = {
      id: `fallback-service-${slugPath}`,
      slug: slugPath,
      locale: region.code,
      title: `${serviceName} — Nexora Digital Marketing`,
      metaTitle: `${serviceName} — Nexora`,
      metaDescription: `Enterprise-grade ${serviceName} solutions designed for deterministic pipeline growth.`,
      canonicalUrl: `/${slugPath}`,
      noIndex: false,
      versionNumber: 1,
      publishedAtUtc: new Date().toISOString(),
      blocks: [
        {
          id: `hero_${slugPath}`,
          type: "Hero",
          schemaVersion: 1,
          enabled: true,
          settings: {},
          content: {
            headline: serviceName,
            subheadline: `Sample content — customize in Admin CMS. High-velocity ${serviceName} architecture engineered for enterprise revenue and predictable acquisition.`,
            primaryCtaText: "Schedule Strategic Consultation",
            primaryCtaLink: "/contact",
            secondaryCtaText: "Explore ROI Calculator",
            secondaryCtaLink: "/tools/roi-calculator",
          },
        },
        {
          id: `process_${slugPath}`,
          type: "ProcessSteps",
          schemaVersion: 1,
          enabled: true,
          settings: {},
          content: {
            sectionTitle: `Our ${serviceName} Methodology`,
            sectionSubtitle:
              "A proven four-stage execution roadmap designed to maximize customer acquisition efficiency.",
          },
        },
        {
          id: `cta_${slugPath}`,
          type: "CTA",
          schemaVersion: 1,
          enabled: true,
          settings: {},
          content: {
            headline: `Ready to Deploy Enterprise ${serviceName}?`,
            buttonText: "Request Diagnostic Session",
            buttonLink: "/contact",
          },
        },
      ],
    };
  }

  // 3. Dynamic auto-fallback for any /industries/[industry]
  if (!cmsPage && slugPath.startsWith("industries/")) {
    const industryName =
      slugPath
        .split("/")[1]
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Enterprise Vertical";
    cmsPage = {
      id: `fallback-ind-${slugPath}`,
      slug: slugPath,
      locale: region.code,
      title: `${industryName} Marketing Solutions — Nexora`,
      metaTitle: `${industryName} Solutions — Nexora`,
      metaDescription: `Customized digital marketing funnels and attribution modeling engineered for ${industryName}.`,
      canonicalUrl: `/${slugPath}`,
      noIndex: false,
      versionNumber: 1,
      publishedAtUtc: new Date().toISOString(),
      blocks: [
        {
          id: `hero_${slugPath}`,
          type: "Hero",
          schemaVersion: 1,
          enabled: true,
          settings: {},
          content: {
            headline: `${industryName} Growth Engine`,
            subheadline: `Sample content — customize in Admin CMS. Tailored audience segmentation, regulatory compliance, and multi-channel attribution for ${industryName}.`,
            primaryCtaText: "Discuss Vertical Strategy",
            primaryCtaLink: "/contact",
          },
        },
        {
          id: `cta_${slugPath}`,
          type: "CTA",
          schemaVersion: 1,
          enabled: true,
          settings: {},
          content: {
            headline: `Scale Your ${industryName} Market Share`,
            buttonText: "Connect with Industry Lead",
            buttonLink: "/contact",
          },
        },
      ],
    };
  }

  if (!cmsPage) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1">
        <BlockRenderer blocks={cmsPage.blocks} userRegion={region.code} />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
