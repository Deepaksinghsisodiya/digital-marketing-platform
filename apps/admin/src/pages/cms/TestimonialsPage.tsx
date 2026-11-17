/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "sonner";
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
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Upload,
  MessageSquareQuote,
  User,
  Building2,
  Briefcase,
} from "lucide-react";
import {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useSavePageDraftMutation,
  usePublishPageMutation,
  useUploadMediaMutation,
} from "../../store/api/adminApi";
import type { CmsBlock } from "../../types";

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  metricBadge?: string; // e.g. "+340% ROAS"
  verified: boolean;
  enabled: boolean;
}

// Yup Validation Schema for Testimonial Review
export const testimonialSchema = yup.object().shape({
  author: yup
    .string()
    .trim()
    .required("Client name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name cannot exceed 80 characters."),
  role: yup
    .string()
    .trim()
    .required("Job title / role is required.")
    .max(80, "Role cannot exceed 80 characters."),
  company: yup
    .string()
    .trim()
    .required("Company name is required.")
    .max(80, "Company cannot exceed 80 characters."),
  quote: yup
    .string()
    .trim()
    .required("Review / testimonial quote is required.")
    .min(10, "Quote must be at least 10 characters.")
    .max(600, "Quote cannot exceed 600 characters."),
  rating: yup
    .number()
    .min(1, "Rating must be between 1 and 5 stars.")
    .max(5, "Rating must be between 1 and 5 stars.")
    .required("Rating is required."),
  metricBadge: yup
    .string()
    .trim()
    .max(40, "Metric badge cannot exceed 40 characters.")
    .optional(),
  avatarUrl: yup
    .string()
    .trim()
    .test(
      "valid-img",
      "Avatar must be a valid path (/...) or URL (https://...)",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
    )
    .optional(),
  verified: yup.boolean().required(),
  enabled: yup.boolean().required(),
});

