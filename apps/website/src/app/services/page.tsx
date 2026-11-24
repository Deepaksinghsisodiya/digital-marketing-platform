import Link from "next/link";
import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu, getPublicPage } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServicesCatalogView, type PillarData, type ServiceCardData } from "@/components/services/ServicesCatalogView";
import { Reveal } from "@/components/motion/Reveal";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const region = resolveRegion();
  const cmsPage = await getPublicPage("services", region.code);

  if (cmsPage) {
    return {
      title:
        cmsPage.metaTitle ||
        cmsPage.title ||
        "Digital Growth & Technology Services — Nexora",
      description:
        cmsPage.metaDescription ||
        "Explore our integrated capabilities: Digital Growth, Technology Solutions, and AI & Automation, engineered for high-performance enterprises.",
      alternates: {
        canonical: cmsPage.canonicalUrl || undefined,
      },
      robots: cmsPage.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  }

  return {
    title: "Digital Growth & Technology Services — Nexora",
    description:
      "Explore our three integrated capabilities: Digital Growth, Technology Solutions, and AI & Automation, engineered for high-performance enterprises across India and the US.",
  };
}

const DEFAULT_PILLARS: PillarData[] = [
  {
    name: "Digital Growth",
    badge: "Pillar 1",
    desc: "Data-driven customer acquisition programs designed to turn commercial search intent and targeted advertising into predictable, compounded pipeline.",
    services: [
      {
        title: "Search Engine Optimization (SEO)",
        slug: "seo",
        link: "/services/seo",
        pillar: "Digital Growth",
        desc: "Dominate commercial keyword clusters, optimize technical Core Web Vitals, and scale programmatic content engines.",
        highlights: [
          "Technical crawl budget audits",
          "Programmatic search architecture",
          "High-intent commercial keyword domination",
        ],
      },
      {
        title: "Performance Paid Media (Google & Meta)",
        slug: "paid-ads",
        link: "/services/paid-ads",
        pillar: "Digital Growth",
        desc: "Algorithmic bid orchestration, hyper-targeted account-based retargeting, and negative matching saving up to 40% in ad waste.",
        highlights: [
          "First-party audience sync",
          "Automated negative matching",
          "Multi-touch server tracking",
        ],
      },
      {
        title: "Conversion Rate Optimization (CRO)",
        slug: "cro",
        link: "/services/cro",
        pillar: "Digital Growth",
        desc: "Continuous multivariate A/B testing, scroll heatmapping, and frictionless lead form architectures that increase conversion velocity.",
        highlights: [
          "Multivariate form optimization",
          "Heatmap & drop-off audits",
          "Frictionless multi-step intake",
        ],
      },
      {
        title: "Content Marketing & Thought Leadership",
        slug: "content-marketing",
        link: "/services/content-marketing",
        pillar: "Digital Growth",
        desc: "Authoritative editorial strategy and search-led content that establishes industry leadership and captures buyer intent.",
        highlights: [
          "Executive ghostwriting",
          "In-depth research whitepapers",
          "Buyer journey content funnels",
        ],
      },
      {
        title: "Social Media & Executive Amplification",
        slug: "social-media-marketing",
        link: "/services/social-media-marketing",
        pillar: "Digital Growth",
        desc: "LinkedIn thought leadership programs, audience amplification, and authentic multi-channel community growth.",
        highlights: [
          "LinkedIn executive branding",
          "B2B social community building",
          "Organic engagement scaling",
        ],
      },
      {
        title: "Deterministic Attribution & Analytics",
        slug: "analytics-reporting",
        link: "/services/analytics-reporting",
        pillar: "Digital Growth",
        desc: "Server-side tracking eliminating third-party cookie loss, linking ad impressions directly to closed enterprise revenue.",
        highlights: [
          "Server-side Meta/Google CAPI",
          "Deterministic revenue attribution",
          "Custom Looker/BI dashboards",
        ],
      },
    ],
  },
  {
    name: "Web & Conversion Experiences",
    badge: "Pillar 2",
    desc: "Fast-loading, mobile-optimized business websites, landing pages, and storefronts engineered to turn casual visitors into paying customers.",
    services: [
      {
        title: "High-Converting Business Websites",
        slug: "web-design-development",
        link: "/services/web-design-development",
        pillar: "Web & Conversion Experiences",
        desc: "Lightning-fast business websites designed to establish immediate market authority and convert visitor traffic into high-value sales inquiries.",
        highlights: [
          "Ultra-fast mobile loading speed",
          "Mobile-first lead capture forms",
          "Clean, trust-building brand aesthetics",
        ],
      },
      {
        title: "Client Portals & Booking Experiences",
        slug: "web-application-development",
        link: "/services/web-application-development",
        pillar: "Web & Conversion Experiences",
        desc: "Interactive client portals, online quote calculators, and automated appointment booking systems that make buying from you effortless.",
        highlights: [
          "Frictionless customer intake",
          "Interactive appointment booking",
          "Seamless mobile & desktop flow",
        ],
      },
      {
        title: "Interactive Lead Generation Tools",
        slug: "custom-software-development",
        link: "/services/custom-software-development",
        pillar: "Web & Conversion Experiences",
        desc: "Custom price estimators, ROI calculators, and interactive assessment funnels that capture high-intent contact details before prospects bounce.",
        highlights: [
          "Custom quote & ROI calculators",
          "Automated lead qualification funnels",
          "Instant lead handoff to sales team",
        ],
      },
      {
        title: "High-AOV E-Commerce Storefronts",
        slug: "ecommerce-development",
        link: "/services/ecommerce-development",
        pillar: "Web & Conversion Experiences",
        desc: "High-converting online storefronts optimized to increase average order value, reduce cart abandonment, and maximize customer lifetime value.",
        highlights: [
          "High-converting 1-page checkout",
          "Instant product search & filtering",
          "Multiple localized payment methods",
        ],
      },
    ],
  },
  {
    name: "Marketing Automation & AI Lead Ops",
    badge: "Pillar 3",
    desc: "Automate lead qualification, respond to inquiries within 60 seconds, and eliminate manual busywork so your sales team closes more deals.",
    services: [
      {
        title: "24/7 Smart AI Lead Assistants",
        slug: "ai-integration",
        link: "/services/ai-integration",
        pillar: "Marketing Automation & AI Lead Ops",
        desc: "Intelligent AI assistants trained on your business offerings to answer customer questions, collect contact details, and book consultations 24/7.",
        highlights: [
          "24/7 instant client inquiry support",
          "Trained on your business FAQs",
          "Automated consultation booking",
        ],
      },
      {
        title: "Conversational WhatsApp & Web Chatbots",
        slug: "ai-chatbots",
        link: "/services/ai-chatbots",
        pillar: "Marketing Automation & AI Lead Ops",
        desc: "Natural language chatbots for your website and WhatsApp that qualify buyer intent and schedule appointments directly on your calendar.",
        highlights: [
          "Instant buyer qualification",
          "Direct calendar meeting booking",
          "WhatsApp & website integration",
        ],
      },
      {
        title: "Automated Lead Routing & Team Alerts",
        slug: "workflow-automation",
        link: "/services/workflow-automation",
        pillar: "Marketing Automation & AI Lead Ops",
        desc: "Connect your intake forms to team WhatsApp and Slack so your sales reps are alerted within seconds of a hot lead submission.",
        highlights: [
          "Sub-60s new inquiry alerts",
          "Automated customer record updates",
          "Zero manual data entry delay",
        ],
      },
      {
        title: "CRM Pipeline Architecture & Lead Scoring",
        slug: "marketing-automation-crm",
        link: "/services/marketing-automation-crm",
        pillar: "Marketing Automation & AI Lead Ops",
        desc: "Set up automated lead scoring and deal stages in HubSpot, Zoho, or Salesforce so high-value buyers get prioritized by your team.",
        highlights: [
          "Automated high-intent lead scoring",
          "Instant sales rep assignment",
          "Complete lead-to-revenue tracking",
        ],
      },
    ],
  },
];

