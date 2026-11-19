import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  useGetPageByIdQuery,
  useSavePageDraftMutation,
  usePublishPageMutation,
  useGeneratePreviewTokenMutation,
} from "../../store/api/adminApi";
import { useAuth } from "../../hooks/useAuth";
import type { CmsBlock, SaveDraftRequest } from "../../types";
import {
  Globe,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Check,
  Plus,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
  ArrowLeftRight,
} from "lucide-react";

type EditableHeroSlide = {
  id?: string;
  tag?: string;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: string;
  imageLayout?: string;
  imageBadge?: string;
  accentColor?: string;
  overlayOpacity?: number;
  backgroundColor?: string;
  [key: string]: unknown;
};

const BLOCK_TEMPLATES: Record<
  string,
  {
    label: string;
    defaultContent: Record<string, unknown>;
    defaultSettings: Record<string, unknown>;
  }
> = {
  Hero: {
    label: "Hero Section",
    defaultContent: {
      headline: "Accelerate Your Digital Growth",
      subheadline:
        "AI-powered digital marketing strategies delivering measurable ROI.",
      primaryCtaText: "Get Started Free",
      primaryCtaLink: "/contact",
      secondaryCtaText: "Explore Solutions",
      secondaryCtaLink: "/solutions",
    },
    defaultSettings: {
      alignment: "center",
      theme: "dark",
    },
  },
  Stats: {
    label: "Key Metrics & Stats",
    defaultContent: {
      metrics: [
        { label: "Ad Spend Managed", value: "$45M+" },
        { label: "Average ROI Increase", value: "320%" },
        { label: "Enterprise Clients", value: "1,200+" },
      ],
    },
    defaultSettings: {
      backgroundColor: "slate-50",
    },
  },
  FeatureGrid: {
    label: "Feature Grid",
    defaultContent: {
      sectionTitle: "Built for Modern Scale",
      sectionSubtitle:
        "Explore cutting-edge features tailored to your industry.",
      features: [
        {
          title: "Precision Audience Targeting",
          description:
            "Reach high-intent prospects across multi-channel campaigns.",
        },
        {
          title: "Real-time Attribution",
          description:
            "Full-funnel reporting with deterministic conversion metrics.",
        },
        {
          title: "Automated Experimentation",
          description: "Continuously test ad creatives and landing page copy.",
        },
      ],
    },
    defaultSettings: {
      columns: 3,
    },
  },
  CTA: {
    label: "Call to Action Banner",
    defaultContent: {
      headline: "Ready to scale your digital presence?",
      buttonText: "Schedule an Executive Demo",
      buttonLink: "/contact",
    },
    defaultSettings: {
      variant: "gradient",
    },
  },
  FAQ: {
    label: "Frequently Asked Questions",
    defaultContent: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How fast can we launch campaigns?",
          answer: "Most clients deploy their first campaign within 48 hours.",
        },
        {
          question: "Does Nexora support multi-region governance?",
          answer: "Yes, multi-region compliance and localization are native.",
        },
      ],
    },
    defaultSettings: {},
  },
  Testimonials: {
    label: "Client Testimonials & Proof",
    defaultContent: {
      sectionTitle: "Validated by Enterprise Leaders",
      sectionSubtitle:
        "Discover how global brands scale predictable pipeline with Nexora.",
      testimonials: [
        {
          quote:
            "Nexora increased our pipeline velocity by 340% within two quarters.",
          author: "Aditi Rao",
          role: "VP of Global Marketing",
          company: "Apex Cloud Enterprise",
          rating: 5,
        },
        {
          quote:
            "The automated audience modeling and deterministic lead scoring transformed our conversion rates.",
          author: "Marcus Vance",
          role: "Chief Commercial Officer",
          company: "Synapse Financial Networks",
          rating: 5,
        },
      ],
    },
    defaultSettings: {},
  },
  Pricing: {
    label: "Pricing & Engagement Tiers",
    defaultContent: {
      sectionTitle: "Predictable Growth Infrastructure",
      sectionSubtitle:
        "Transparent engagement models engineered for enterprise marketing velocity.",
      plans: [
        {
          name: "Growth Engine",
          description:
            "For scaling B2B businesses establishing full-funnel digital dominance.",
          monthlyPrice: "$2,490",
          annualPrice: "$1,990",
          features: [
            "Multi-Touch Attribution Engine",
            "Deterministic Lead Scoring",
            "Weekly Growth Architect Advisory",
          ],
          ctaText: "Launch Growth Engine",
          ctaLink: "/contact",
          isPopular: false,
        },
        {
          name: "Enterprise Scale",
          badge: "Most Selected",
          description:
            "For mid-to-large enterprises requiring multi-region campaign governance.",
          monthlyPrice: "$4,990",
          annualPrice: "$3,990",
          features: [
            "Everything in Growth Engine",
            "Cross-Border Multi-Region Routing",
            "24/7 Dedicated Support & 99.9% SLA",
          ],
          ctaText: "Request Enterprise Pilot",
          ctaLink: "/contact",
          isPopular: true,
        },
      ],
    },
    defaultSettings: {},
  },
  RichText: {
    label: "Rich Content / Editorial",
    defaultContent: {
      body: "### Why Choose Nexora?\n\nOur platform integrates enterprise SEO, automated performance advertising, and real-time CRM analytics into a single cohesive system.",
    },
    defaultSettings: {},
  },
  ComparisonTable: {
    label: "Competitive Comparison Matrix",
    defaultContent: {
      sectionTitle: "Why Modern Brands Choose Nexora",
      sectionSubtitle:
        "See how our unified digital marketing platform compares against traditional agencies and fragmented teams.",
      ctaText: "Deploy Nexora For Your Brand",
      ctaLink: "/contact",
      rows: [
        {
          feature: "Attribution Engine",
          category: "Technology",
          nexora: "Deterministic Multi-Touch ML",
          agency: "Manual spreadsheets / Last-click",
          freelancer: "Basic Google Analytics 4",
        },
        {
          feature: "Campaign Launch Time",
          category: "Agility",
          nexora: "48 - 72 Hours",
          agency: "3 - 6 Weeks",
          freelancer: "Unpredictable / Ad-hoc",
        },
        {
          feature: "Multi-Region Governance",
          category: "Compliance",
          nexora: true,
          agency: false,
          freelancer: false,
        },
      ],
    },
    defaultSettings: {},
  },
  RoiCalculator: {
    label: "Interactive Growth ROI Calculator",
    defaultContent: {
      sectionTitle: "Calculate Your Projected Growth ROI",
      sectionSubtitle:
        "Simulate how Nexora's automated audience modeling and deterministic attribution amplify your monthly revenue.",
      defaultSpend: 8000,
      defaultConversionRate: 2.0,
      defaultDealSize: 1500,
      ctaText: "Claim Your Growth Forecast",
      ctaLink: "/contact",
    },
    defaultSettings: {},
  },
  ProcessSteps: {
    label: "Strategic 4-Phase Process",
    defaultContent: {
      sectionTitle: "Our 4-Phase Growth Engineering Framework",
      sectionSubtitle:
        "A systematic, battle-tested methodology designed to transform ambiguous marketing spend into predictable pipeline.",
      ctaText: "Initiate Discovery Sprint",
      ctaLink: "/contact",
    },
    defaultSettings: {},
  },
  BookingEmbed: {
    label: "Calendar & Consultation Booking",
    defaultContent: {
      sectionTitle: "Schedule Your Strategic Growth Consultation",
      sectionSubtitle:
        "Select a convenient time for a confidential, one-on-one session with our senior growth architects.",
      bookingUrl: "",
      ctaText: "Request Meeting Time",
    },
    defaultSettings: {},
  },
};

