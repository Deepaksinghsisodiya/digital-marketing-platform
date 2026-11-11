import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Settings2,
  Sliders,
  Check,
} from "lucide-react";

const BLOCK_TEMPLATES: Record<string, { label: string; defaultContent: Record<string, unknown>; defaultSettings: Record<string, unknown> }> = {
  Hero: {
    label: "Hero Section",
    defaultContent: {
      headline: "Accelerate Your Digital Growth",
      subheadline: "AI-powered digital marketing strategies delivering measurable ROI.",
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
      sectionSubtitle: "Explore cutting-edge features tailored to your industry.",
      features: [
        { title: "Precision Audience Targeting", description: "Reach high-intent prospects across multi-channel campaigns." },
        { title: "Real-time Attribution", description: "Full-funnel reporting with deterministic conversion metrics." },
        { title: "Automated Experimentation", description: "Continuously test ad creatives and landing page copy." },
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
        { question: "How fast can we launch campaigns?", answer: "Most clients deploy their first campaign within 48 hours." },
        { question: "Does Nexora support multi-region governance?", answer: "Yes, multi-region compliance and localization are native." },
      ],
    },
    defaultSettings: {},
  },
  Testimonials: {
    label: "Client Testimonials & Proof",
    defaultContent: {
      sectionTitle: "Validated by Enterprise Leaders",
      sectionSubtitle: "Discover how global brands scale predictable pipeline with Nexora.",
      testimonials: [
        {
          quote: "Nexora increased our pipeline velocity by 340% within two quarters.",
          author: "Aditi Rao",
          role: "VP of Global Marketing",
          company: "Apex Cloud Enterprise",
          rating: 5,
        },
        {
          quote: "The automated audience modeling and deterministic lead scoring transformed our conversion rates.",
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
      sectionSubtitle: "Transparent engagement models engineered for enterprise marketing velocity.",
      plans: [
        {
          name: "Growth Engine",
          description: "For scaling B2B businesses establishing full-funnel digital dominance.",
          monthlyPrice: "$2,490",
          annualPrice: "$1,990",
          features: ["Multi-Touch Attribution Engine", "Deterministic Lead Scoring", "Weekly Growth Architect Advisory"],
          ctaText: "Launch Growth Engine",
          ctaLink: "/contact",
          isPopular: false,
        },
        {
          name: "Enterprise Scale",
          badge: "Most Selected",
          description: "For mid-to-large enterprises requiring multi-region campaign governance.",
          monthlyPrice: "$4,990",
          annualPrice: "$3,990",
          features: ["Everything in Growth Engine", "Cross-Border Multi-Region Routing", "24/7 Dedicated Support & 99.9% SLA"],
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
};

export const PageEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const { data: page, isLoading, refetch } = useGetPageByIdQuery(id || "", {
    skip: !id,
  });

  const [saveDraft, { isLoading: isSaving }] = useSavePageDraftMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishPageMutation();
  const [generatePreviewToken] = useGeneratePreviewTokenMutation();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "seo">("sections");
  const [versionToken, setVersionToken] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  // Status banner / Conflict state
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Live preview settings
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setBlocks(page.blocks ? [...page.blocks] : []);
      setVersionToken(page.versionToken || "");
      setMetaTitle(page.metaTitle || "");
      setMetaDescription(page.metaDescription || "");
      setCanonicalUrl(page.canonicalUrl || "");
      setNoIndex(page.noIndex);
      setSelectedBlockIndex((prev) =>
        page.blocks && page.blocks.length > 0 && prev === null ? 0 : prev
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
      setSelectedBlockIndex(targetIndex);
    }
  };

  const handleDeleteBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
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
      setSaveMessage({ text: "Draft saved. Updating live preview...", type: "success" });
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

  const handlePublish = async () => {
    if (!id || !page) return;
    if (!window.confirm("Publish changes to the live website?")) return;

    try {
      await handleSaveDraft();
      await publishPage(id).unwrap();
      refetch();
      setIframeKey((k) => k + 1);
      alert("Page published successfully!");
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      alert(errObj?.data?.error || "Failed to publish page.");
    }
  };

  const handlePreviewExternal = async () => {
    if (!id || !page) return;
    try {
      const res = await generatePreviewToken(id).unwrap();
      const websiteUrl = import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000";
      window.open(
        `${websiteUrl}/api/preview?token=${res.token}&slug=${encodeURIComponent(page.slug)}`,
        "_blank"
      );
    } catch {
      alert("Failed to generate preview token.");
    }
  };

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null;

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
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold">Loading Visual Page Studio...</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-12 text-center text-slate-500">
        Page not found.{" "}
        <button onClick={() => navigate("/cms/pages")} className="text-indigo-600 underline font-semibold">
          Return to Pages
        </button>
      </div>
    );
  }

  const liveWebsiteBase = import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000";
  const previewPagePath = page.slug === "home" ? "" : page.slug;
  const iframeTargetUrl = `${liveWebsiteBase}/${previewPagePath}`;

  return (
    <div className="space-y-4">
      {/* Top Action Studio Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cms/pages")}
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
                onChange={(e) => setTitle(e.target.value)}
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
                <span className={`w-1.5 h-1.5 rounded-full ${page.status === 1 ? "bg-emerald-500" : "bg-amber-500"}`} />
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
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Saving..." : "Save Draft"}</span>
            </button>
          )}

          {hasPermission("pages.publish") && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
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
                  <span className="text-[11px] text-slate-400">Click to append to bottom</span>
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
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{type}</span>
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
                  <span className="text-[11px] text-slate-400">Reorder or toggle visibility</span>
                </div>

                {blocks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No sections added yet. Use the component palette above to add one.
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
                                isEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                              }`}
                              title={isEnabled ? "Section is Visible (Click to Hide)" : "Section is Hidden (Click to Show)"}
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

                          {/* Reordering and Delete */}
                          <div className="flex items-center gap-1">
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
                            {/* Hero Editor Fields */}
                            {b.type === "Hero" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={(b.content.headline as string) || ""}
                                    onChange={(e) => updateSelectedBlockContent("headline", e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Subheadline
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={(b.content.subheadline as string) || ""}
                                    onChange={(e) => updateSelectedBlockContent("subheadline", e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                      Primary CTA Text
                                    </label>
                                    <input
                                      type="text"
                                      value={(b.content.primaryCtaText as string) || ""}
                                      onChange={(e) => updateSelectedBlockContent("primaryCtaText", e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                      CTA Target Link
                                    </label>
                                    <input
                                      type="text"
                                      value={(b.content.primaryCtaLink as string) || ""}
                                      onChange={(e) => updateSelectedBlockContent("primaryCtaLink", e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* FeatureGrid Editor Fields */}
                            {b.type === "FeatureGrid" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Section Title
                                  </label>
                                  <input
                                    type="text"
                                    value={(b.content.sectionTitle as string) || ""}
                                    onChange={(e) => updateSelectedBlockContent("sectionTitle", e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Section Subtitle
                                  </label>
                                  <input
                                    type="text"
                                    value={(b.content.sectionSubtitle as string) || ""}
                                    onChange={(e) => updateSelectedBlockContent("sectionSubtitle", e.target.value)}
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
                                    onChange={(e) => updateSelectedBlockContent("headline", e.target.value)}
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
                                      value={(b.content.buttonText as string) || ""}
                                      onChange={(e) => updateSelectedBlockContent("buttonText", e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                      Button Link
                                    </label>
                                    <input
                                      type="text"
                                      value={(b.content.buttonLink as string) || ""}
                                      onChange={(e) => updateSelectedBlockContent("buttonLink", e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* FAQ & RichText Editor Fields */}
                            {(b.type === "FAQ" || b.type === "RichText" || b.type === "Stats") && (
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
                                        updated[idx] = { ...cur, content: parsed };
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
                  <span className="truncate max-w-[260px]">{iframeTargetUrl}</span>
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
    </div>
  );
};
