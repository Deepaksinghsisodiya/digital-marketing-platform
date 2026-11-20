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
  Upload,
  Briefcase,
  TrendingUp,
  Award,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useSavePageDraftMutation,
  usePublishPageMutation,
  useUploadMediaMutation,
} from "../../store/api/adminApi";
import type { CmsBlock } from "../../types";

export interface CaseStudyItem {
  id: string;
  title: string;
  client: string;
  category: string;
  metric: string;
  metricLabel?: string;
  summary: string;
  imageUrl?: string;
  clientLogoUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  enabled: boolean;
}

// Yup Validation Schema
export const caseStudySchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required("Project / Case Study title is required.")
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title cannot exceed 120 characters."),
  client: yup
    .string()
    .trim()
    .required("Client name is required.")
    .max(80, "Client name cannot exceed 80 characters."),
  category: yup
    .string()
    .trim()
    .required("Industry / Category is required.")
    .max(60, "Category cannot exceed 60 characters."),
  metric: yup
    .string()
    .trim()
    .required("Key commercial metric is required (e.g. +340%, 4.2x ROAS).")
    .max(40, "Metric cannot exceed 40 characters."),
  metricLabel: yup
    .string()
    .trim()
    .max(60, "Metric label cannot exceed 60 characters.")
    .optional(),
  summary: yup
    .string()
    .trim()
    .required("Executive summary / results description is required.")
    .min(10, "Summary must be at least 10 characters.")
    .max(800, "Summary cannot exceed 800 characters."),
  imageUrl: yup
    .string()
    .trim()
    .test(
      "valid-img",
      "Image must be a valid path (/...) or URL (https://...)",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
    )
    .optional(),
  caseStudyUrl: yup
    .string()
    .trim()
    .test(
      "valid-url",
      "URL must start with /, http://, or https://",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
    )
    .optional(),
  featured: yup.boolean().required(),
  enabled: yup.boolean().required(),
});