export const PageEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const {
    data: page,
    isLoading,
    refetch,
  } = useGetPageByIdQuery(id || "", {
    skip: !id,
  });

  const [saveDraft, { isLoading: isSaving }] = useSavePageDraftMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishPageMutation();
  const [generatePreviewToken] = useGeneratePreviewTokenMutation();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"sections" | "seo">("sections");
  const [versionToken, setVersionToken] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // Status banner / Conflict state
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Live preview settings
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    navigate("/cms/pages");
  };

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setBlocks(page.blocks ? [...page.blocks] : []);
      setVersionToken(page.versionToken || "");
      setMetaTitle(page.metaTitle || "");
      setMetaDescription(page.metaDescription || "");
      setCanonicalUrl(page.canonicalUrl || "");
      setNoIndex(page.noIndex);
      setIsDirty(false);
      setSelectedBlockIndex((prev) =>
        page.blocks && page.blocks.length > 0 && prev === null ? 0 : prev,
      );
    }
  }, [page]);

  const handleAddBlock = (type: string) => {
    const template = BLOCK_TEMPLATES[type];
    if (!template) return;

    const newBlock: CmsBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      schemaVersion: 1,
      settings: JSON.parse(JSON.stringify(template.defaultSettings)),
      content: JSON.parse(JSON.stringify(template.defaultContent)),
      enabled: true,
      regionFilter: null,
    };

    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setIsDirty(true);
    setSelectedBlockIndex(updated.length - 1);
  };

  const handleToggleBlock = (index: number) => {
    const updated = [...blocks];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        enabled: !updated[index].enabled,
      };
      setBlocks(updated);
      setIsDirty(true);
    }
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    if (moved) {
      updated.splice(targetIndex, 0, moved);
      setBlocks(updated);
      setIsDirty(true);
      setSelectedBlockIndex(targetIndex);
    }
  };

  const handleDeleteBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    setIsDirty(true);
    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(updated.length > 0 ? 0 : null);
    } else if (selectedBlockIndex !== null && selectedBlockIndex > index) {
      setSelectedBlockIndex(selectedBlockIndex - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    setSaveMessage(null);
    try {
      const payload: SaveDraftRequest = {
        title,
        blocks,
        versionToken,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        noIndex,
      };

      const res = await saveDraft({ id, body: payload }).unwrap();
      setVersionToken(res.versionToken);
      setIsDirty(false);
      setSaveMessage({
        text: "Draft saved. Updating live preview...",
        type: "success",
      });
      setIframeKey((k) => k + 1);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      const errObj = err as { status?: number; data?: { error?: string } };
      setSaveMessage({
        text: errObj?.data?.error || "Failed to save draft.",
        type: "error",
      });
    }
  };

  const handlePublish = () => {
    if (!id || !page) return;
    setPublishConfirmOpen(true);
  };

  const confirmPublishAction = async () => {
    if (!id || !page) return;
    try {
      await handleSaveDraft();
      await publishPage(id).unwrap();
      refetch();
      setIframeKey((k) => k + 1);
      setPublishConfirmOpen(false);
      toast.success("Page published successfully to the live site!");
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      toast.error(errObj?.data?.error || "Failed to publish page.");
    }
  };

  const handlePreviewExternal = async () => {
    if (!id || !page) return;
    try {
      const res = await generatePreviewToken(id).unwrap();
      const websiteUrl =
        import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000";
      window.open(
        `${websiteUrl}/api/preview?token=${res.token}&slug=${encodeURIComponent(page.slug)}`,
        "_blank",
      );
    } catch {
      toast.error("Failed to generate preview token.");
    }
  };

  const updateSelectedBlockContent = (key: string, val: unknown) => {
    if (selectedBlockIndex === null || !blocks[selectedBlockIndex]) return;
    const current = blocks[selectedBlockIndex];
    const updated = [...blocks];
    updated[selectedBlockIndex] = {
      ...current,
      content: {
        ...current.content,
        [key]: val,
      },
    };
    setBlocks(updated);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold">
          Loading Visual Page Studio...
        </span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-12 text-center text-slate-500">
        Page not found.{" "}
        <button
          onClick={() => navigate("/cms/pages")}
          className="text-indigo-600 underline font-semibold"
        >
          Return to Pages
        </button>
      </div>
    );
  }

  const liveWebsiteBase =
    import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000";
  const previewPagePath = page.slug === "home" ? "" : page.slug;
  const iframeTargetUrl = `${liveWebsiteBase}/${previewPagePath}`;

  return (
    <div className="space-y-4">
      {/* Top Action Studio Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Pages</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                className="font-extrabold text-slate-900 dark:text-white text-base bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1"
              />
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                /{page.slug}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  page.status === 1
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${page.status === 1 ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                <span>{page.status === 1 ? "Live" : "Draft"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Section Studio with real-time website preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {saveMessage && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300"
                  : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300"
              }`}
            >
              {saveMessage.text}
            </span>
          )}

          <button
            onClick={handlePreviewExternal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>Token Preview</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {hasPermission("pages.edit") && (
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? "Saving..." : "Save Draft"}</span>
            </button>
          )}

          {hasPermission("pages.publish") && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isPublishing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isPublishing ? "Publishing..." : "Publish Live"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sections & Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Studio Sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("sections")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "sections"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Page Sections ({blocks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "seo"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SEO & Metadata</span>
            </button>
          </div>

          {activeTab === "sections" ? (
            <>
              {/* Add Block Palette */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    + Add Section Block
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click to append to bottom
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(BLOCK_TEMPLATES).map(([type, template]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddBlock(type)}
                      className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition text-left group"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {template.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections Tree with Direct ON/OFF Toggles */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sections Tree & Visibility
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Reorder or toggle visibility
                  </span>
                </div>

                {blocks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No sections added yet. Use the component palette above to
                    add one.
                  </p>
                ) : (
                  blocks.map((b, idx) => {
                    const isSelected = selectedBlockIndex === idx;
                    const isEnabled = b.enabled !== false;
                    return (
                      <div
                        key={b.id}
                        className={`rounded-xl border transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div
                          onClick={() => setSelectedBlockIndex(idx)}
                          className="flex items-center justify-between p-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {/* Visibility Toggle Switch */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBlock(idx);
                              }}
                              className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
                                isEnabled
                                  ? "bg-emerald-500 justify-end"
                                  : "bg-slate-300 dark:bg-slate-700 justify-start"
                              }`}
                              title={
                                isEnabled
                                  ? "Section is Visible (Click to Hide)"
                                  : "Section is Hidden (Click to Show)"
                              }
                            >
                              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                            </button>

                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {idx + 1}.
                            </span>
                            <span
                              className={`text-xs font-bold truncate ${
                                isSelected
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : isEnabled
                                    ? "text-slate-800 dark:text-slate-200"
                                    : "text-slate-400 line-through"
                              }`}
                            >
                              {BLOCK_TEMPLATES[b.type]?.label || b.type}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {b.type}
                            </span>
                          </div>

                          {/* Reordering, Visibility Toggle and Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = [...blocks];
                                const current = updated[idx];
                                if (current) {
                                  updated[idx] = {
                                    ...current,
                                    enabled: current.enabled === false ? true : false,
                                  };
                                  setBlocks(updated);
                                  setIsDirty(true);
                                }
                              }}
                              className={`p-1 rounded-lg transition ${
                                b.enabled !== false
                                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                              title={b.enabled !== false ? "Hide section from website" : "Show section on website"}
                            >
                              {b.enabled !== false ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, "up");
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                              title="Move section up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(idx, "down");
                              }}
                              disabled={idx === blocks.length - 1}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                              title="Move section down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(idx);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Content Editor when Selected */}
                        {isSelected && (
                          <div className="p-4 border-t border-indigo-100 dark:border-indigo-950/60 bg-white/70 dark:bg-slate-950/70 space-y-3 text-xs">
                            {/* Universal Block Tone & Animation Controls */}
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Section Tone
                                </label>
                                <select
                                  value={(b.settings?.tone as string) || "light"}
                                  onChange={(e) => {
                                    const updated = [...blocks];
                                    const cur = updated[idx];
                                    if (cur) {
                                      updated[idx] = {
                                        ...cur,
                                        settings: {
                                          ...cur.settings,
                                          tone: e.target.value,
                                        },
                                      };
                                      setBlocks(updated);
                                      setIsDirty(true);
                                    }
                                  }}
                                  className="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="light">Light (Clean White)</option>
                                  <option value="alt">Alt (Subtle Surface)</option>
                                  <option value="dark">Dark (Deep Contrast)</option>
                                  <option value="brand-gradient">Brand Gradient</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Motion Animation
                                </label>
                                <select
                                  value={(b.settings?.animation as string) || "subtle"}
                                  onChange={(e) => {
                                    const updated = [...blocks];
                                    const cur = updated[idx];
                                    if (cur) {
                                      updated[idx] = {
                                        ...cur,
                                        settings: {
                                          ...cur.settings,
                                          animation: e.target.value,
                                        },
                                      };
                                      setBlocks(updated);
                                      setIsDirty(true);
                                    }
                                  }}
                                  className="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="subtle">Subtle Reveal (Default)</option>
                                  <option value="rich">Rich Motion (Spotlight & Tilt)</option>
                                  <option value="none">None (Reduced Motion)</option>
                                </select>
                              </div>
                            </div>

                            {/* Hero Editor Fields with Multi-Slide Carousel & Image Customization */}
                            {b.type === "Hero" && (() => {
                              const isSliderMode = true;

                              const rawSlides: EditableHeroSlide[] =
                                Array.isArray(b.content.slides) &&
                                (b.content.slides as EditableHeroSlide[]).length > 1
                                  ? (b.content.slides as EditableHeroSlide[])
                                  : [
                                      {
                                        id: "slide-1",
                                        tag:
                                          (b.content.tag as string) ||
                                          (b.content.eyebrow as string) ||
                                          "Performance Marketing & Growth",
                                        headline:
                                          (b.content.headline as string) ||
                                          "Data-Driven Marketing at Enterprise Scale.",
                                        subheadline:
                                          (b.content.subheadline as string) ||
                                          "Connect your enterprise to target audiences with AI campaign automation, precision audience modeling, and verifiable attribution.",
                                        primaryCtaText:
                                          (b.content.primaryCtaText as string) ||
                                          "Get Free Growth Diagnostic",
                                        primaryCtaLink:
                                          (b.content.primaryCtaLink as string) ||
                                          "/contact",
                                        secondaryCtaText:
                                          (b.content.secondaryCtaText as string) ||
                                          "Explore Capabilities",
                                        secondaryCtaLink:
                                          (b.content.secondaryCtaLink as string) ||
                                          "/services",
                                        imageUrl:
                                          (b.content.imageUrl as string) ||
                                          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85",
                                        imageAlt:
                                          (b.content.imageAlt as string) ||
                                          "Digital Growth & Analytics Infrastructure",
                                      },
                                      {
                                        id: "slide-2",
                                        tag: "Enterprise Web Engineering",
                                        headline:
                                          "Engineered Digital Experiences Built for Scale.",
                                        subheadline:
                                          "Next.js 15 enterprise web applications, modular headless CMS, bespoke APIs, and sub-second Core Web Vitals.",
                                        primaryCtaText: "Explore Web Engineering",
                                        primaryCtaLink: "/services",
                                        secondaryCtaText: "Schedule Technical Call",
                                        secondaryCtaLink: "/book-a-call",
                                        imageUrl:
                                          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2600&q=85",
                                        imageAlt: "Next.js 15 Enterprise Engineering Architecture",
                                      },
                                      {
                                        id: "slide-3",
                                        tag: "Intelligent AI Automation",
                                        headline:
                                          "Automate Business Operations with Enterprise AI.",
                                        subheadline:
                                          "Conversational AI chatbots, event-driven CRM synchronizations, automated lead qualification, and deterministic workflow routing that eliminate friction.",
                                        primaryCtaText: "Deploy Intelligent AI",
                                        primaryCtaLink: "/contact",
                                        secondaryCtaText: "AI Solutions Catalog",
                                        secondaryCtaLink: "/services",
                                        imageUrl:
                                          "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=2600&q=85",
                                        imageAlt: "Intelligent Neural AI Automation Systems",
                                      },
                                    ];

                              const curIdx = Math.min(
                                Math.max(0, activeSlideIndex),
                                rawSlides.length - 1,
                              );
                              const curSlide = (rawSlides[curIdx] || rawSlides[0])!;

                              const updateSlide = (
                                sIdx: number,
                                field: string,
                                value: unknown,
                              ) => {
                                const newSlides = [...rawSlides];
                                if (!newSlides[sIdx]) return;
                                newSlides[sIdx] = {
                                  ...newSlides[sIdx],
                                  [field]: value,
                                };
                                const updatedBlocks = [...blocks];
                                const curBlock = updatedBlocks[idx];
                                if (curBlock) {
                                  updatedBlocks[idx] = {
                                    ...curBlock,
                                    content: {
                                      ...curBlock.content,
                                      slides: newSlides,
                                      ...(sIdx === 0
                                        ? { [field]: value }
                                        : {}),
                                    },
                                  };
                                  setBlocks(updatedBlocks);
                                  setIsDirty(true);
                                }
                              };

                              const handleAddSlide = () => {
                                const newSlide: EditableHeroSlide = {
                                  id: `slide-${Date.now()}`,
                                  tag: "Enterprise Growth & AI",
                                  headline: "Modern Marketing Engineered for Results",
                                  subheadline:
                                    "Custom digital architecture, data-driven paid acquisition, and conversion rate optimization tailored to your growth goals.",
                                  primaryCtaText: "Start Your Project",
                                  primaryCtaLink: "/contact",
                                  secondaryCtaText: "Our Solutions",
                                  secondaryCtaLink: "/services",
                                  imageUrl:
                                    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2000&q=85",
                                  imageAlt: "Enterprise Growth Strategy",
                                };
                                const newSlides = [...rawSlides, newSlide];
                                const updatedBlocks = [...blocks];
                                const curBlock = updatedBlocks[idx];
                                if (curBlock) {
                                  updatedBlocks[idx] = {
                                    ...curBlock,
                                    content: {
                                      ...curBlock.content,
                                      isSlider: true,
                                      slides: newSlides,
                                    },
                                  };
                                  setBlocks(updatedBlocks);
                                  setIsDirty(true);
                                  setActiveSlideIndex(newSlides.length - 1);
                                }
                              };

                              const handleDeleteSlide = (sIdx: number) => {
                                if (rawSlides.length <= 1) return;
                                const newSlides = rawSlides.filter(
                                  (_, i) => i !== sIdx,
                                );
                                const updatedBlocks = [...blocks];
                                const curBlock = updatedBlocks[idx];
                                if (curBlock) {
                                  updatedBlocks[idx] = {
                                    ...curBlock,
                                    content: {
                                      ...curBlock.content,
                                      slides: newSlides,
                                      isSlider: newSlides.length > 1,
                                    },
                                  };
                                  setBlocks(updatedBlocks);
                                  setIsDirty(true);
                                  setActiveSlideIndex(Math.max(0, sIdx - 1));
                                }
                              };

                              const handleMoveSlide = (
                                sIdx: number,
                                direction: "left" | "right",
                              ) => {
                                const targetIdx =
                                  direction === "left" ? sIdx - 1 : sIdx + 1;
                                if (targetIdx < 0 || targetIdx >= rawSlides.length)
                                  return;
                                const newSlides = [...rawSlides];
                                const temp = newSlides[sIdx]!;
                                newSlides[sIdx] = newSlides[targetIdx]!;
                                newSlides[targetIdx] = temp;
                                const updatedBlocks = [...blocks];
                                const curBlock = updatedBlocks[idx];
                                if (curBlock) {
                                  updatedBlocks[idx] = {
                                    ...curBlock,
                                    content: {
                                      ...curBlock.content,
                                      slides: newSlides,
                                    },
                                  };
                                  setBlocks(updatedBlocks);
                                  setIsDirty(true);
                                  setActiveSlideIndex(targetIdx);
                                }
                              };

                              const handleFileUpload = async (
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("altText", curSlide.headline || "Hero Banner");
                                  const token =
                                    localStorage.getItem("token") ||
                                    sessionStorage.getItem("token");
                                  const res = await fetch(
                                    "/api/v1/admin/media/upload",
                                    {
                                      method: "POST",
                                      headers: token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {},
                                      body: formData,
                                    },
                                  );
                                  if (res.ok) {
                                    const data = await res.json();
                                    const downloadUrl = `/api/v1/public/media/${data.id}/download`;
                                    if (isSliderMode) {
                                      updateSlide(curIdx, "imageUrl", downloadUrl);
                                    } else {
                                      updateSelectedBlockContent(
                                        "imageUrl",
                                        downloadUrl,
                                      );
                                    }
                                  } else {
                                    const previewUrl = URL.createObjectURL(file);
                                    if (isSliderMode) {
                                      updateSlide(curIdx, "imageUrl", previewUrl);
                                    } else {
                                      updateSelectedBlockContent(
                                        "imageUrl",
                                        previewUrl,
                                      );
                                    }
                                  }
                                } catch {
                                  const previewUrl = URL.createObjectURL(file);
                                  if (isSliderMode) {
                                    updateSlide(curIdx, "imageUrl", previewUrl);
                                  } else {
                                    updateSelectedBlockContent(
                                      "imageUrl",
                                      previewUrl,
                                    );
                                  }
                                }
                              };

                              return (
                                <div className="space-y-4">
                                  {/* 1. Hero Section Visibility (Show / Hide Toggle) */}
                                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                      {b.enabled !== false ? (
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                          <Eye className="w-4 h-4" />
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                          <EyeOff className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                          Hero Banner Display
                                        </span>
                                        <span className="text-[11px] text-slate-500 block">
                                          {b.enabled !== false
                                            ? "Active (Visible on live website)"
                                            : "Hidden (Hero will not appear on website)"}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...blocks];
                                        const current = updated[idx];
                                        if (current) {
                                          updated[idx] = {
                                            ...current,
                                            enabled: b.enabled === false ? true : false,
                                          };
                                          setBlocks(updated);
                                          setIsDirty(true);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        b.enabled !== false
                                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                                          : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      {b.enabled !== false ? (
                                        <>
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>Visible</span>
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3.5 h-3.5" />
                                          <span>Hidden</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* 2. Mode Switcher: Single Hero vs Hero Slider / Carousel */}
                                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Hero Presentation Mode
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateSelectedBlockContent(
                                            "isSlider",
                                            false,
                                          );
                                        }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                          !isSliderMode
                                            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                        }`}
                                      >
                                        Single Banner
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateSelectedBlockContent(
                                            "isSlider",
                                            true,
                                          );
                                          if (rawSlides.length === 1) {
                                            updateSelectedBlockContent(
                                              "slides",
                                              rawSlides,
                                            );
                                          }
                                        }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                          isSliderMode
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                        }`}
                                      >
                                        Slider / Carousel ({rawSlides.length})
                                      </button>
                                    </div>
                                  </div>

                                  {/* 3. Multi-Slide Carousel Manager Bar */}
                                  {isSliderMode && (
                                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                                      <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                          Hero Banner Slides ({rawSlides.length})
                                        </span>
                                        <button
                                          type="button"
                                          onClick={handleAddSlide}
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs transition"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>Add Slide</span>
                                        </button>
                                      </div>

                                      {/* Slide Tabs with Reorder & Delete */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        {rawSlides.map((s, sIdx) => (
                                          <div
                                            key={s.id || sIdx}
                                            className={`inline-flex items-center rounded-lg border text-xs font-semibold overflow-hidden transition ${
                                              sIdx === curIdx
                                                ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                            }`}
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setActiveSlideIndex(sIdx)
                                              }
                                              className="px-3 py-1.5 text-left font-bold"
                                            >
                                              Slide {sIdx + 1}
                                            </button>

                                            {/* Reorder Buttons */}
                                            {rawSlides.length > 1 && (
                                              <div className="flex items-center border-l border-slate-200 dark:border-slate-700 px-0.5">
                                                <button
                                                  type="button"
                                                  disabled={sIdx === 0}
                                                  onClick={() =>
                                                    handleMoveSlide(sIdx, "left")
                                                  }
                                                  className="p-1 hover:text-indigo-600 disabled:opacity-20"
                                                  title="Move slide left"
                                                >
                                                  &larr;
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={
                                                    sIdx === rawSlides.length - 1
                                                  }
                                                  onClick={() =>
                                                    handleMoveSlide(sIdx, "right")
                                                  }
                                                  className="p-1 hover:text-indigo-600 disabled:opacity-20"
                                                  title="Move slide right"
                                                >
                                                  &rarr;
                                                </button>
                                              </div>
                                            )}

                                            {/* Delete Button */}
                                            {rawSlides.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleDeleteSlide(sIdx)
                                                }
                                                className="px-2 py-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 transition border-l border-slate-200 dark:border-slate-700"
                                                title="Delete slide"
                                              >
                                                &times;
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {/* Autoplay & Rotation Timing */}
                                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                                          <input
                                            type="checkbox"
                                            checked={b.content.autoplay !== false}
                                            onChange={(e) =>
                                              updateSelectedBlockContent(
                                                "autoplay",
                                                e.target.checked,
                                              )
                                            }
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                          />
                                          <span>Auto-Play Rotation</span>
                                        </label>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                          <span>Rotate every:</span>
                                          <select
                                            value={
                                              (b.content.interval as number) ||
                                              5000
                                            }
                                            onChange={(e) =>
                                              updateSelectedBlockContent(
                                                "interval",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                                          >
                                            <option value={3000}>3 seconds</option>
                                            <option value={5000}>5 seconds</option>
                                            <option value={7000}>7 seconds</option>
                                            <option value={10000}>10 seconds</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 4. Active Slide Content Fields */}
                                  <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        {isSliderMode
                                          ? `Slide ${curIdx + 1} Content & Media`
                                          : "Hero Banner Content & Media"}
                                      </span>
                                      {isSliderMode && (
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                                          Slide {curIdx + 1} of {rawSlides.length}
                                        </span>
                                      )}
                                    </div>

                                    {/* Tag / Category Badge */}
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                        Badge / Tag
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          (isSliderMode
                                            ? curSlide.tag || curSlide.eyebrow
                                            : ((b.content.tag || b.content.eyebrow) as string)) || ""
                                        }
                                        placeholder="e.g. Full-Funnel Digital Marketing"
                                        onChange={(e) => {
                                          if (isSliderMode) {
                                            updateSlide(curIdx, "tag", e.target.value);
                                            updateSlide(curIdx, "eyebrow", e.target.value);
                                          } else {
                                            updateSelectedBlockContent("tag", e.target.value);
                                            updateSelectedBlockContent("eyebrow", e.target.value);
                                          }
                                        }}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>

                                    {/* Main Headline */}
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                        Headline (Main Title)
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          (isSliderMode
                                            ? curSlide.headline
                                            : (b.content.headline as string)) || ""
                                        }
                                        placeholder="e.g. Accelerate Revenue with Modern Digital Marketing"
                                        onChange={(e) => {
                                          if (isSliderMode) {
                                            updateSlide(
                                              curIdx,
                                              "headline",
                                              e.target.value,
                                            );
                                          } else {
                                            updateSelectedBlockContent(
                                              "headline",
                                              e.target.value,
                                            );
                                          }
                                        }}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>

                                    {/* Subheadline Description */}
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                        Subheadline / Description
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={
                                          (isSliderMode
                                            ? curSlide.subheadline
                                            : (b.content.subheadline as string)) || ""
                                        }
                                        placeholder="Short, high-converting commercial description..."
                                        onChange={(e) => {
                                          if (isSliderMode) {
                                            updateSlide(
                                              curIdx,
                                              "subheadline",
                                              e.target.value,
                                            );
                                          } else {
                                            updateSelectedBlockContent(
                                              "subheadline",
                                              e.target.value,
                                            );
                                          }
                                        }}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>

                                    {/* Dual Action CTAs */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                          Primary CTA Text
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            (isSliderMode
                                              ? curSlide.primaryCtaText
                                              : (b.content.primaryCtaText as string)) || ""
                                          }
                                          placeholder="e.g. Get Free Proposal"
                                          onChange={(e) => {
                                            if (isSliderMode) {
                                              updateSlide(
                                                curIdx,
                                                "primaryCtaText",
                                                e.target.value,
                                              );
                                            } else {
                                              updateSelectedBlockContent(
                                                "primaryCtaText",
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                          Primary CTA Link
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            (isSliderMode
                                              ? curSlide.primaryCtaLink
                                              : (b.content.primaryCtaLink as string)) || ""
                                          }
                                          placeholder="e.g. /contact"
                                          onChange={(e) => {
                                            if (isSliderMode) {
                                              updateSlide(
                                                curIdx,
                                                "primaryCtaLink",
                                                e.target.value,
                                              );
                                            } else {
                                              updateSelectedBlockContent(
                                                "primaryCtaLink",
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                          Secondary CTA Text
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            (isSliderMode
                                              ? curSlide.secondaryCtaText
                                              : (b.content.secondaryCtaText as string)) || ""
                                          }
                                          placeholder="e.g. View Case Studies"
                                          onChange={(e) => {
                                            if (isSliderMode) {
                                              updateSlide(
                                                curIdx,
                                                "secondaryCtaText",
                                                e.target.value,
                                              );
                                            } else {
                                              updateSelectedBlockContent(
                                                "secondaryCtaText",
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                          Secondary CTA Link
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            (isSliderMode
                                              ? curSlide.secondaryCtaLink
                                              : (b.content.secondaryCtaLink as string)) || ""
                                          }
                                          placeholder="e.g. /case-studies"
                                          onChange={(e) => {
                                            if (isSliderMode) {
                                              updateSlide(
                                                curIdx,
                                                "secondaryCtaLink",
                                                e.target.value,
                                              );
                                            } else {
                                              updateSelectedBlockContent(
                                                "secondaryCtaLink",
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                        />
                                      </div>
                                    </div>

                                    {/* 5. Banner Image Upload & Preview Card */}
                                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                          {isSliderMode
                                            ? `Slide ${curIdx + 1} Banner Image`
                                            : "Hero Banner Image"}
                                        </span>
                                      </div>

                                      {/* Image File Upload Button */}
                                      <div className="flex items-center gap-2">
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition">
                                          <Upload className="w-3.5 h-3.5" />
                                          <span>Upload Image File</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                          />
                                        </label>
                                        <span className="text-[10px] text-slate-500">
                                          PNG, JPG, WebP supported
                                        </span>
                                      </div>

                                      {/* Image URL Input */}
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                          Or Enter Image URL:
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            (isSliderMode
                                              ? curSlide.imageUrl
                                              : (b.content.imageUrl as string)) || ""
                                          }
                                          placeholder="https://... or /api/v1/public/media/..."
                                          onChange={(e) => {
                                            if (isSliderMode) {
                                              updateSlide(
                                                curIdx,
                                                "imageUrl",
                                                e.target.value,
                                              );
                                            } else {
                                              updateSelectedBlockContent(
                                                "imageUrl",
                                                e.target.value,
                                              );
                                            }
                                          }}
                                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                      </div>

                                      {/* Quick High-Res Presets */}
                                      <div>
                                        <span className="block text-[10px] font-bold text-slate-400 mb-1">
                                          Quick High-Res Presets:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {[
                                            {
                                              name: "Cyber Analytics & Growth",
                                              url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85",
                                            },
                                            {
                                              name: "Enterprise Architecture",
                                              url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2600&q=85",
                                            },
                                            {
                                              name: "Neural AI Network",
                                              url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=2600&q=85",
                                            },
                                            {
                                              name: "Global Pipeline Streams",
                                              url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2600&q=85",
                                            },
                                            {
                                              name: "Luxury Dark Fluid",
                                              url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2600&q=85",
                                            },
                                            {
                                              name: "Command Center Data",
                                              url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=2600&q=85",
                                            },
                                          ].map((preset) => (
                                            <button
                                              key={preset.name}
                                              type="button"
                                              onClick={() => {
                                                if (isSliderMode) {
                                                  updateSlide(
                                                    curIdx,
                                                    "imageUrl",
                                                    preset.url,
                                                  );
                                                } else {
                                                  updateSelectedBlockContent(
                                                    "imageUrl",
                                                    preset.url,
                                                  );
                                                }
                                              }}
                                              className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-semibold transition"
                                            >
                                              + {preset.name}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Live Image Thumbnail Preview */}
                                      {Boolean(
                                        isSliderMode
                                          ? curSlide.imageUrl
                                          : b.content.imageUrl,
                                      ) && (
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950 p-2">
                                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-1 font-mono">
                                            <span>
                                              {isSliderMode
                                                ? `Slide ${curIdx + 1} Preview`
                                                : "Banner Preview"}
                                            </span>
                                            <span className="text-emerald-400">
                                              Live Preview
                                            </span>
                                          </div>
                                          <div className="relative rounded-lg overflow-hidden h-32 bg-slate-900">
                                            <img
                                              src={
                                                (isSliderMode
                                                  ? curSlide.imageUrl
                                                  : (b.content.imageUrl as string)) as string
                                              }
                                              alt={
                                                ((isSliderMode
                                                  ? curSlide.imageAlt
                                                  : (b.content.imageAlt as string)) as string) ||
                                                "Hero banner preview"
                                              }
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).style.display =
                                                  "none";
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* 6. Theme & Dynamic Colors / Lighting Controls */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                          Colors &amp; Lighting (Dynamic)
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          Controls buttons, badges &amp; ambient glow
                                        </span>
                                      </div>

                                      {/* Accent Color Preset Swatches */}
                                      <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                                          {isSliderMode
                                            ? `Slide ${curIdx + 1} Accent & Button Color`
                                            : "Hero Accent & Button Color"}
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2">
                                          {[
                                            { name: "Emerald Cyber", hex: "#10b981" },
                                            { name: "Electric Indigo", hex: "#6366f1" },
                                            { name: "Deep Royal Blue", hex: "#2563eb" },
                                            { name: "Neon Violet", hex: "#8b5cf6" },
                                            { name: "Sunset Crimson", hex: "#f43f5e" },
                                            { name: "Amber Gold", hex: "#f59e0b" },
                                            { name: "Cyan Teal", hex: "#06b6d4" },
                                          ].map((color) => {
                                            const activeColor =
                                              (curSlide.accentColor ||
                                                b.content.accentColor ||
                                                (b.settings?.accentColor as string) ||
                                                "#10b981") as string;
                                            const isSelected =
                                              activeColor.toLowerCase() ===
                                              color.hex.toLowerCase();
                                            return (
                                              <button
                                                key={color.hex}
                                                type="button"
                                                onClick={() => {
                                                  if (isSliderMode) {
                                                    updateSlide(curIdx, "accentColor", color.hex);
                                                  } else {
                                                    updateSelectedBlockContent("accentColor", color.hex);
                                                  }
                                                  const updatedBlocks = [...blocks];
                                                  const curTarget = updatedBlocks[idx];
                                                  if (curTarget) {
                                                    updatedBlocks[idx] = {
                                                      ...curTarget,
                                                      settings: {
                                                        ...curTarget.settings,
                                                        accentColor: color.hex,
                                                      },
                                                    };
                                                    setBlocks(updatedBlocks);
                                                    setIsDirty(true);
                                                  }
                                                }}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                                                  isSelected
                                                    ? "border-slate-900 dark:border-white shadow-xs scale-105"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                                                }`}
                                              >
                                                <span
                                                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                                  style={{ backgroundColor: color.hex }}
                                                />
                                                <span className="text-slate-700 dark:text-slate-300">
                                                  {color.name}
                                                </span>
                                              </button>
                                            );
                                          })}

                                          {/* Native Color Picker */}
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <input
                                              type="color"
                                              value={
                                                (curSlide.accentColor ||
                                                  b.content.accentColor ||
                                                  (b.settings?.accentColor as string) ||
                                                  "#10b981") as string
                                              }
                                              onChange={(e) => {
                                                if (isSliderMode) {
                                                  updateSlide(curIdx, "accentColor", e.target.value);
                                                } else {
                                                  updateSelectedBlockContent("accentColor", e.target.value);
                                                }
                                              }}
                                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                                              title="Pick custom color"
                                            />
                                            <span className="text-[10px] font-mono text-slate-500">
                                              Custom
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Overlay Opacity Slider */}
                                      <div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                          <span>Dark Background Gradient Opacity</span>
                                          <span className="font-mono text-slate-700 dark:text-slate-300">
                                            {Math.round(
                                              Number(
                                                curSlide.overlayOpacity ||
                                                  b.content.overlayOpacity ||
                                                  b.settings?.overlayOpacity ||
                                                  0.65,
                                              ) * 100,
                                            )}
                                            %
                                          </span>
                                        </div>
                                        <input
                                          type="range"
                                          min="30"
                                          max="95"
                                          step="5"
                                          value={Math.round(
                                            Number(
                                              curSlide.overlayOpacity ||
                                                b.content.overlayOpacity ||
                                                b.settings?.overlayOpacity ||
                                                0.65,
                                            ) * 100,
                                          )}
                                          onChange={(e) => {
                                            const val = Number(e.target.value) / 100;
                                            if (isSliderMode) {
                                              updateSlide(curIdx, "overlayOpacity", val);
                                            } else {
                                              updateSelectedBlockContent("overlayOpacity", val);
                                            }
                                          }}
                                          className="w-full accent-indigo-600 cursor-pointer"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* FeatureGrid Editor Fields */}
                            {b.type === "FeatureGrid" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Section Title
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      (b.content.sectionTitle as string) || ""
                                    }
                                    onChange={(e) =>
                                      updateSelectedBlockContent(
                                        "sectionTitle",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Section Subtitle
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      (b.content.sectionSubtitle as string) ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateSelectedBlockContent(
                                        "sectionSubtitle",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                  />
                                </div>
                              </>
                            )}

                            {/* CTA Editor Fields */}
                            {b.type === "CTA" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Banner Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={(b.content.headline as string) || ""}
                                    onChange={(e) =>
                                      updateSelectedBlockContent(
                                        "headline",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                      Button Text
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        (b.content.buttonText as string) || ""
                                      }
                                      onChange={(e) =>
                                        updateSelectedBlockContent(
                                          "buttonText",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                      Button Link
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        (b.content.buttonLink as string) || ""
                                      }
                                      onChange={(e) =>
                                        updateSelectedBlockContent(
                                          "buttonLink",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* FAQ & RichText Editor Fields */}
                            {(b.type === "FAQ" ||
                              b.type === "RichText" ||
                              b.type === "Stats") && (
                              <div>
                                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                  Raw Content JSON
                                </label>
                                <textarea
                                  rows={4}
                                  value={JSON.stringify(b.content, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value);
                                      const updated = [...blocks];
                                      const cur = updated[idx];
                                      if (cur) {
                                        updated[idx] = {
                                          ...cur,
                                          content: parsed,
                                        };
                                        setBlocks(updated);
                                      }
                                    } catch {
                                      // ignore invalid JSON while typing
                                    }
                                  }}
                                  className="w-full font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* SEO & Meta Config */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Meta Title (Browser Tab)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Enterprise Digital Growth Marketing | Nexora"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Comprehensive description for Google Search engines..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="https://nexora.com/..."
                />
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Discourage search engines from indexing this page (noindex)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Embedded Real-time Website Preview (6 cols, sticky) */}
        <div className="lg:col-span-6 sticky top-20 space-y-3">
          {/* Viewport Control Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Live Embedded Website
              </span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                :{liveWebsiteBase.split(":").pop()}/{previewPagePath}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Device Viewport Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                    previewDevice === "desktop"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Desktop 1920px Fullscreen"
                >
                  <Laptop className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                    previewDevice === "tablet"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tablet 768px"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                    previewDevice === "mobile"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Mobile 375px"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Preview */}
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Reload Preview Frame"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Direct Open in new tab */}
              <a
                href={iframeTargetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Open live URL in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Browser Chrome Simulation Wrapper */}
          <div
            className={`mx-auto rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden transition-all duration-300 ${
              previewDevice === "mobile"
                ? "max-w-[390px]"
                : previewDevice === "tablet"
                  ? "max-w-[768px]"
                  : "w-full"
            }`}
          >
            {/* Chrome Bar */}
            <div className="px-5 py-3 bg-slate-100 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 px-3 py-1 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[260px]">
                    {iframeTargetUrl}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {previewDevice}
              </span>
            </div>

            {/* Embedded Iframe */}
            <div className="bg-slate-950 relative min-h-[640px]">
              <iframe
                key={iframeKey}
                title="Website Live View"
                src={iframeTargetUrl}
                className="w-full border-0 transition-all"
                style={{
                  height: "720px",
                  backgroundColor: "#020617",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discard Unsaved Changes Dialog */}
      <ConfirmDialog
        isOpen={discardConfirmOpen}
        title="Discard Unsaved Changes"
        description="You have unsaved changes on this page draft. Leaving now will discard your modifications."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="warning"
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          navigate("/cms/pages");
        }}
        onClose={() => setDiscardConfirmOpen(false)}
      />

      {/* Publish Page Dialog */}
      <ConfirmDialog
        isOpen={publishConfirmOpen}
        title="Publish Live Page"
        description={`Publish "${page?.title || "Page"}" to the public website? All draft changes will immediately be visible to live site visitors.`}
        confirmText="Publish to Live Site"
        cancelText="Cancel"
        variant="primary"
        onConfirm={confirmPublishAction}
        onClose={() => setPublishConfirmOpen(false)}
      />
    </div>
  );
};
