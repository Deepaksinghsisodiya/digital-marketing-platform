import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useSavePageDraftMutation,
  usePublishPageMutation,
  useGetPageVersionsQuery,
  useRollbackPageMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import { useAuth } from "../../hooks/useAuth";
import type { CmsBlock } from "../../types";
import {
  Globe,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  Grid,
  Megaphone,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  Star,
  CreditCard,
  History,
  Clock,
  RotateCcw,
} from "lucide-react";

const BLOCK_TEMPLATES: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string; defaultContent: Record<string, unknown>; defaultSettings: Record<string, unknown> }
> = {
  Hero: {
    label: "Hero Banner",
    icon: Layout,
    description: "High-impact headline, subheadline, and dual conversion CTA buttons.",
    defaultContent: {
      headline: "Accelerate Your Digital Growth at Enterprise Scale",
      subheadline: "AI-powered marketing automation, precision audience targeting, and multi-touch attribution.",
      primaryCtaText: "Schedule Free Growth Diagnostic",
      primaryCtaLink: "/contact",
      secondaryCtaText: "Explore Insights & Strategy",
      secondaryCtaLink: "/blog",
    },
    defaultSettings: {
      theme: "dark",
      alignment: "center",
    },
  },
  Stats: {
    label: "Key Metrics & Telemetry",
    icon: BarChart3,
    description: "Multi-column numerical metrics displaying verified ROI, pipeline, and SLAs.",
    defaultContent: {
      metrics: [
        { label: "Avg Pipeline Velocity", value: "340%" },
        { label: "Enterprise Revenue Influenced", value: "$120M+" },
        { label: "Attribution Accuracy", value: "99.8%" },
        { label: "Deployment Time", value: "14 Days" },
      ],
    },
    defaultSettings: {
      backgroundColor: "slate-900",
    },
  },
  FeatureGrid: {
    label: "Enterprise Capabilities Grid",
    icon: Grid,
    description: "3 to 6 capability cards showcasing solutions, technical architecture, and services.",
    defaultContent: {
      sectionTitle: "Engineered for High-Velocity Enterprise Growth",
      sectionSubtitle: "Comprehensive performance marketing infrastructure designed for modern SaaS and services.",
      features: [
        { title: "High-Intent Performance SEO", description: "Dominate commercial search terms with bespoke landing architectures and deep semantic authority." },
        { title: "Account-Based Marketing (ABM)", description: "Engage enterprise buying committees with real-time intent signals and automated CRM sync." },
        { title: "Omnichannel Paid Media", description: "Algorithmic ad spend allocation across search, programmatic display, and enterprise social." },
      ],
    },
    defaultSettings: {
      columns: 3,
    },
  },
  CTA: {
    label: "Bottom Conversion CTA Banner",
    icon: Megaphone,
    description: "Bold conversion card inviting decision-makers to book an audit or schedule a demo.",
    defaultContent: {
      headline: "Ready to Scale Your Enterprise Pipeline?",
      subheadline: "Book an executive growth diagnostic with our digital marketing strategists.",
      buttonText: "Schedule Discovery Diagnostic",
      buttonLink: "/contact",
    },
    defaultSettings: {
      variant: "gradient",
    },
  },
  FAQ: {
    label: "Enterprise FAQ Accordion",
    icon: HelpCircle,
    description: "Expandable questions and answers covering SOC2, regional routing, and onboarding.",
    defaultContent: {
      title: "Frequently Asked Questions",
      items: [
        { question: "How quickly can campaigns be deployed?", answer: "Most clients go live with multi-region attribution within 48 to 72 hours." },
        { question: "Is multi-region compliance native?", answer: "Yes, consent telemetry, currency formatters, and regional data routing are built in." },
      ],
    },
    defaultSettings: {},
  },
  RichText: {
    label: "Rich Editorial / Text Block",
    icon: FileText,
    description: "Long-form editorial copy, leadership manifestos, or detailed methodology.",
    defaultContent: {
      body: "Nexora combines cutting-edge AI automation with enterprise-grade attribution to ensure every marketing dollar translates into verifiable pipeline velocity.",
    },
    defaultSettings: {},
  },
  Testimonials: {
    label: "Client Testimonials & Proof",
    icon: Star,
    description: "Enterprise customer reviews, star ratings, quotes, and verified client badges.",
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
          quote: "The automated audience modeling transformed our conversion rates.",
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
    label: "Pricing & Investment Tiers",
    icon: CreditCard,
    description: "Transparent tiered packages with monthly/annual toggle and feature checklist.",
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
};

export const PagesListPage: React.FC = () => {
  const { hasPermission } = useAuth();

  // View Mode: 'visual' (Split Live Studio) or 'directory' (Standard Management Table)
  const [viewMode, setViewMode] = useState<"visual" | "directory">("visual");

  // Viewport Simulator
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState<number>(Date.now());

  // Search & Pagination for directory view
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const newLocale = "en";
  const [createError, setCreateError] = useState("");

  // RTK Queries
  const { data: pagesData, refetch: refetchPages } = useGetPagesQuery({
    page,
    pageSize: 50,
    search: search || undefined,
  });

  const { data: siteSettings, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  // Active Selected Page for Visual Studio
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  useEffect(() => {
    if (pagesData?.items && pagesData.items.length > 0 && !selectedPageId) {
      const homePage = pagesData.items.find((p) => p.slug === "home") || pagesData.items[0];
      if (homePage) setSelectedPageId(homePage.id);
    }
  }, [pagesData, selectedPageId]);

  const { data: activePageDetail, refetch: refetchPageDetail } = useGetPageByIdQuery(
    selectedPageId,
    { skip: !selectedPageId }
  );

  // In-Memory Blocks State for the active visual page
  const [pageBlocks, setPageBlocks] = useState<CmsBlock[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [pageVersionToken, setPageVersionToken] = useState("");
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);
  const [addBlockPaletteOpen, setAddBlockPaletteOpen] = useState(false);

  const [saveDraft, { isLoading: isSavingDraft }] = useSavePageDraftMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishPageMutation();
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();

  // CMS Page Version History & Rollback
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const {
    data: pageVersions = [],
    isLoading: isLoadingVersions,
    refetch: refetchVersions,
  } = useGetPageVersionsQuery(selectedPageId, { skip: !selectedPageId });
  const [rollbackPage, { isLoading: isRollingBack }] = useRollbackPageMutation();

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (activePageDetail) {
      setPageBlocks(activePageDetail.blocks ? [...activePageDetail.blocks] : []);
      setPageTitle(activePageDetail.title);
      setPageVersionToken(activePageDetail.versionToken || "");
    }
  }, [activePageDetail]);

  // Global Section Toggles
  const sectionVisibility = (() => {
    try {
      return siteSettings?.sectionVisibilityJson
        ? JSON.parse(siteSettings.sectionVisibilityJson)
        : {
            showHero: true,
            showMetricsBar: true,
            showCapabilitiesGrid: true,
            showBlogInsights: true,
            showCtaBanner: true,
            showFaq: true,
          };
    } catch {
      return {
        showHero: true,
        showMetricsBar: true,
        showCapabilitiesGrid: true,
        showBlogInsights: true,
        showCtaBanner: true,
        showFaq: true,
      };
    }
  })();

  const handleToggleGlobalSection = async (key: string) => {
    if (!siteSettings) return;
    const current = { ...sectionVisibility, [key]: !sectionVisibility[key] };
    try {
      await updateSettings({
        companyName: siteSettings.companyName,
        legalName: siteSettings.legalName,
        supportEmail: siteSettings.supportEmail,
        supportPhone: siteSettings.supportPhone,
        address: siteSettings.address,
        defaultRegion: siteSettings.defaultRegion,
        supportedRegions: siteSettings.supportedRegions,
        timeZoneId: siteSettings.timeZoneId,
        versionToken: siteSettings.versionToken,
        smtpHost: siteSettings.smtpHost,
        smtpPort: siteSettings.smtpPort,
        smtpUseSsl: siteSettings.smtpUseSsl,
        smtpUserName: siteSettings.smtpUserName,
        smtpPassword: siteSettings.smtpPassword,
        smtpFromEmail: siteSettings.smtpFromEmail,
        smtpFromName: siteSettings.smtpFromName,
        sectionVisibilityJson: JSON.stringify(current),
      }).unwrap();

      refetchSettings();
      setPreviewKey(Date.now());
      setFeedback({
        type: "success",
        message: `Section toggle updated! Live preview refreshed.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to toggle section visibility.");
    }
  };

  const handleToggleBlockEnabled = (index: number) => {
    const updated = [...pageBlocks];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        enabled: !updated[index].enabled,
      };
      setPageBlocks(updated);
    }
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= pageBlocks.length) return;
    const updated = [...pageBlocks];
    const [moved] = updated.splice(index, 1);
    if (moved) {
      updated.splice(target, 0, moved);
      setPageBlocks(updated);
      setExpandedBlockIndex(target);
    }
  };

  const handleDeleteBlock = (index: number) => {
    if (!window.confirm("Remove this section from the page?")) return;
    const updated = pageBlocks.filter((_, i) => i !== index);
    setPageBlocks(updated);
    if (expandedBlockIndex === index) {
      setExpandedBlockIndex(null);
    } else if (expandedBlockIndex !== null && expandedBlockIndex > index) {
      setExpandedBlockIndex(expandedBlockIndex - 1);
    }
  };

  const handleAddBlock = (type: string) => {
    const template = BLOCK_TEMPLATES[type];
    if (!template) return;

    const newBlock: CmsBlock = {
      id: `blk_${type.toLowerCase()}_${Date.now()}`,
      type,
      schemaVersion: 1,
      settings: JSON.parse(JSON.stringify(template.defaultSettings)),
      content: JSON.parse(JSON.stringify(template.defaultContent)),
      enabled: true,
      regionFilter: null,
    };

    const updated = [...pageBlocks, newBlock];
    setPageBlocks(updated);
    setExpandedBlockIndex(updated.length - 1);
    setAddBlockPaletteOpen(false);
  };

  const updateBlockContent = (index: number, key: string, value: unknown) => {
    const updated = [...pageBlocks];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        content: {
          ...updated[index].content,
          [key]: value,
        },
      };
      setPageBlocks(updated);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedPageId) return;
    try {
      const res = await saveDraft({
        id: selectedPageId,
        body: {
          title: pageTitle,
          blocks: pageBlocks,
          versionToken: pageVersionToken,
        },
      }).unwrap();

      setPageVersionToken(res.versionToken);
      refetchPageDetail();
      setPreviewKey(Date.now());
      setFeedback({
        type: "success",
        message: "Page draft saved successfully! Live preview updated.",
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      alert(errObj?.data?.error || "Failed to save draft.");
    }
  };

  const handlePublish = async () => {
    if (!selectedPageId) return;
    if (!window.confirm("Publish changes to the live website right now?")) return;

    try {
      await handleSaveDraft();
      await publishPage(selectedPageId).unwrap();
      refetchPageDetail();
      refetchPages();
      setPreviewKey(Date.now());
      setFeedback({
        type: "success",
        message: "Page published live! Public website now serves this updated version.",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      alert(errObj?.data?.error || "Failed to publish page.");
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!selectedPageId) return;
    if (
      !window.confirm(
        `Rollback to Version ${versionNumber}? Unsaved draft changes will be replaced.`
      )
    )
      return;

    try {
      await rollbackPage({
        pageId: selectedPageId,
        request: { versionNumber },
      }).unwrap();
      setShowVersionsModal(false);
      refetchPageDetail();
      refetchPages();
      refetchVersions();
      setPreviewKey(Date.now());
      setFeedback({
        type: "success",
        message: `Successfully restored Page Version ${versionNumber}!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      alert(errObj?.data?.error || `Failed to rollback to version ${versionNumber}.`);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!newSlug.trim() || !newTitle.trim()) {
      setCreateError("Title and URL slug are required.");
      return;
    }

    try {
      const res = await createPage({
        slug: newSlug.trim().replace(/^\//, ""),
        title: newTitle.trim(),
        locale: newLocale || "en",
      }).unwrap();

      setShowCreateModal(false);
      setNewSlug("");
      setNewTitle("");
      refetchPages();
      setSelectedPageId(res.pageId);
      setViewMode("visual");
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setCreateError(errorObj?.data?.error || "Failed to create page.");
    }
  };

  const selectedPageSlug = activePageDetail?.slug || "home";
  const previewUrl = `http://localhost:3000${selectedPageSlug === "home" ? "" : `/${selectedPageSlug}`}?preview=true&key=${previewKey}`;

  return (
    <div className="space-y-5 w-full max-w-[2400px] mx-auto">
      {/* Top Navigation & View Mode Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0c1222] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Website Visual Studio & CMS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive split-screen visual page builder with real-time website preview and instant section toggles.
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Create Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("visual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "visual"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Visual Live Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "directory"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>All Pages ({pagesData?.totalCount ?? 0})</span>
            </button>
          </div>

          {hasPermission("pages.edit") && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Page</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* VIEW MODE 1: VISUAL STUDIO SPLIT SCREEN */}
      {viewMode === "visual" && (
        <div className="space-y-4">
          {/* Visual Studio Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-[#0c1222] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            {/* Page Selector Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Editing Page:
              </span>
              <select
                value={selectedPageId}
                onChange={(e) => {
                  setSelectedPageId(e.target.value);
                  setExpandedBlockIndex(null);
                }}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(pagesData?.items || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (/{p.slug})
                  </option>
                ))}
              </select>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activePageDetail?.status === 1
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}
              >
                {activePageDetail?.status === 1 ? "Live" : "Draft"}
              </span>
            </div>

            {/* Center Device Simulator Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start lg:self-center">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewport === "desktop"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Desktop View (1920px Full Width)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewport === "tablet"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewport === "mobile"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewKey(Date.now())}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                title="Reload Live Iframe Preview"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Live</span>
              </a>

              <button
                type="button"
                onClick={() => setShowVersionsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
                title="Version History & 1-Click Rollback"
              >
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Versions</span>
                {pageVersions.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold">
                    {pageVersions.length}
                  </span>
                )}
              </button>

              {hasPermission("pages.edit") && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
                </button>
              )}

              {hasPermission("pages.publish") && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPublishing ? "Publishing..." : "Publish Live"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Studio Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Section Controls & In-Place Editor (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Global Section Toggles Quick Bar (for Home) */}
              {selectedPageSlug === "home" && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Global Section Visibility Toggles
                    </span>
                    <span className="text-[10px] text-slate-400">Instant Live Sync</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "showHero", label: "Hero Banner" },
                      { key: "showMetricsBar", label: "Key Metrics" },
                      { key: "showCapabilitiesGrid", label: "Capabilities" },
                      { key: "showBlogInsights", label: "Blog Insights" },
                      { key: "showCtaBanner", label: "CTA Banner" },
                      { key: "showFaq", label: "FAQ Accordion" },
                    ].map((item) => {
                      const isVisible = sectionVisibility[item.key] !== false;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleToggleGlobalSection(item.key)}
                          className={`flex items-center justify-between p-2 rounded-xl border transition ${
                            isVisible
                              ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-300 font-semibold"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isVisible ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sections Tree for Active Page */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Page Sections Tree ({pageBlocks.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Toggle visibility, reorder, or click to edit section copy live.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddBlockPaletteOpen(!addBlockPaletteOpen)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/60 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                {/* Add Section Palette Drawer */}
                {addBlockPaletteOpen && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Choose Component To Insert:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(BLOCK_TEMPLATES).map(([type, template]) => {
                        const Icon = template.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleAddBlock(type)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] hover:border-indigo-500 hover:shadow-sm text-left transition flex items-start gap-2.5"
                          >
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {template.label}
                              </span>
                              <span className="text-[10px] text-slate-500 line-clamp-1 block">
                                {template.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Blocks List */}
                <div className="space-y-2.5 pt-1">
                  {pageBlocks.map((block, idx) => {
                    const isExpanded = expandedBlockIndex === idx;
                    const template = BLOCK_TEMPLATES[block.type];
                    const Icon = template?.icon || Layout;

                    return (
                      <div
                        key={block.id}
                        className={`rounded-xl border transition-all ${
                          block.enabled
                            ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                            : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 opacity-60"
                        }`}
                      >
                        {/* Section Header Card */}
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div
                            onClick={() => setExpandedBlockIndex(isExpanded ? null : idx)}
                            className="flex items-center gap-3 flex-1 cursor-pointer truncate"
                          >
                            <span className="font-mono text-[10px] font-bold text-slate-400 w-4">
                              #{idx + 1}
                            </span>
                            <div
                              className={`p-1.5 rounded-lg ${
                                block.enabled
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                                {template?.label || block.type}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {block.id}
                              </span>
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlockEnabled(idx)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                                block.enabled
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                              }`}
                              title={block.enabled ? "Section is Visible" : "Section is Hidden"}
                            >
                              {block.enabled ? "Visible" : "Hidden"}
                            </button>

                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                              title="Move Section Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, "down")}
                              disabled={idx === pageBlocks.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                              title="Move Section Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(idx)}
                              className="p-1 rounded text-slate-400 hover:text-red-600"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Expand Toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedBlockIndex(isExpanded ? null : idx)}
                              className="p-1 rounded text-slate-400"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Inline Real-Time Field Editor */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-xl space-y-3 text-xs">
                            {/* Hero Inputs */}
                            {block.type === "Hero" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={String(block.content?.headline || "")}
                                    onChange={(e) => updateBlockContent(idx, "headline", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Subheadline
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={String(block.content?.subheadline || "")}
                                    onChange={(e) => updateBlockContent(idx, "subheadline", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                      CTA Button Text
                                    </label>
                                    <input
                                      type="text"
                                      value={String(block.content?.primaryCtaText || "")}
                                      onChange={(e) => updateBlockContent(idx, "primaryCtaText", e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                      CTA Button Link
                                    </label>
                                    <input
                                      type="text"
                                      value={String(block.content?.primaryCtaLink || "")}
                                      onChange={(e) => updateBlockContent(idx, "primaryCtaLink", e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* CTA Inputs */}
                            {block.type === "CTA" && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Banner Headline
                                  </label>
                                  <input
                                    type="text"
                                    value={String(block.content?.headline || "")}
                                    onChange={(e) => updateBlockContent(idx, "headline", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                      Button Label
                                    </label>
                                    <input
                                      type="text"
                                      value={String(block.content?.buttonText || "")}
                                      onChange={(e) => updateBlockContent(idx, "buttonText", e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                      Button Target
                                    </label>
                                    <input
                                      type="text"
                                      value={String(block.content?.buttonLink || "")}
                                      onChange={(e) => updateBlockContent(idx, "buttonLink", e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* RichText Inputs */}
                            {block.type === "RichText" && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  Editorial Body Copy
                                </label>
                                <textarea
                                  rows={4}
                                  value={String(block.content?.body || "")}
                                  onChange={(e) => updateBlockContent(idx, "body", e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                                />
                              </div>
                            )}

                            {/* Generic JSON fallback */}
                            {!["Hero", "CTA", "RichText"].includes(block.type) && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  Section JSON Content
                                </label>
                                <textarea
                                  rows={4}
                                  value={JSON.stringify(block.content, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value);
                                      const updated = [...pageBlocks];
                                      const cur = updated[idx];
                                      if (cur) {
                                        updated[idx] = { ...cur, content: parsed };
                                        setPageBlocks(updated);
                                      }
                                    } catch {
                                      // typing JSON
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                                />
                              </div>
                            )}

                            <div className="flex justify-end pt-1">
                              <span className="text-[10px] text-slate-400">
                                Click &quot;Save Draft&quot; above to commit changes to the live iframe.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {pageBlocks.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      No custom blocks attached to this page. Click &quot;Add Section&quot; to build.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Interactive Website Simulator (7 cols) */}
            <div className="lg:col-span-7 sticky top-20 space-y-3">
              {/* Browser Mockup Chrome */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-900 shadow-2xl overflow-hidden">
                {/* Simulated Browser Address Bar */}
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>

                  <div className="flex-1 max-w-md mx-auto flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 truncate">
                    <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate">{previewUrl}</span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-400 hidden sm:block">
                    {viewport === "desktop" ? "1920px (Desktop)" : viewport === "tablet" ? "768px (Tablet)" : "375px (Mobile)"}
                  </div>
                </div>

                {/* Device Frame Wrapper */}
                <div className="bg-slate-950/80 p-2 sm:p-4 flex items-center justify-center min-h-[700px] overflow-hidden">
                  <div
                    className={`transition-all duration-300 shadow-2xl overflow-hidden rounded-xl bg-white ${
                      viewport === "desktop"
                        ? "w-full h-[750px]"
                        : viewport === "tablet"
                        ? "w-[768px] h-[750px] border-4 border-slate-800"
                        : "w-[375px] h-[720px] border-8 border-slate-800 rounded-3xl"
                    }`}
                  >
                    <iframe
                      key={previewKey}
                      src={previewUrl}
                      title="Website Live Interactive Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DIRECTORY TABLE (All Pages & SEO Meta) */}
      {viewMode === "directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#0c1222] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <input
              type="text"
              placeholder="Search pages by title or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="text-xs text-slate-500">
              Total: <span className="font-bold text-slate-900 dark:text-white">{pagesData?.totalCount ?? 0}</span> pages
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c1222] shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5 text-left">Page Title</th>
                  <th className="px-6 py-3.5 text-left">Slug / Route</th>
                  <th className="px-6 py-3.5 text-left">Locale</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {(pagesData?.items || []).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPageId(p.id);
                          setViewMode("visual");
                        }}
                        className="hover:underline text-indigo-600 dark:text-indigo-400 text-left font-bold"
                      >
                        {p.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      /{p.slug}
                    </td>
                    <td className="px-6 py-4 uppercase font-semibold text-slate-600 dark:text-slate-400">
                      {p.locale}
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {p.updatedAtUtc ? new Date(p.updatedAtUtc).toLocaleDateString() : new Date(p.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPageId(p.id);
                          setViewMode("visual");
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition"
                      >
                        Open Studio
                      </button>
                      <Link
                        to={`/cms/pages/${p.id}/edit`}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 transition"
                      >
                        Edit SEO
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create New Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create New Website Page
            </h3>
            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 text-xs rounded-xl font-medium">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                    }
                  }}
                  placeholder="e.g. Enterprise Security & Architecture"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Route / Slug *
                </label>
                <input
                  type="text"
                  required
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. enterprise-security"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {isCreating ? "Creating..." : "Create & Open Studio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History & Rollback Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Version History & Rollback</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect immutable page versions and rollback to any historical point with 1-click.
                </p>
              </div>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="hidden" /> {/* Keep icon tree clean */}
                <span className="text-sm font-bold">✕</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingVersions ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Loading version timeline...
                </div>
              ) : pageVersions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No previous versions recorded for this page yet. Revisions are created automatically whenever drafts are saved or published.
                </div>
              ) : (
                <div className="space-y-3">
                  {pageVersions.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            Version {v.versionNumber}
                          </span>
                          {v.isPublished && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Published Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {v.note || "Automated draft snapshot"}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(v.createdAtUtc).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRollback(v.versionNumber)}
                        disabled={isRollingBack}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVersionsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
