import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "../../utils/toast";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Save,
  RefreshCw,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  TrendingUp,
  Code2,
  Workflow,
  ArrowRight,
  ExternalLink,
  Layers,
  Wrench,
} from "lucide-react";
import {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useSavePageDraftMutation,
  usePublishPageMutation,
} from "../../store/api/adminApi";
import type { CmsBlock } from "../../types";

export interface ServiceItem {
  id: string;
  title: string;
  pillar: "Digital Growth" | "Technology Solutions" | "AI & Automation";
  description: string;
  link: string;
  badge?: string;
  deliverables?: string[];
  startingPrice?: string;
  enabled: boolean;
}

const PILLAR_OPTIONS: Array<ServiceItem["pillar"]> = [
  "Digital Growth",
  "Technology Solutions",
  "AI & Automation",
];

// Yup Validation Schema
export const serviceSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required("Service title is required.")
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title cannot exceed 100 characters."),
  pillar: yup
    .string()
    .oneOf(PILLAR_OPTIONS, "Please select a valid capability pillar.")
    .required("Capability pillar is required."),
  description: yup
    .string()
    .trim()
    .required("Service description is required.")
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  link: yup
    .string()
    .trim()
    .test(
      "valid-link",
      "Link must start with /, http://, or https://",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
    )
    .required("Target link / slug is required."),
  badge: yup.string().trim().max(30).optional(),
  startingPrice: yup.string().trim().max(40).optional(),
  enabled: yup.boolean().required(),
});