export default async function ServicesCatalogPage() {
  const region = resolveRegion();

  const [cmsPage, siteSettings, headerMenu] = await Promise.all([
    getPublicPage("services", region.code),
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  // Check if CMS page has custom services configured inside a FeatureGrid or Services block
  let dynamicPillars = DEFAULT_PILLARS;
  let customTitle: string | undefined;
  let customSubtitle: string | undefined;

  if (cmsPage?.blocks) {
    const servicesBlock = cmsPage.blocks.find(
      (b) =>
        b.enabled &&
        (b.type?.toLowerCase() === "featuregrid" ||
          b.type?.toLowerCase() === "features" ||
          b.type?.toLowerCase() === "services"),
    );

    if (servicesBlock?.content) {
      if (servicesBlock.content.sectionTitle) {
        customTitle = servicesBlock.content.sectionTitle as string;
      }
      if (servicesBlock.content.sectionSubtitle) {
        customSubtitle = servicesBlock.content.sectionSubtitle as string;
      }

      const rawServices = Array.isArray(servicesBlock.content.services)
        ? (servicesBlock.content.services as Array<{
            id?: string;
            title: string;
            pillar?: string;
            description?: string;
            link?: string;
            badge?: string;
            startingPrice?: string;
            deliverables?: string[];
            enabled?: boolean;
          }>)
        : [];

      if (rawServices.length > 0) {
        const activeCmsServices = rawServices.filter(
          (s) => s && s.enabled !== false && s.title,
        );

        if (activeCmsServices.length > 0) {
          // Group by pillar
          const pillarMap = new Map<string, ServiceCardData[]>();
          activeCmsServices.forEach((s) => {
            const pName = s.pillar || "Digital Growth";
            if (!pillarMap.has(pName)) {
              pillarMap.set(pName, []);
            }
            pillarMap.get(pName)!.push({
              id: s.id,
              title: s.title,
              pillar: pName,
              desc: s.description || "",
              link: s.link || "/contact",
              badge: s.badge,
              startingPrice: s.startingPrice,
              highlights: s.deliverables,
            });
          });

          dynamicPillars = Array.from(pillarMap.entries()).map(
            ([name, srvList], pIdx) => ({
              name,
              badge: `Pillar ${pIdx + 1}`,
              desc: `Specialized ${name.toLowerCase()} capabilities configured dynamically via Nexora Admin CMS.`,
              services: srvList,
            }),
          );
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-10 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">
        <ServicesCatalogView
          pillars={dynamicPillars}
          title={customTitle}
          subtitle={customSubtitle}
        />

        {/* Closing Conversion CTA */}
        <Reveal
          variant="fade-up"
          distance="lg"
          duration="slower"
          as="div"
          className="rounded-3xl bg-slate-950 text-white p-6 sm:p-12 lg:p-16 text-center space-y-6 relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block">
              Tailored Engineering &amp; Growth Scope
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
              Need a Combined Technology &amp; Growth Retainer?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-normal">
              We assemble dedicated sprint squads combining software architects, performance marketers, and automation engineers tailored to your exact roadmap.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-lg transition"
              >
                <span>Request Custom Proposal &rarr;</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