export const TestimonialsPage: React.FC = () => {
  // 1. Locate Home page
  const { data: pagesData, isLoading: isLoadingPages } = useGetPagesQuery({
    pageSize: 50,
  });

  const homeSummary = (pagesData?.items || []).find(
    (p) => p.slug === "home" || p.title.toLowerCase().includes("home"),
  );
  const homePageId = homeSummary?.id || "";

  // 2. Fetch full detail of Home Page
  const {
    data: pageDetail,
    isLoading: isLoadingDetail,
    refetch: refetchPage,
  } = useGetPageByIdQuery(homePageId, {
    skip: !homePageId,
  });

  const [saveDraft, { isLoading: isSaving }] = useSavePageDraftMutation();
  const [publishPage, { isLoading: isPublishing }] = usePublishPageMutation();
  const [uploadMedia, { isLoading: isUploadingMedia }] =
    useUploadMediaMutation();

  // State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(true);
  const [sectionTitle, setSectionTitle] = useState<string>(
    "Trusted by Growth-Stage Leaders",
  );
  const [sectionSubtitle, setSectionSubtitle] = useState<string>(
    "Real results from real partnerships. Here is how Nexora accelerates commercial pipeline across sectors.",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<{
    id: string;
    author: string;
  } | null>(null);

  // Form Modal State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Form Fields
  const [formAuthor, setFormAuthor] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("");
  const [formCompany, setFormCompany] = useState<string>("");
  const [formQuote, setFormQuote] = useState<string>("");
  const [formRating, setFormRating] = useState<number>(5);
  const [formMetricBadge, setFormMetricBadge] = useState<string>("");
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>("");
  const [formVerified, setFormVerified] = useState<boolean>(true);
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Load from Page Blocks
  useEffect(() => {
    if (!pageDetail) return;
    const foundBlock = pageDetail.blocks.find(
      (b) =>
        b.type.toLowerCase() === "testimonials" ||
        b.type.toLowerCase() === "testimonial",
    );

    if (foundBlock) {
      setSectionEnabled(foundBlock.enabled !== false);
      const content = foundBlock.content || {};
      if (content.sectionTitle) setSectionTitle(content.sectionTitle as string);
      if (content.sectionSubtitle)
        setSectionSubtitle(content.sectionSubtitle as string);

      const raw = Array.isArray(content.testimonials)
        ? content.testimonials
        : [];
      if (raw.length > 0) {
        setTestimonials(
          raw.map((item, idx) => ({
            id: (item.id as string) || `testi-${Date.now()}-${idx + 1}`,
            author: (item.author as string) || "Enterprise Leader",
            role: (item.role as string) || "Director of Marketing",
            company: (item.company as string) || "Global Brand",
            quote: (item.quote as string) || "",
            rating: typeof item.rating === "number" ? item.rating : 5,
            avatarUrl: (item.avatarUrl as string) || "",
            metricBadge: (item.metricBadge as string) || (item.metric as string) || "",
            verified: item.verified !== false,
            enabled: item.enabled !== false,
          })),
        );
      } else {
        // Fallback curated defaults
        setTestimonials([
          {
            id: "testi-seed-1",
            author: "Ananya Roy",
            role: "VP Marketing",
            company: "FinScale AI",
            quote:
              "Nexora overhauled our organic search architecture and deployed high-intent landing pages. We closed $1.8M in influenced pipeline within the first two quarters.",
            rating: 5,
            metricBadge: "+340% Pipeline",
            verified: true,
            enabled: true,
          },
          {
            id: "testi-seed-2",
            author: "Michael Krause",
            role: "Co-Founder",
            company: "UrbanLux Apparel (US)",
            quote:
              "Their algorithmic Google and Meta campaigns reduced our customer acquisition cost by 38% while scaling monthly order volume. True performance marketing.",
            rating: 5,
            metricBadge: "4.2x ROAS",
            verified: true,
            enabled: true,
          },
          {
            id: "testi-seed-3",
            author: "Dr. Sanjay Mehta",
            role: "Operations Director",
            company: "Apex Health Group",
            quote:
              "The engineering team migrated our monolithic corporate portal to Next.js 15. The speed improvements alone increased form conversion rates by 42%.",
            rating: 5,
            metricBadge: "< 0.8s CWV",
            verified: true,
            enabled: true,
          },
        ]);
      }
    } else {
      // Default initial reviews if block not yet in DB
      setTestimonials([
        {
          id: "testi-seed-1",
          author: "Ananya Roy",
          role: "VP Marketing",
          company: "FinScale AI",
          quote:
            "Nexora overhauled our organic search architecture and deployed high-intent landing pages. We closed $1.8M in influenced pipeline within the first two quarters.",
          rating: 5,
          metricBadge: "+340% Pipeline",
          verified: true,
          enabled: true,
        },
        {
          id: "testi-seed-2",
          author: "Michael Krause",
          role: "Co-Founder",
          company: "UrbanLux Apparel (US)",
          quote:
            "Their algorithmic Google and Meta campaigns reduced our customer acquisition cost by 38% while scaling monthly order volume. True performance marketing.",
          rating: 5,
          metricBadge: "4.2x ROAS",
          verified: true,
          enabled: true,
        },
        {
          id: "testi-seed-3",
          author: "Dr. Sanjay Mehta",
          role: "Operations Director",
          company: "Apex Health Group",
          quote:
            "The engineering team migrated our monolithic corporate portal to Next.js 15. The speed improvements alone increased form conversion rates by 42%.",
          rating: 5,
          metricBadge: "< 0.8s CWV",
          verified: true,
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
        ? "Testimonials section marked ACTIVE. Click 'Save Changes' to publish."
        : "Testimonials section marked INACTIVE. Click 'Save Changes' to publish.",
    );
  };

  // Item Active/Deactive Toggle
  const handleToggleItemStatus = (id: string) => {
    const target = testimonials.find((t) => t.id === id);
    const updated = testimonials.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t,
    );
    setTestimonials(updated);
    setHasUnsavedChanges(true);
    toast.info(
      target?.enabled
        ? `"${target.author}" deactivated. Click 'Save Changes' to publish.`
        : `"${target?.author}" activated! Click 'Save Changes' to publish.`,
    );
  };

  // Reorder
  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === testimonials.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...testimonials];
    const [moved] = reordered.splice(index, 1);
    if (moved) {
      reordered.splice(targetIdx, 0, moved);
      setTestimonials(reordered);
      setHasUnsavedChanges(true);
    }
  };

  // Delete
  const handleDelete = (id: string, author: string) => {
    setTestimonialToDelete({ id, author });
  };

  const confirmDeleteTestimonial = () => {
    if (!testimonialToDelete) return;
    setTestimonials((prev) => prev.filter((t) => t.id !== testimonialToDelete.id));
    setHasUnsavedChanges(true);
    toast.success(`Review from "${testimonialToDelete.author}" removed. Click 'Save Changes' to publish.`);
    setTestimonialToDelete(null);
  };

  // Open Modal (Add)
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormAuthor("");
    setFormRole("");
    setFormCompany("");
    setFormQuote("");
    setFormRating(5);
    setFormMetricBadge("");
    setFormAvatarUrl("");
    setFormVerified(true);
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Modal (Edit)
  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormAuthor(item.author);
    setFormRole(item.role);
    setFormCompany(item.company);
    setFormQuote(item.quote);
    setFormRating(item.rating || 5);
    setFormMetricBadge(item.metricBadge || "");
    setFormAvatarUrl(item.avatarUrl || "");
    setFormVerified(item.verified !== false);
    setFormEnabled(item.enabled !== false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      author: formAuthor.trim(),
      role: formRole.trim(),
      company: formCompany.trim(),
      quote: formQuote.trim(),
      rating: formRating,
      metricBadge: formMetricBadge.trim() || undefined,
      avatarUrl: formAvatarUrl.trim() || undefined,
      verified: formVerified,
      enabled: formEnabled,
    };

    try {
      await testimonialSchema.validate(payload, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path) {
            errors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(errors);
        toast.error("Please correct the form errors before saving.");
        return;
      }
    }

    if (editingId) {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...payload,
              }
            : t,
        ),
      );
      toast.success("Review updated in staging list.");
    } else {
      const newItem: TestimonialItem = {
        id: `testi-${Date.now()}`,
        ...payload,
      };
      setTestimonials((prev) => [newItem, ...prev]);
      toast.success("New review added to staging list.");
    }

    setHasUnsavedChanges(true);
    setIsFormOpen(false);
  };

  // Upload Avatar Image
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
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
        setFormAvatarUrl(directUrl);
        toast.success("Avatar image uploaded successfully!");
      }
    } catch {
      toast.error("Failed to upload avatar image.");
    }
  };

  // Save Draft & Publish to live database
  const handleSaveChanges = async () => {
    if (!homePageId || !pageDetail) {
      toast.error("Home page could not be located in CMS database.");
      return;
    }

    try {
      const blocks = [...pageDetail.blocks];
      const blockIdx = blocks.findIndex(
        (b) =>
          b.type.toLowerCase() === "testimonials" ||
          b.type.toLowerCase() === "testimonial",
      );

      const blockPayload: CmsBlock = {
        id: blockIdx >= 0 && blocks[blockIdx] ? blocks[blockIdx].id : `blk_testimonials_${Date.now()}`,
        type: "Testimonials",
        schemaVersion: 1,
        enabled: sectionEnabled,
        settings: { theme: "light" },
        content: {
          sectionTitle,
          sectionSubtitle,
          testimonials,
        },
      };

      if (blockIdx >= 0) {
        blocks[blockIdx] = blockPayload;
      } else {
        // Insert right after features or stats
        const insertIdx = blocks.findIndex(
          (b) =>
            b.type.toLowerCase() === "featuregrid" ||
            b.type.toLowerCase() === "stats",
        );
        if (insertIdx >= 0) {
          blocks.splice(insertIdx + 1, 0, blockPayload);
        } else {
          blocks.push(blockPayload);
        }
      }

      // Step 1: Save Draft
      const draftRes = await saveDraft({
        id: homePageId,
        body: {
          blocks,
          versionToken: pageDetail.versionToken ?? undefined,
        },
      }).unwrap();

      // Step 2: Publish Page
      await publishPage(homePageId).unwrap();

      setHasUnsavedChanges(false);
      await refetchPage();
      toast.success(
        "Testimonials saved and published live to website successfully!",
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to save changes. Please check permissions.";
      toast.error(`Save Failed: ${errorMsg}`);
    }
  };

  // Filtered List
  const filtered = testimonials.filter(
    (t) =>
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = testimonials.filter((t) => t.enabled).length;
  const disabledCount = testimonials.length - activeCount;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquareQuote className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Testimonials & Client Reviews
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {testimonials.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Institutional social proof, executive testimonials, 5-star ratings,
            and ROI metrics displayed on the live website.
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
            <span>Add Review</span>
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
              You have unsaved changes (status toggles or edits). Click &quot;Save
              Changes&quot; to publish them to the live website.
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
            Total Reviews
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {testimonials.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-emerald-600 font-semibold uppercase">
            Active / Live
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {activeCount}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">
            Inactive / Hidden
          </span>
          <div className="text-2xl font-black text-slate-500 mt-1">
            {disabledCount}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-amber-500 font-semibold uppercase">
            Average Rating
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <span>5.0</span>
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* 4. Search Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, company, or quote keyword..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* 5. Table Listing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5 w-12 text-center">Order</th>
                <th className="px-4 py-3.5">Client & Company</th>
                <th className="px-4 py-3.5">Rating & Metric</th>
                <th className="px-4 py-3.5">Review Quote</th>
                <th className="px-4 py-3.5 text-center">Status Toggle</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingPages || isLoadingDetail ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading reviews from CMS...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No testimonials found matching your search.
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
                            disabled={index === testimonials.length - 1}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Client & Company */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.author}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                              {item.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.author}</span>
                              {item.verified && (
                                <span title="Verified Client">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.role} &bull; {item.company}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating & Metric */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center text-amber-400 gap-0.5">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 fill-amber-400"
                              />
                            ))}
                          </div>
                          {item.metricBadge && (
                            <span className="inline-block text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {item.metricBadge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quote */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300 italic">
                          &ldquo;{item.quote}&rdquo;
                        </p>
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
                            title="Edit Review"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.author)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition"
                            title="Delete Review"
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

      {/* 6. Create / Edit Review Modal */}
      {isFormOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Star className="w-5 h-5 fill-amber-500" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Client Review" : "Add New Client Review"}
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
              {/* Row 1: Author Name & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Client Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Aditi Rao"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  {formErrors.author && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Title / Role *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. VP of Global Marketing"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  {formErrors.role && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Company Name & Key Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company / Organization *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="e.g. Apex Cloud Enterprise"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  {formErrors.company && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.company}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Key Metric Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formMetricBadge}
                    onChange={(e) => setFormMetricBadge(e.target.value)}
                    placeholder="e.g. +340% ROAS, $1.8M ARR"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                  {formErrors.metricBadge && (
                    <p className="text-red-500 text-[10px] mt-1 font-semibold">
                      {formErrors.metricBadge}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Rating (1-5 Stars) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {formRating} Star Review
                  </span>
                </div>
              </div>

              {/* Row 4: Testimonial Quote */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Review / Testimonial Quote *
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={4}
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    placeholder="Describe their experience, key deliverables, and ROI outcome..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                {formErrors.quote && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.quote}
                  </p>
                )}
              </div>

              {/* Row 5: Avatar Image (Upload or URL) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Client Avatar Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    placeholder="/api/v1/public/media/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-slate-700 font-bold transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Row 6: Toggles inside Modal */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  {/* Verified Badge Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-slate-700">Verified Client Badge</span>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm"
                >
                  {editingId ? "Update Review" : "Add Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Testimonial Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(testimonialToDelete)}
        title="Remove Client Testimonial"
        description={
          testimonialToDelete
            ? `Are you sure you want to remove the testimonial from "${testimonialToDelete.author}"? You must click 'Save Changes' to push the update live.`
            : ""
        }
        confirmText="Remove Review"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteTestimonial}
        onClose={() => setTestimonialToDelete(null)}
      />
    </div>
  );
};
export default TestimonialsPage;