export const ServicesCatalogPage: React.FC = () => {
  // 1. Locate Home or Services page
  const { data: pagesData, isLoading: isLoadingPages } = useGetPagesQuery({
    pageSize: 50,
  });

  const targetSummary =
    (pagesData?.items || []).find((p) => p.slug === "services") ||
    (pagesData?.items || []).find((p) => p.slug === "home");
  const targetPageId = targetSummary?.id || "";

  // 2. Fetch full detail of Page
  const {
    data: pageDetail,
    isLoading: isLoadingDetail,
    refetch: refetchPage,
  } = useGetPageByIdQuery(targetPageId, {
    skip: !targetPageId,
  });

  const [saveDraft, { isLoading: isSaving }] = useSavePageDraftMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishPageMutation();

  // State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(true);
  const [sectionTitle, setSectionTitle] = useState<string>(
    "Comprehensive Digital Capabilities",
  );
  const [sectionSubtitle, setSectionSubtitle] = useState<string>(
    "Engineered from the ground up for measurable commercial pipeline and enterprise resilience.",
  );
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Form Modal State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Form Fields
  const [formTitle, setFormTitle] = useState<string>("");
  const [formPillar, setFormPillar] =
    useState<ServiceItem["pillar"]>("Digital Growth");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formLink, setFormLink] = useState<string>("");
  const [formBadge, setFormBadge] = useState<string>("");
  const [formStartingPrice, setFormStartingPrice] = useState<string>("");
  const [formDeliverablesRaw, setFormDeliverablesRaw] = useState<string>("");
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Load from Page Blocks
  useEffect(() => {
    if (!pageDetail) return;
    const foundBlock = pageDetail.blocks.find(
      (b) =>
        b.type.toLowerCase() === "featuregrid" ||
        b.type.toLowerCase() === "features" ||
        b.type.toLowerCase() === "services",
    );

    if (foundBlock) {
      setSectionEnabled(foundBlock.enabled !== false);
      const content = foundBlock.content || {};
      if (content.sectionTitle) setSectionTitle(content.sectionTitle as string);
      if (content.sectionSubtitle)
        setSectionSubtitle(content.sectionSubtitle as string);

      const rawServices: Array<Partial<ServiceItem>> = Array.isArray(content.services)
        ? (content.services as ServiceItem[])
        : Array.isArray(content.features)
        ? (content.features as Array<{
            id?: string;
            title: string;
            description: string;
            pillar?: ServiceItem["pillar"];
            link?: string;
            enabled?: boolean;
          }>).map((f, idx) => ({
            id: f.id || `srv-feat-${idx + 1}`,
            title: f.title,
            pillar: f.pillar || (idx < 2 ? "Digital Growth" : idx < 4 ? "Technology Solutions" : "AI & Automation"),
            description: f.description,
            link: f.link || "/services",
            enabled: f.enabled !== false,
          }))
        : [];

      if (rawServices.length > 0) {
        setServices(
          rawServices.map((s, idx) => ({
            id: s.id || `srv-${Date.now()}-${idx + 1}`,
            title: s.title || "Service",
            pillar: s.pillar || "Digital Growth",
            description: s.description || "",
            link: s.link || "/services",
            badge: s.badge || "",
            startingPrice: s.startingPrice || "",
            deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
            enabled: s.enabled !== false,
          })),
        );
      } else {
        // Fallback initial curated offerings
        setServices(getDefaultServices());
      }
    } else {
      setServices(getDefaultServices());
    }
  }, [pageDetail]);

  function getDefaultServices(): ServiceItem[] {
    return [
      {
        id: "srv-growth-1",
        title: "Search Engine Optimization (SEO)",
        pillar: "Digital Growth",
        description:
          "High-intent commercial search architecture, schema markup, Core Web Vitals optimization, and programmatic SEO clusters.",
        link: "/services/seo",
        badge: "Organic Funnel",
        enabled: true,
      },
      {
        id: "srv-growth-2",
        title: "Paid Media (Google & Meta Ads)",
        pillar: "Digital Growth",
        description:
          "Algorithmic bid management, account-based retargeting, multi-touch attribution modeling, and verifiable ROAS scaling.",
        link: "/services/paid-media",
        badge: "Paid Ads",
        enabled: true,
      },
      {
        id: "srv-growth-3",
        title: "Conversion Rate Optimization (CRO)",
        pillar: "Digital Growth",
        description:
          "Multivariate split testing, heatmaps, form abandonment remediation, and high-converting landing page experiences.",
        link: "/services/conversion-rate-optimization",
        badge: "Funnel Tuning",
        enabled: true,
      },
      {
        id: "srv-tech-1",
        title: "Corporate Website Development",
        pillar: "Technology Solutions",
        description:
          "Next.js 15 enterprise architectures, modular headless CMS, Tailwind CSS, TypeScript, and sub-second Core Web Vitals.",
        link: "/services/web-design-development",
        badge: "Next.js 15",
        enabled: true,
      },
      {
        id: "srv-tech-2",
        title: "Custom Web Applications",
        pillar: "Technology Solutions",
        description:
          "Resilient full-stack applications, clean modular domain systems, role-based access control, and PostgreSQL databases.",
        link: "/services/custom-software",
        badge: "Full-Stack",
        enabled: true,
      },
      {
        id: "srv-tech-3",
        title: "Headless E-Commerce Development",
        pillar: "Technology Solutions",
        description:
          "High-AOV headless store architecture, ultrafast checkout funnels, ERP synchronization, and automated inventory feeds.",
        link: "/services/ecommerce",
        badge: "E-Commerce",
        enabled: true,
      },
      {
        id: "srv-ai-1",
        title: "AI Integration & Custom Agents",
        pillar: "AI & Automation",
        description:
          "Custom LLM tooling, semantic RAG search, autonomous agents, and OpenAI/Claude workflow automations.",
        link: "/services/ai-solutions",
        badge: "Agentic AI",
        enabled: true,
      },
      {
        id: "srv-ai-2",
        title: "Conversational Intake Chatbots",
        pillar: "AI & Automation",
        description:
          "Instant customer intake, intelligent CRM qualification, calendar booking, and 24/7 lead capture.",
        link: "/services/conversational-ai",
        badge: "Chatbot",
        enabled: true,
      },
      {
        id: "srv-ai-3",
        title: "Marketing Automation & CRM Sync",
        pillar: "AI & Automation",
        description:
          "Automated lead scoring, SLA routing, HubSpot/Salesforce bi-directional synchronization, and webhook pipelines.",
        link: "/services/marketing-automation-crm",
        badge: "CRM Pipelines",
        enabled: true,
      },
    ];
  }

  // Section Toggle
  const handleToggleSection = () => {
    const nextState = !sectionEnabled;
    setSectionEnabled(nextState);
    setHasUnsavedChanges(true);
    toast.info(
      nextState
        ? "Capabilities section marked ACTIVE. Click 'Save Changes' to publish."
        : "Capabilities section marked INACTIVE. Click 'Save Changes' to publish.",
    );
  };

  // Item Active/Deactive Toggle
  const handleToggleItemStatus = (id: string) => {
    const target = services.find((s) => s.id === id);
    const updated = services.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    setServices(updated);
    setHasUnsavedChanges(true);
    toast.info(
      target?.enabled
        ? `"${target.title}" deactivated. Click 'Save Changes' to publish.`
        : `"${target?.title}" activated! Click 'Save Changes' to publish.`,
    );
  };

  // Reorder
  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === services.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...services];
    const [moved] = reordered.splice(index, 1);
    if (moved) {
      reordered.splice(targetIdx, 0, moved);
      setServices(reordered);
      setHasUnsavedChanges(true);
    }
  };

  // Delete
  const handleDelete = (id: string, title: string) => {
    setServiceToDelete({ id, title });
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete) return;
    setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
    setHasUnsavedChanges(true);
    toast.success(`Service "${serviceToDelete.title}" removed. Click 'Save Changes' to publish.`);
    setServiceToDelete(null);
  };

  // Open Modal (Add)
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle("");
    setFormPillar("Digital Growth");
    setFormDescription("");
    setFormLink("/services/");
    setFormBadge("");
    setFormStartingPrice("");
    setFormDeliverablesRaw("");
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Modal (Edit)
  const handleOpenEdit = (item: ServiceItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormPillar(item.pillar);
    setFormDescription(item.description);
    setFormLink(item.link);
    setFormBadge(item.badge || "");
    setFormStartingPrice(item.startingPrice || "");
    setFormDeliverablesRaw(
      item.deliverables && item.deliverables.length > 0
        ? item.deliverables.join("\n")
        : "",
    );
    setFormEnabled(item.enabled !== false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const deliverables = formDeliverablesRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      pillar: formPillar,
      description: formDescription.trim(),
      link: formLink.trim(),
      badge: formBadge.trim() || undefined,
      startingPrice: formStartingPrice.trim() || undefined,
      deliverables,
      enabled: formEnabled,
    };

    try {
      await serviceSchema.validate(payload, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path) {
            errors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(errors);
        return;
      }
    }

    if (editingId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...payload,
              }
            : s,
        ),
      );
      toast.success("Service updated in staging list.");
    } else {
      const newItem: ServiceItem = {
        id: `srv-${Date.now()}`,
        ...payload,
      };
      setServices((prev) => [newItem, ...prev]);
      toast.success("New service added to staging list.");
    }

    setHasUnsavedChanges(true);
    setIsFormOpen(false);
  };

  // Save Draft & Publish
  const handleSaveChanges = async () => {
    if (!targetPageId || !pageDetail) {
      toast.error("Target CMS page could not be located in database.");
      return;
    }

    try {
      const blocks = [...pageDetail.blocks];
      const blockIdx = blocks.findIndex(
        (b) =>
          b.type.toLowerCase() === "featuregrid" ||
          b.type.toLowerCase() === "features" ||
          b.type.toLowerCase() === "services",
      );

      const blockPayload: CmsBlock = {
        id: blockIdx >= 0 && blocks[blockIdx] ? blocks[blockIdx].id : `blk_features_${Date.now()}`,
        type: "FeatureGrid",
        schemaVersion: 1,
        enabled: sectionEnabled,
        settings: { theme: "light" },
        content: {
          sectionTitle,
          sectionSubtitle,
          services,
          features: services.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            pillar: s.pillar,
            link: s.link,
            enabled: s.enabled,
          })),
        },
      };

      if (blockIdx >= 0) {
        blocks[blockIdx] = blockPayload;
      } else {
        blocks.push(blockPayload);
      }

      // Step 1: Save Draft
      await saveDraft({
        id: targetPageId,
        body: {
          blocks,
          versionToken: pageDetail.versionToken ?? undefined,
        },
      }).unwrap();

      // Step 2: Publish Page
      await publishPage(targetPageId).unwrap();

      setHasUnsavedChanges(false);
      await refetchPage();
      toast.success(
        "Services catalog saved and published live to website successfully!",
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to save changes. Please check permissions.";
      toast.error(`Save Failed: ${errorMsg}`);
    }
  };

  // Filtered List
  const filtered = services.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pillar.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar =
      selectedPillar === "all" || item.pillar === selectedPillar;
    return matchesSearch && matchesPillar;
  });

  const activeCount = services.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Services &amp; Capabilities Catalog
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {services.length} Services
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage the 3 Core Capabilities Pillars (Digital Growth, Technology
            Solutions, AI &amp; Automation) and individual service pages.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Section Active / Inactive Switch */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">Section:</span>
            <button
              type="button"
              role="switch"
              aria-checked={sectionEnabled}
              onClick={handleToggleSection}
              disabled={isSaving || isPublishing}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                sectionEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                  sectionEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={
                sectionEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }
            >
              {sectionEnabled ? "Active" : "Inactive"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving || isPublishing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSaving || isPublishing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving || isPublishing ? "Publishing..." : "Save Changes"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Unsaved Changes Alert Bar */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              You have unsaved changes in your services list. Click &quot;Save
              Changes&quot; to publish them live.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
          >
            Save Now
          </button>
        </div>
      )}

      {/* 3. Pillar KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            Total Services
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {services.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-emerald-600 font-semibold uppercase">
            Pillar 1: Growth
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center justify-between">
            <span>
              {services.filter((s) => s.pillar === "Digital Growth").length}
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-teal-600 font-semibold uppercase">
            Pillar 2: Technology
          </span>
          <div className="text-2xl font-black text-teal-600 mt-1 flex items-center justify-between">
            <span>
              {
                services.filter((s) => s.pillar === "Technology Solutions")
                  .length
              }
            </span>
            <Code2 className="w-5 h-5 text-teal-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-cyan-600 font-semibold uppercase">
            Pillar 3: AI &amp; Auto
          </span>
          <div className="text-2xl font-black text-cyan-600 mt-1 flex items-center justify-between">
            <span>
              {services.filter((s) => s.pillar === "AI & Automation").length}
            </span>
            <Workflow className="w-5 h-5 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* 4. Search & Pillar Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service title, pillar, or description..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {["all", ...PILLAR_OPTIONS].map((pillar) => (
            <button
              key={pillar}
              type="button"
              onClick={() => setSelectedPillar(pillar)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPillar === pillar
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {pillar === "all" ? "All Pillars" : pillar}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Table Listing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5 w-12 text-center">Order</th>
                <th className="px-4 py-3.5">Service Title &amp; Pillar</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Target Route</th>
                <th className="px-4 py-3.5 text-center">Status Toggle</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingPages || isLoadingDetail ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading services from CMS...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No services found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const pillarBadgeColor =
                    item.pillar === "Digital Growth"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.pillar === "Technology Solutions"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-cyan-50 text-cyan-700 border-cyan-200";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        !item.enabled ? "opacity-60 bg-slate-50/40" : ""
                      }`}
                    >
                      {/* Order Controls */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-20"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, "down")}
                            disabled={index === services.length - 1}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Title & Pillar */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${pillarBadgeColor}`}
                          >
                            {item.pillar}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </td>

                      {/* Target Link */}
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.link}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.enabled}
                            onClick={() => handleToggleItemStatus(item.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              item.enabled
                                ? "bg-emerald-500"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                            title={item.enabled ? "Active (Click to Deactivate)" : "Inactive (Click to Activate)"}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                                item.enabled ? "translate-x-4.5" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
                              item.enabled
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {item.enabled ? "Live" : "Hidden"}
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition"
                            title="Edit Service"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Wrench className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Service Offering" : "Add New Service Offering"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Row 1: Title & Pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Search Engine Optimization (SEO)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Capability Pillar *
                  </label>
                  <select
                    value={formPillar}
                    onChange={(e) =>
                      setFormPillar(e.target.value as ServiceItem["pillar"])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    {PILLAR_OPTIONS.map((pillar) => (
                      <option key={pillar} value={pillar}>
                        {pillar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Target Link & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Route / URL *
                  </label>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="/services/seo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                  {formErrors.link && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.link}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Core Offering, High Demand"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the capability, client outcomes, and engineering methodology..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Row 4: Bullet Deliverables */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deliverables (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formDeliverablesRaw}
                  onChange={(e) => setFormDeliverablesRaw(e.target.value)}
                  placeholder="Keyword Architecture Audit&#10;Technical CWV Remediations&#10;Monthly Attribution Reports"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              {/* Row 5: Active Toggle inside Modal */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-700">Display as Live / Active</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  {editingId ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Service Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(serviceToDelete)}
        title="Delete Service Offering"
        description={
          serviceToDelete
            ? `Are you sure you want to remove "${serviceToDelete.title}" from the capabilities catalog? You must click 'Save Changes' to push the update live.`
            : ""
        }
        confirmText="Remove Service"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteService}
        onClose={() => setServiceToDelete(null)}
      />
    </div>
  );
};
export default ServicesCatalogPage;