export const CaseStudiesPage: React.FC = () => {
  // 1. Locate Home or Our Work page
  const { data: pagesData, isLoading: isLoadingPages } = useGetPagesQuery({
    pageSize: 50,
  });

  const targetSummary =
    (pagesData?.items || []).find((p) => p.slug === "case-studies") ||
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
  const [uploadMedia, { isLoading: isUploadingMedia }] =
    useUploadMediaMutation();

  // State
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(true);
  const [sectionTitle, setSectionTitle] = useState<string>(
    "Proven Commercial Outcomes & Case Studies",
  );
  const [sectionSubtitle, setSectionSubtitle] = useState<string>(
    "Explore how Nexora delivers verifiable pipeline, sub-second CWV engineering, and algorithmic ROAS.",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [caseStudyToDelete, setCaseStudyToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Form Modal State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Form Fields
  const [formTitle, setFormTitle] = useState<string>("");
  const [formClient, setFormClient] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("B2B SaaS");
  const [formMetric, setFormMetric] = useState<string>("");
  const [formMetricLabel, setFormMetricLabel] = useState<string>("");
  const [formSummary, setFormSummary] = useState<string>("");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formCaseStudyUrl, setFormCaseStudyUrl] = useState<string>("");
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Load from Page Blocks
  useEffect(() => {
    if (!pageDetail) return;
    const foundBlock = pageDetail.blocks.find(
      (b) =>
        b.type.toLowerCase() === "casestudies" ||
        b.type.toLowerCase() === "portfolio" ||
        b.type.toLowerCase() === "bentogrid",
    );

    if (foundBlock) {
      setSectionEnabled(foundBlock.enabled !== false);
      const content = foundBlock.content || {};
      if (content.sectionTitle) setSectionTitle(content.sectionTitle as string);
      if (content.sectionSubtitle)
        setSectionSubtitle(content.sectionSubtitle as string);

      const raw = Array.isArray(content.caseStudies)
        ? content.caseStudies
        : [];
      if (raw.length > 0) {
        setCaseStudies(
          raw.map((item, idx) => ({
            id: (item.id as string) || `cs-${Date.now()}-${idx + 1}`,
            title: (item.title as string) || "Case Study",
            client: (item.client as string) || "Enterprise Client",
            category: (item.category as string) || "B2B Technology",
            metric: (item.metric as string) || "+300%",
            metricLabel: (item.metricLabel as string) || "Pipeline Velocity",
            summary: (item.summary as string) || "",
            imageUrl: (item.imageUrl as string) || "",
            clientLogoUrl: (item.clientLogoUrl as string) || "",
            caseStudyUrl: (item.caseStudyUrl as string) || "",
            featured: item.featured === true,
            enabled: item.enabled !== false,
          })),
        );
      } else {
        // Fallback initial case studies
        setCaseStudies([
          {
            id: "cs-seed-1",
            title: "Scaling Enterprise Pipeline to $14.2M Influenced Revenue",
            client: "Apex Cloud Enterprise",
            category: "B2B SaaS",
            metric: "+340%",
            metricLabel: "Pipeline Velocity",
            summary:
              "Engineered high-intent programmatic SEO architecture and account-based retargeting funnels across 4 geographies.",
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            caseStudyUrl: "/case-studies/apex-cloud",
            featured: true,
            enabled: true,
          },
          {
            id: "cs-seed-2",
            title: "4.2x ROAS & 38% CAC Reduction Across Global E-Commerce",
            client: "UrbanLux Apparel",
            category: "E-Commerce & Retail",
            metric: "4.2x ROAS",
            metricLabel: "Algorithmic Meta & Google Paid Ads",
            summary:
              "Deployed machine-learning bid clusters, automated product feed optimization, and high-converting headless checkout funnels.",
            imageUrl:
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            caseStudyUrl: "/case-studies/urbanlux",
            featured: true,
            enabled: true,
          },
          {
            id: "cs-seed-3",
            title: "Sub-Second CWV Migration for 500,000+ Monthly Visitors",
            client: "Synapse Financial Networks",
            category: "FinTech & Banking",
            metric: "< 0.8s CWV",
            metricLabel: "Core Web Vitals & SLA",
            summary:
              "Architected a Next.js 15 enterprise web portal with server-side generation, sub-millisecond edge caching, and WCAG AA compliance.",
            imageUrl:
              "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
            caseStudyUrl: "/case-studies/synapse-fintech",
            featured: false,
            enabled: true,
          },
        ]);
      }
    } else {
      // Default initial items
      setCaseStudies([
        {
          id: "cs-seed-1",
          title: "Scaling Enterprise Pipeline to $14.2M Influenced Revenue",
          client: "Apex Cloud Enterprise",
          category: "B2B SaaS",
          metric: "+340%",
          metricLabel: "Pipeline Velocity",
          summary:
            "Engineered high-intent programmatic SEO architecture and account-based retargeting funnels across 4 geographies.",
          imageUrl:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          caseStudyUrl: "/case-studies/apex-cloud",
          featured: true,
          enabled: true,
        },
        {
          id: "cs-seed-2",
          title: "4.2x ROAS & 38% CAC Reduction Across Global E-Commerce",
          client: "UrbanLux Apparel",
          category: "E-Commerce & Retail",
          metric: "4.2x ROAS",
          metricLabel: "Algorithmic Meta & Google Paid Ads",
          summary:
            "Deployed machine-learning bid clusters, automated product feed optimization, and high-converting headless checkout funnels.",
          imageUrl:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          caseStudyUrl: "/case-studies/urbanlux",
          featured: true,
          enabled: true,
        },
        {
          id: "cs-seed-3",
          title: "Sub-Second CWV Migration for 500,000+ Monthly Visitors",
          client: "Synapse Financial Networks",
          category: "FinTech & Banking",
          metric: "< 0.8s CWV",
          metricLabel: "Core Web Vitals & SLA",
          summary:
            "Architected a Next.js 15 enterprise web portal with server-side generation, sub-millisecond edge caching, and WCAG AA compliance.",
          imageUrl:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
          caseStudyUrl: "/case-studies/synapse-fintech",
          featured: false,
          enabled: true,
        },
      ]);
    }
  }, [pageDetail]);

  // Section Toggle
  const handleToggleSection = () => {
    const nextState = !sectionEnabled;
    setSectionEnabled(nextState);
    setHasUnsavedChanges(true);
    toast.info(
      nextState
        ? "Case Studies section marked ACTIVE. Click 'Save Changes' to publish."
        : "Case Studies section marked INACTIVE. Click 'Save Changes' to publish.",
    );
  };

  // Item Active/Deactive Toggle
  const handleToggleItemStatus = (id: string) => {
    const target = caseStudies.find((c) => c.id === id);
    const updated = caseStudies.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c,
    );
    setCaseStudies(updated);
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
      (direction === "down" && index === caseStudies.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...caseStudies];
    const [moved] = reordered.splice(index, 1);
    if (moved) {
      reordered.splice(targetIdx, 0, moved);
      setCaseStudies(reordered);
      setHasUnsavedChanges(true);
    }
  };

  // Delete
  const handleDelete = (id: string, title: string) => {
    setCaseStudyToDelete({ id, title });
  };

  const confirmDeleteCaseStudy = () => {
    if (!caseStudyToDelete) return;
    setCaseStudies((prev) => prev.filter((c) => c.id !== caseStudyToDelete.id));
    setHasUnsavedChanges(true);
    toast.success(`Case study "${caseStudyToDelete.title}" removed. Click 'Save Changes' to publish.`);
    setCaseStudyToDelete(null);
  };

  // Open Modal (Add)
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle("");
    setFormClient("");
    setFormCategory("B2B SaaS");
    setFormMetric("");
    setFormMetricLabel("");
    setFormSummary("");
    setFormImageUrl("");
    setFormCaseStudyUrl("");
    setFormFeatured(false);
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Modal (Edit)
  const handleOpenEdit = (item: CaseStudyItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormClient(item.client);
    setFormCategory(item.category);
    setFormMetric(item.metric);
    setFormMetricLabel(item.metricLabel || "");
    setFormSummary(item.summary);
    setFormImageUrl(item.imageUrl || "");
    setFormCaseStudyUrl(item.caseStudyUrl || "");
    setFormFeatured(item.featured);
    setFormEnabled(item.enabled !== false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      title: formTitle.trim(),
      client: formClient.trim(),
      category: formCategory.trim(),
      metric: formMetric.trim(),
      metricLabel: formMetricLabel.trim() || undefined,
      summary: formSummary.trim(),
      imageUrl: formImageUrl.trim() || undefined,
      caseStudyUrl: formCaseStudyUrl.trim() || undefined,
      featured: formFeatured,
      enabled: formEnabled,
    };

    try {
      await caseStudySchema.validate(payload, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path) {
            errors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(errors);
        toast.error("Please fix form errors before saving.");
        return;
      }
    }

    if (editingId) {
      setCaseStudies((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                ...payload,
              }
            : c,
        ),
      );
      toast.success("Case study updated in staging list.");
    } else {
      const newItem: CaseStudyItem = {
        id: `cs-${Date.now()}`,
        ...payload,
      };
      setCaseStudies((prev) => [newItem, ...prev]);
      toast.success("New case study added to staging list.");
    }

    setHasUnsavedChanges(true);
    setIsFormOpen(false);
  };

  // Upload Thumbnail
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadMedia(formData).unwrap();
      const directUrl =
        res.url ||
        (res.id ? `/api/v1/public/media/${res.id}/download` : "");
      if (directUrl) {
        setFormImageUrl(directUrl);
        toast.success("Case study image uploaded successfully!");
      }
    } catch {
      toast.error("Failed to upload image.");
    }
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
          b.type.toLowerCase() === "casestudies" ||
          b.type.toLowerCase() === "portfolio" ||
          b.type.toLowerCase() === "bentogrid",
      );

      const blockPayload: CmsBlock = {
        id: blockIdx >= 0 && blocks[blockIdx] ? blocks[blockIdx].id : `blk_casestudies_${Date.now()}`,
        type: "BentoGrid",
        schemaVersion: 1,
        enabled: sectionEnabled,
        settings: { theme: "light" },
        content: {
          sectionTitle,
          sectionSubtitle,
          caseStudies,
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
        "Case studies saved and published live to website successfully!",
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to save changes. Please check permissions.";
      toast.error(`Save Failed: ${errorMsg}`);
    }
  };

  // Filtered List
  const filtered = caseStudies.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metric.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "all" ||
      item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const activeCount = caseStudies.filter((c) => c.enabled).length;
  const featuredCount = caseStudies.filter((c) => c.featured && c.enabled).length;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Case Studies &amp; Portfolio
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {caseStudies.length} Projects
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Showcase enterprise outcomes, ROAS multipliers, client transformations, and case studies.
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
            <span>Add Case Study</span>
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
              You have unsaved changes in your case studies list. Click &quot;Save
              Changes&quot; to push updates to the live site.
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

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            Total Case Studies
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {caseStudies.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-emerald-600 font-semibold uppercase">
            Live / Active
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {activeCount}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-amber-500 font-semibold uppercase">
            Featured Highlights
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <span>{featuredCount}</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-blue-500 font-semibold uppercase">
            Top ROAS Multiplier
          </span>
          <div className="text-2xl font-black text-blue-500 mt-1 font-mono">
            4.2x
          </div>
        </div>
      </div>

      {/* 4. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client name, or metric..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {["all", "B2B SaaS", "E-Commerce & Retail", "FinTech & Banking"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ),
          )}
        </div>
      </div>

      {/* 5. Table Listing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5 w-12 text-center">Order</th>
                <th className="px-4 py-3.5">Project / Case Study</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Key Metric Outcome</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5 text-center">Status Toggle</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingPages || isLoadingDetail ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading case studies from CMS...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No case studies found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
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
                            disabled={index === caseStudies.length - 1}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Project & Client */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-10 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Briefcase className="w-5 h-5" />
                            </div>
                          )}
                          <div className="max-w-sm">
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Client: <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.client}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Metric */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="inline-block text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {item.metric}
                          </span>
                          {item.metricLabel && (
                            <div className="text-[10px] text-slate-500">
                              {item.metricLabel}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Featured Star */}
                      <td className="px-4 py-3.5 text-center">
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
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
                            title="Edit Case Study"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition"
                            title="Delete Case Study"
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
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Case Study" : "Add New Case Study"}
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
              {/* Row 1: Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Project Title / Headline *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Scaling Enterprise Pipeline to $14.2M Influenced Revenue"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Row 2: Client & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    placeholder="e.g. Apex Cloud Enterprise"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  {formErrors.client && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.client}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Industry / Category *
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. B2B SaaS, E-Commerce, FinTech"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  {formErrors.category && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Key Metric & Metric Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Key Metric Outcome *
                  </label>
                  <input
                    type="text"
                    value={formMetric}
                    onChange={(e) => setFormMetric(e.target.value)}
                    placeholder="e.g. +340%, 4.2x ROAS, <0.8s CWV"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                  {formErrors.metric && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.metric}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Metric Sub-Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMetricLabel}
                    onChange={(e) => setFormMetricLabel(e.target.value)}
                    placeholder="e.g. Pipeline Velocity, Organic Search Growth"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Summary */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Executive Summary / Deliverables *
                </label>
                <textarea
                  rows={4}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Detail the challenges tackled, architectural solutions, and commercial impact..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
                {formErrors.summary && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.summary}
                  </p>
                )}
              </div>

              {/* Row 5: Thumbnail Image */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Case Study Thumbnail Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="/api/v1/public/media/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-slate-700 font-bold transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Row 6: Toggles inside Modal */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-6">
                  {/* Featured Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700">Mark as Featured Highlight</span>
                  </label>

                  {/* Active Toggle */}
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  {editingId ? "Update Case Study" : "Add Case Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Case Study Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(caseStudyToDelete)}
        title="Delete Case Study"
        description={
          caseStudyToDelete
            ? `Are you sure you want to remove "${caseStudyToDelete.title}" from the portfolio? You must click 'Save Changes' to push the update live.`
            : ""
        }
        confirmText="Remove Case Study"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteCaseStudy}
        onClose={() => setCaseStudyToDelete(null)}
      />
    </div>
  );
};
export default CaseStudiesPage;
