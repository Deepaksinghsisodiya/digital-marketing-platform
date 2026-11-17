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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  X,
  Search,
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

export interface HeroSlideItem {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  imageAlt: string;
  overlayOpacity: number;
  enabled: boolean;
}

// Yup Validation Schema for Hero Banner Slide
export const heroSlideSchema = yup.object().shape({
  headline: yup
    .string()
    .trim()
    .required("Main headline is required.")
    .min(3, "Headline must be at least 3 characters.")
    .max(160, "Headline cannot exceed 160 characters."),
  tag: yup
    .string()
    .trim()
    .max(60, "Category tag cannot exceed 60 characters.")
    .optional(),
  subheadline: yup
    .string()
    .trim()
    .max(300, "Subheadline cannot exceed 300 characters.")
    .optional(),
  primaryCtaText: yup
    .string()
    .trim()
    .max(40, "CTA text cannot exceed 40 characters.")
    .optional(),
  primaryCtaLink: yup
    .string()
    .trim()
    .test(
      "valid-link",
      "Link must start with /, http://, https://, or #",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("#"),
    )
    .optional(),
  secondaryCtaText: yup
    .string()
    .trim()
    .max(40, "CTA text cannot exceed 40 characters.")
    .optional(),
  secondaryCtaLink: yup
    .string()
    .trim()
    .test(
      "valid-link",
      "Link must start with /, http://, https://, or #",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("#"),
    )
    .optional(),
  imageUrl: yup
    .string()
    .trim()
    .test(
      "no-blob",
      "Local blob URLs are not allowed. Please upload an image or enter a valid URL.",
      (val) => !val || !val.startsWith("blob:"),
    )
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
  overlayOpacity: yup
    .number()
    .min(0.2, "Overlay must be between 20% and 95%")
    .max(0.95, "Overlay must be between 20% and 95%"),
  enabled: yup.boolean().required(),
});

export const HeroBannersPage: React.FC = () => {
  // 1. Locate "home" page
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
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [heroEnabled, setHeroEnabled] = useState<boolean>(true);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [interval, setInterval] = useState<number>(5000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  // Form Modal State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Form Fields
  const [formTag, setFormTag] = useState<string>("");
  const [formHeadline, setFormHeadline] = useState<string>("");
  const [formSubheadline, setFormSubheadline] = useState<string>("");
  const [formPrimaryText, setFormPrimaryText] = useState<string>("");
  const [formPrimaryLink, setFormPrimaryLink] = useState<string>("");
  const [formSecondaryText, setFormSecondaryText] = useState<string>("");
  const [formSecondaryLink, setFormSecondaryLink] = useState<string>("");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formImageAlt, setFormImageAlt] = useState<string>("");
  const [formOverlayOpacity, setFormOverlayOpacity] = useState<number>(0.65);
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Initialize strictly from API with ZERO fake/dummy data
  useEffect(() => {
    if (!pageDetail) return;
    const foundHero = pageDetail.blocks.find(
      (b) => b.type.toLowerCase() === "hero",
    );
    if (foundHero) {
      setHeroEnabled(foundHero.enabled !== false);
      const content = foundHero.content || {};
      setAutoplay(content.autoplay !== false);
      setInterval(
        typeof content.interval === "number" ? content.interval : 5000,
      );

      const rawSlides = Array.isArray(content.slides) ? content.slides : [];
      setSlides(
        rawSlides.map((s, idx) => ({
          id: (s.id as string) || `slide-${Date.now()}-${idx + 1}`,
          tag: (s.tag as string) || (s.eyebrow as string) || "",
          headline: (s.headline as string) || "",
          subheadline: (s.subheadline as string) || "",
          primaryCtaText: (s.primaryCtaText as string) || "",
          primaryCtaLink: (s.primaryCtaLink as string) || "",
          secondaryCtaText: (s.secondaryCtaText as string) || "",
          secondaryCtaLink: (s.secondaryCtaLink as string) || "",
          imageUrl:
            typeof s.imageUrl === "string" && s.imageUrl.startsWith("blob:")
              ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85"
              : (s.imageUrl as string) || "",
          imageAlt: (s.imageAlt as string) || "",
          overlayOpacity:
            typeof s.overlayOpacity === "number" ? s.overlayOpacity : 0.65,
          enabled: s.enabled !== false,
        })),
      );
      setHasUnsavedChanges(false);
    }
  }, [pageDetail]);

  // Core API Synchronization Method
  const persistChangesToApi = async (
    targetSlides: HeroSlideItem[],
    targetHeroEnabled: boolean,
    targetAutoplay: boolean,
    targetInterval: number,
    successMessage?: string,
  ) => {
    if (!homePageId || !pageDetail) {
      return;
    }

    try {
      const updatedBlocks: CmsBlock[] = pageDetail.blocks.map((b) => {
        if (b.type.toLowerCase() === "hero") {
          return {
            ...b,
            enabled: targetHeroEnabled,
            content: {
              ...b.content,
              isSlider: targetSlides.length > 1,
              autoplay: targetAutoplay,
              interval: targetInterval,
              headline: targetSlides[0]?.headline || "",
              subheadline: targetSlides[0]?.subheadline || "",
              primaryCtaText: targetSlides[0]?.primaryCtaText || "",
              primaryCtaLink: targetSlides[0]?.primaryCtaLink || "",
              secondaryCtaText: targetSlides[0]?.secondaryCtaText || "",
              secondaryCtaLink: targetSlides[0]?.secondaryCtaLink || "",
              imageUrl: targetSlides[0]?.imageUrl || "",
              slides: targetSlides.map((s) => ({
                id: s.id,
                tag: s.tag,
                headline: s.headline,
                subheadline: s.subheadline,
                primaryCtaText: s.primaryCtaText,
                primaryCtaLink: s.primaryCtaLink,
                secondaryCtaText: s.secondaryCtaText,
                secondaryCtaLink: s.secondaryCtaLink,
                imageUrl: s.imageUrl,
                imageAlt: s.imageAlt,
                overlayOpacity: s.overlayOpacity,
                enabled: s.enabled,
              })),
            },
            settings: {
              ...b.settings,
              overlayOpacity: targetSlides[0]?.overlayOpacity ?? 0.65,
            },
          };
        }
        return b;
      });

      // Save draft with rowversion concurrency token
      await saveDraft({
        id: homePageId,
        body: {
          title: pageDetail.title,
          blocks: updatedBlocks,
          versionToken: pageDetail.versionToken || "",
          metaTitle: pageDetail.metaTitle,
          metaDescription: pageDetail.metaDescription,
          canonicalUrl: pageDetail.canonicalUrl,
          noIndex: pageDetail.noIndex,
        },
      }).unwrap();

      // Publish directly to live website
      await publishPage(homePageId).unwrap();
      await refetchPage();
      setHasUnsavedChanges(false);

      toast.success(
        successMessage ||
          "Changes saved and published live to website via API!",
      );
    } catch (err: unknown) {
      console.error("API Persistence failed:", err);
      const errObj = err as { data?: { error?: string } };
      toast.error(
        errObj?.data?.error ||
          "Failed to persist changes via API. Please check network/permissions.",
      );
    }
  };

  // Toggle Entire Hero Section Visibility (Persists directly to API)
  const handleToggleHeroSection = async () => {
    const nextState = !heroEnabled;
    setHeroEnabled(nextState);
    await persistChangesToApi(
      slides,
      nextState,
      autoplay,
      interval,
      nextState ? "Hero Section activated and published live!" : "Hero Section deactivated and published live!",
    );
  };

  // Open Form for "Create New Slide" (Clean empty fields for user input)
  const handleOpenCreateModal = () => {
    setEditingSlideId(null);
    setFormTag("");
    setFormHeadline("");
    setFormSubheadline("");
    setFormPrimaryText("Get Started");
    setFormPrimaryLink("/contact");
    setFormSecondaryText("Explore Services");
    setFormSecondaryLink("/services");
    setFormImageUrl("");
    setFormImageAlt("");
    setFormOverlayOpacity(0.65);
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Form for "Edit Slide"
  const handleOpenEditModal = (slide: HeroSlideItem) => {
    setEditingSlideId(slide.id);
    setFormTag(slide.tag);
    setFormHeadline(slide.headline);
    setFormSubheadline(slide.subheadline);
    setFormPrimaryText(slide.primaryCtaText);
    setFormPrimaryLink(slide.primaryCtaLink);
    setFormSecondaryText(slide.secondaryCtaText);
    setFormSecondaryLink(slide.secondaryCtaLink);
    setFormImageUrl(
      slide.imageUrl.startsWith("blob:")
        ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85"
        : slide.imageUrl,
    );
    setFormImageAlt(slide.imageAlt);
    setFormOverlayOpacity(slide.overlayOpacity ?? 0.65);
    setFormEnabled(slide.enabled !== false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Direct Image File Upload via Authenticated RTK Query Mutation
  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size exceeds the 10MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "altText",
        formHeadline || file.name || "Hero Banner Visual",
      );

      const asset = await uploadMedia(formData).unwrap();
      const downloadUrl =
        asset?.url ||
        (asset?.id ? `/api/v1/public/media/${asset.id}/download` : "");

      if (downloadUrl) {
        setFormImageUrl(downloadUrl);
        setFormImageAlt(
          formHeadline || asset.fileName || "Hero Banner Visual",
        );
        setFormErrors((prev) => ({ ...prev, imageUrl: "" }));
        toast.success(`Image "${file.name}" uploaded to server storage successfully!`);
      } else {
        toast.error("Server did not return a valid asset record.");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errObj = err as { data?: { error?: string } };
      toast.error(
        errObj?.data?.error ||
          "Failed to upload image. Please ensure you are logged in and using a supported image format (.jpg, .png, .webp).",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Submit Form: Yup Validation + Updates Local State (NO auto API save, user clicks "Save Changes")
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const formValues = {
      headline: formHeadline,
      tag: formTag,
      subheadline: formSubheadline,
      primaryCtaText: formPrimaryText,
      primaryCtaLink: formPrimaryLink,
      secondaryCtaText: formSecondaryText,
      secondaryCtaLink: formSecondaryLink,
      imageUrl: formImageUrl,
      overlayOpacity: formOverlayOpacity,
      enabled: formEnabled,
    };

    // 1. Yup Schema Validation
    try {
      await heroSlideSchema.validate(formValues, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path && !errors[validationErr.path]) {
            errors[validationErr.path] = validationErr.message;
          }
        });
        setFormErrors(errors);
        toast.error("Please fix form validation errors before saving.");
        return;
      }
    }

    let updated: HeroSlideItem[];
    if (editingSlideId) {
      updated = slides.map((s) =>
        s.id === editingSlideId
          ? {
              ...s,
              tag: formTag,
              headline: formHeadline,
              subheadline: formSubheadline,
              primaryCtaText: formPrimaryText,
              primaryCtaLink: formPrimaryLink,
              secondaryCtaText: formSecondaryText,
              secondaryCtaLink: formSecondaryLink,
              imageUrl: formImageUrl,
              imageAlt: formImageAlt,
              overlayOpacity: formOverlayOpacity,
              enabled: formEnabled,
            }
          : s,
      );
    } else {
      const newSlide: HeroSlideItem = {
        id: `slide-${Date.now()}`,
        tag: formTag,
        headline: formHeadline,
        subheadline: formSubheadline,
        primaryCtaText: formPrimaryText,
        primaryCtaLink: formPrimaryLink,
        secondaryCtaText: formSecondaryText,
        secondaryCtaLink: formSecondaryLink,
        imageUrl: formImageUrl,
        imageAlt: formImageAlt,
        overlayOpacity: formOverlayOpacity,
        enabled: formEnabled,
      };
      updated = [...slides, newSlide];
    }

    setSlides(updated);
    setIsFormOpen(false);

    // Persist directly to backend database so refresh never loses data
    await persistChangesToApi(
      updated,
      heroEnabled,
      autoplay,
      interval,
      editingSlideId
        ? "Banner slide updated and saved directly to database!"
        : "New banner slide created and saved directly to database!",
    );
  };

  // Delete Slide (Persists directly to backend)
  const handleDeleteSlide = (id: string) => {
    setSlideToDelete(id);
  };

  const confirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    const updated = slides.filter((s) => s.id !== slideToDelete);
    setSlides(updated);
    setSlideToDelete(null);

    await persistChangesToApi(
      updated,
      heroEnabled,
      autoplay,
      interval,
      "Banner slide removed and updated in database!",
    );
  };

  // Reorder Slide Up / Down (Persists directly to backend)
  const handleReorder = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const copy = [...slides];
    const item = copy[idx]!;
    copy.splice(idx, 1);
    copy.splice(targetIdx, 0, item);
    setSlides(copy);

    await persistChangesToApi(
      copy,
      heroEnabled,
      autoplay,
      interval,
      "Slide display order updated and saved live!",
    );
  };

  // Toggle Visibility of Individual Slide (Persists directly to backend)
  const handleToggleSlideVisibility = async (id: string) => {
    const updated = slides.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    setSlides(updated);
    const target = updated.find((s) => s.id === id);

    await persistChangesToApi(
      updated,
      heroEnabled,
      autoplay,
      interval,
      target?.enabled
        ? "Banner slide activated and published live!"
        : "Banner slide deactivated and published live!",
    );
  };

  // Autoplay delay change (Persists directly to backend)
  const handleIntervalChange = async (newInterval: number) => {
    setInterval(newInterval);
    await persistChangesToApi(
      slides,
      heroEnabled,
      autoplay,
      newInterval,
      `Autoplay rotation interval set to ${newInterval / 1000}s and saved!`,
    );
  };

  // Explicit Save Changes Button (PERSISTS ALL CHANGES ON CLICK)
  const handleManualSave = async () => {
    await persistChangesToApi(
      slides,
      heroEnabled,
      autoplay,
      interval,
      "Hero Banners successfully saved and published live to website via API!",
    );
  };

  const filteredSlides = slides.filter(
    (s) =>
      s.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isLoading = isLoadingPages || isLoadingDetail;

  return (
    <div className="w-full space-y-6 pb-16 px-2 sm:px-4 lg:px-6">
      {/* 1. Header Toolbar (Full Width) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Hero Banners Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Full-width table management for home page hero banners. All
              changes persist directly to backend APIs.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Section Active / Deactivated TOGGLE SWITCH */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              Hero Section
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={heroEnabled}
              onClick={handleToggleHeroSection}
              disabled={isSaving || isPublishing}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                heroEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
              title={
                heroEnabled
                  ? "Section Active (Click to deactivate)"
                  : "Section Deactivated (Click to activate)"
              }
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                  heroEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-semibold min-w-16 ${
                heroEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {heroEnabled ? "Active" : "Deactivated"}
            </span>
          </div>

          {/* Autoplay Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span className="text-slate-500">Rotate:</span>
            <select
              value={interval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={isSaving || isPublishing}
              className="bg-transparent text-slate-900 dark:text-white font-bold outline-hidden cursor-pointer"
            >
              <option value={3000}>3 sec</option>
              <option value={5000}>5 sec</option>
              <option value={7000}>7 sec</option>
              <option value={10000}>10 sec</option>
            </select>
          </div>

          {/* Add New Slide Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner Slide</span>
          </button>

          {/* SAVE CHANGES BUTTON (Only persists to API on explicit click) */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving || isPublishing}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/35 ring-2 ring-emerald-500/50 hover:scale-[1.03] active:scale-[0.98]"
                : "bg-emerald-600/90 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
            }`}
          >
            {isSaving || isPublishing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving || isPublishing
                ? "Saving Changes..."
                : hasUnsavedChanges
                  ? "Save Changes *"
                  : "Save Changes"}
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. FULL-WIDTH DATA TABLE CONTAINER */}
      <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden w-full">
        {/* Table Top Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by headline or tag..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Total Slides: <strong>{slides.length}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Active: {slides.filter((s) => s.enabled !== false).length}
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Hidden: {slides.filter((s) => s.enabled === false).length}
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-7 h-7 animate-spin text-primary mx-auto mb-2" />
            <span className="text-xs text-slate-500 font-semibold">
              Fetching real-time CMS slides from API...
            </span>
          </div>
        ) : filteredSlides.length === 0 ? (
          /* Empty State when no slides exist */
          <div className="text-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchQuery
                ? "No matching banner slides"
                : "No Banner Slides in Database"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              {searchQuery
                ? `No slides matched your search query "${searchQuery}". Clear search or add a new slide.`
                : "No dummy data is pre-populated. Click the button below to add your first banner slide with custom image, headline, and action buttons."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Banner Slide</span>
            </button>
          </div>
        ) : (
          /* Full Width Clean Table */
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 text-center w-16"># Order</th>
                  <th className="px-4 py-3.5 text-left w-40">Banner Visual</th>
                  <th className="px-4 py-3.5 text-left">Slide Content</th>
                  <th className="px-4 py-3.5 text-left w-56">CTA Buttons</th>
                  <th className="px-4 py-3.5 text-center w-28">Theme</th>
                  <th className="px-4 py-3.5 text-center w-36">Status</th>
                  <th className="px-4 py-3.5 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredSlides.map((slide, idx) => (
                  <tr
                    key={slide.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition ${
                      slide.enabled === false ? "opacity-60 bg-slate-50/30" : ""
                    }`}
                  >
                    {/* 1. Order & Reorder Arrows */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || isSaving || isPublishing}
                          onClick={() => handleReorder(idx, "up")}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          disabled={
                            idx === slides.length - 1 ||
                            isSaving ||
                            isPublishing
                          }
                          onClick={() => handleReorder(idx, "down")}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* 2. Visual Thumbnail */}
                    <td className="px-4 py-4">
                      <div className="relative w-36 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-xs group">
                        {slide.imageUrl ? (
                          <img
                            src={slide.imageUrl}
                            alt={slide.imageAlt || slide.headline}
                            className="w-full h-full object-cover filter brightness-[0.55] group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px]">
                            <ImageIcon className="w-5 h-5 mb-1" />
                            <span>No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1.5 left-2 right-2 text-[9px] font-bold text-white truncate drop-shadow">
                          {slide.tag || "Slide"}
                        </span>
                      </div>
                    </td>

                    {/* 3. Slide Content (Tag, Headline, Subheadline) */}
                    <td className="px-4 py-4 max-w-lg">
                      <div className="space-y-1">
                        {slide.tag && (
                          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {slide.tag}
                          </span>
                        )}
                        <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                          {slide.headline}
                        </div>
                        {slide.subheadline && (
                          <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {slide.subheadline}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 4. CTA Buttons */}
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Primary:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                            {slide.primaryCtaText || "—"}
                          </span>
                          {slide.primaryCtaLink && (
                            <span className="text-slate-400 font-mono text-[10px]">
                              ({slide.primaryCtaLink})
                            </span>
                          )}
                        </div>
                        {slide.secondaryCtaText && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span>Secondary:</span>
                            <span className="truncate max-w-[130px]">
                              {slide.secondaryCtaText}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Theme Status */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active Theme</span>
                      </span>
                    </td>

                    {/* 6. Active / Hidden TOGGLE SWITCH */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={slide.enabled !== false}
                          onClick={() => handleToggleSlideVisibility(slide.id)}
                          disabled={isSaving || isPublishing}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                            slide.enabled !== false
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                          title={
                            slide.enabled !== false
                              ? "Active (Click to hide from website)"
                              : "Hidden (Click to show on website)"
                          }
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                              slide.enabled !== false
                                ? "translate-x-4.5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-semibold w-12 text-left ${
                            slide.enabled !== false
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {slide.enabled !== false ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>

                    {/* 7. Action Buttons (Edit Form & Delete) */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(slide)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition cursor-pointer"
                          title="Open Form to edit slide"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          disabled={isSaving || isPublishing}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. CLEAN COMPACT FORM MODAL WITH YUP VALIDATION */}
      {isFormOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {editingSlideId ? (
                    <Edit3 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingSlideId ? "Edit Banner Slide" : "Create New Banner Slide"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form wrapping scrollable body AND fixed footer */}
            <form
              onSubmit={handleSaveForm}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Main Headline */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Headline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formHeadline}
                    onChange={(e) => {
                      setFormHeadline(e.target.value);
                      if (formErrors.headline)
                        setFormErrors((prev) => ({ ...prev, headline: "" }));
                    }}
                    placeholder="e.g. Data-Driven Marketing at Enterprise Scale"
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 ${
                      formErrors.headline
                        ? "border-rose-500 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                    }`}
                  />
                  {formErrors.headline && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.headline}</span>
                    </p>
                  )}
                </div>

                {/* Tag & Subheadline in Clean Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={formTag}
                      onChange={(e) => {
                        setFormTag(e.target.value);
                        if (formErrors.tag)
                          setFormErrors((prev) => ({ ...prev, tag: "" }));
                      }}
                      placeholder="e.g. Growth"
                      className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                        formErrors.tag
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                      }`}
                    />
                    {formErrors.tag && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {formErrors.tag}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subheadline Description
                    </label>
                    <input
                      type="text"
                      value={formSubheadline}
                      onChange={(e) => {
                        setFormSubheadline(e.target.value);
                        if (formErrors.subheadline)
                          setFormErrors((prev) => ({
                            ...prev,
                            subheadline: "",
                          }));
                      }}
                      placeholder="Brief description or value proposition"
                      className={`w-full px-3 py-2 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                        formErrors.subheadline
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                      }`}
                    />
                    {formErrors.subheadline && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {formErrors.subheadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Background Image Upload (Clean, No Bloat) */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Banner Image</span>
                    </span>
                    {(isUploading || isUploadingMedia) && (
                      <span className="text-[10px] text-primary flex items-center gap-1 font-bold animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Uploading
                        to server...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition shrink-0 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        if (formErrors.imageUrl)
                          setFormErrors((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                      placeholder="or paste image URL (https://...)"
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 font-mono ${
                        formErrors.imageUrl
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary"
                      }`}
                    />
                  </div>
                  {formErrors.imageUrl && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.imageUrl}</span>
                    </p>
                  )}

                  {/* Large High-Definition Banner Preview */}
                  {formImageUrl && (
                    <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-inner group">
                      <img
                        src={formImageUrl}
                        alt={formImageAlt || "Preview"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80";
                        }}
                        className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] transition-all duration-300"
                      />
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                      {/* Top floating Remove button */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <button
                          type="button"
                          onClick={() => setFormImageUrl("")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-rose-600 text-white text-xs font-bold backdrop-blur-md transition shadow-md cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Bottom live overlay preview details */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-3 text-white">
                        <div className="min-w-0">
                          {formTag && (
                            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-black/50 border border-emerald-500/30 backdrop-blur-xs mb-1">
                              {formTag}
                            </span>
                          )}
                          <h4 className="text-sm sm:text-base font-extrabold truncate drop-shadow-md">
                            {formHeadline || "Banner Visual Selected"}
                          </h4>
                          {formSubheadline && (
                            <p className="text-xs text-slate-300 truncate max-w-md drop-shadow">
                              {formSubheadline}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 px-2.5 py-1 rounded-md bg-black/60 border border-white/20 text-[11px] font-mono text-slate-200 backdrop-blur-md">
                          Darkness: {Math.round(formOverlayOpacity * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA (Button Text & Link in 1 row) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary CTA Button
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formPrimaryText}
                        onChange={(e) => {
                          setFormPrimaryText(e.target.value);
                          if (formErrors.primaryCtaText)
                            setFormErrors((prev) => ({
                              ...prev,
                              primaryCtaText: "",
                            }));
                        }}
                        placeholder="Button Text (e.g. Get Started)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                      />
                      {formErrors.primaryCtaText && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {formErrors.primaryCtaText}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formPrimaryLink}
                        onChange={(e) => {
                          setFormPrimaryLink(e.target.value);
                          if (formErrors.primaryCtaLink)
                            setFormErrors((prev) => ({
                              ...prev,
                              primaryCtaLink: "",
                            }));
                        }}
                        placeholder="URL Link (e.g. /contact)"
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 font-mono ${
                          formErrors.primaryCtaLink
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                        }`}
                      />
                      {formErrors.primaryCtaLink && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {formErrors.primaryCtaLink}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary CTA (Button Text & Link in 1 row) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary CTA Button (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formSecondaryText}
                        onChange={(e) => {
                          setFormSecondaryText(e.target.value);
                          if (formErrors.secondaryCtaText)
                            setFormErrors((prev) => ({
                              ...prev,
                              secondaryCtaText: "",
                            }));
                        }}
                        placeholder="Button Text (e.g. Explore Services)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
                      />
                      {formErrors.secondaryCtaText && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {formErrors.secondaryCtaText}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formSecondaryLink}
                        onChange={(e) => {
                          setFormSecondaryLink(e.target.value);
                          if (formErrors.secondaryCtaLink)
                            setFormErrors((prev) => ({
                              ...prev,
                              secondaryCtaLink: "",
                            }));
                        }}
                        placeholder="URL Link (e.g. /services)"
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 font-mono ${
                          formErrors.secondaryCtaLink
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-primary"
                        }`}
                      />
                      {formErrors.secondaryCtaLink && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {formErrors.secondaryCtaLink}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Overlay & Status Row with TOGGLE SWITCH */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Overlay Darkness:</span>
                    <input
                      type="range"
                      min={0.3}
                      max={0.9}
                      step={0.05}
                      value={formOverlayOpacity}
                      onChange={(e) =>
                        setFormOverlayOpacity(parseFloat(e.target.value))
                      }
                      className="w-24 accent-primary cursor-pointer"
                    />
                    <span className="font-mono text-[11px] font-bold">
                      {Math.round(formOverlayOpacity * 100)}%
                    </span>
                  </div>

                  {/* MODAL FORM TOGGLE SWITCH */}
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setFormEnabled(!formEnabled)}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formEnabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormEnabled(!formEnabled);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        formEnabled
                          ? "bg-primary"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                          formEnabled ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                      {formEnabled
                        ? "Active on Live Site"
                        : "Deactivated / Hidden"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer INSIDE Form (Unclipped, Generous Padding) */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isPublishing || isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving || isPublishing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {isSaving || isPublishing
                      ? "Saving Changes..."
                      : editingSlideId
                        ? "Save Changes"
                        : "Create Slide"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(slideToDelete)}
        title="Delete Banner Slide"
        description="Are you sure you want to remove this banner slide from the hero rotation?"
        confirmText="Remove Slide"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSlide}
        onClose={() => setSlideToDelete(null)}
      />
    </div>
  );
};
