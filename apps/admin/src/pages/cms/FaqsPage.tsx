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
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useSavePageDraftMutation,
  usePublishPageMutation,
} from "../../store/api/adminApi";
import type { CmsBlock } from "../../types";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  enabled: boolean;
}

const FAQ_CATEGORIES = [
  "General & Strategy",
  "Growth & Attribution",
  "Web Engineering",
  "Pricing, SLAs & Security",
];

// Yup Validation Schema
export const faqSchema = yup.object().shape({
  question: yup
    .string()
    .trim()
    .required("Question is required.")
    .min(5, "Question must be at least 5 characters.")
    .max(200, "Question cannot exceed 200 characters."),
  answer: yup
    .string()
    .trim()
    .required("Answer is required.")
    .min(10, "Answer must be at least 10 characters.")
    .max(1000, "Answer cannot exceed 1000 characters."),
  category: yup.string().trim().max(60).optional(),
  enabled: yup.boolean().required(),
});

export const FaqsPage: React.FC = () => {
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

  // State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(true);
  const [sectionTitle, setSectionTitle] = useState<string>(
    "Frequently Asked Questions",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  // Form Modal State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal Form Fields
  const [formQuestion, setFormQuestion] = useState<string>("");
  const [formAnswer, setFormAnswer] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("General & Strategy");
  const [formEnabled, setFormEnabled] = useState<boolean>(true);

  // Load from Page Blocks
  useEffect(() => {
    if (!pageDetail) return;
    const foundBlock = pageDetail.blocks.find(
      (b) =>
        b.type.toLowerCase() === "faq" || b.type.toLowerCase() === "faqs",
    );

    if (foundBlock) {
      setSectionEnabled(foundBlock.enabled !== false);
      const content = foundBlock.content || {};
      if (content.title) setSectionTitle(content.title as string);

      const rawItems = Array.isArray(content.items)
        ? (content.items as Array<{
            id?: string;
            question: string;
            answer: string;
            category?: string;
            enabled?: boolean;
          }>)
        : [];

      if (rawItems.length > 0) {
        setFaqs(
          rawItems.map((item, idx) => ({
            id: item.id || `faq-${Date.now()}-${idx + 1}`,
            question: item.question,
            answer: item.answer,
            category: item.category || "General & Strategy",
            enabled: item.enabled !== false,
          })),
        );
      } else {
        setFaqs(getDefaultFaqs());
      }
    } else {
      setFaqs(getDefaultFaqs());
    }
  }, [pageDetail]);

  function getDefaultFaqs(): FaqItem[] {
    return [
      {
        id: "faq-seed-1",
        question:
          "How quickly can Nexora deploy our custom marketing infrastructure?",
        answer:
          "Initial campaigns and tracking architecture typically go live within 7 to 14 business days, with real-time attribution and CRM synchronization enabled from day one.",
        category: "Growth & Attribution",
        enabled: true,
      },
      {
        id: "faq-seed-2",
        question:
          "Does Nexora support multi-country campaigns for India and global markets?",
        answer:
          "Yes. Nexora natively handles multi-region routing, localized currency (INR, USD, AED, GBP, EUR), regional phone validation, and regulatory compliance (DPDP Act, GDPR, CCPA).",
        category: "General & Strategy",
        enabled: true,
      },
      {
        id: "faq-seed-3",
        question:
          "Can our marketing team edit website pages without developer support?",
        answer:
          "Yes, our modern Admin portal provides a visual block builder to update headlines, banners, features, reviews, and blog content with live preview and version rollback.",
        category: "Web Engineering",
        enabled: true,
      },
      {
        id: "faq-seed-4",
        question:
          "What technologies and frameworks do you build with?",
        answer:
          "Our production stack includes Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS on the frontend, with robust ASP.NET Core and Node.js APIs and PostgreSQL/SQL Server databases.",
        category: "Web Engineering",
        enabled: true,
      },
      {
        id: "faq-seed-5",
        question: "How do you measure and report commercial ROI?",
        answer:
          "We prioritize deterministic, server-side attribution tied directly to CRM pipeline and closed revenue, eliminating reliance on easily skewed third-party cookies or vanity impressions.",
        category: "Growth & Attribution",
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
        ? "FAQ section marked ACTIVE. Click 'Save Changes' to publish."
        : "FAQ section marked INACTIVE. Click 'Save Changes' to publish.",
    );
  };

  // Item Active/Deactive Toggle
  const handleToggleItemStatus = (id: string) => {
    const target = faqs.find((f) => f.id === id);
    const updated = faqs.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f,
    );
    setFaqs(updated);
    setHasUnsavedChanges(true);
    toast.info(
      target?.enabled
        ? `FAQ deactivated. Click 'Save Changes' to publish.`
        : `FAQ activated! Click 'Save Changes' to publish.`,
    );
  };

  // Reorder
  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === faqs.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    if (moved) {
      reordered.splice(targetIdx, 0, moved);
      setFaqs(reordered);
      setHasUnsavedChanges(true);
    }
  };

  // Delete
  const handleDelete = (id: string) => {
    setFaqToDelete(id);
  };

  const confirmDeleteFaq = () => {
    if (!faqToDelete) return;
    setFaqs((prev) => prev.filter((f) => f.id !== faqToDelete));
    setHasUnsavedChanges(true);
    toast.success("FAQ removed from list. Click 'Save Changes' to publish.");
    setFaqToDelete(null);
  };

  // Open Modal (Add)
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("General & Strategy");
    setFormEnabled(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Modal (Edit)
  const handleOpenEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setFormQuestion(item.question);
    setFormAnswer(item.answer);
    setFormCategory(item.category || "General & Strategy");
    setFormEnabled(item.enabled !== false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      category: formCategory.trim() || undefined,
      enabled: formEnabled,
    };

    try {
      await faqSchema.validate(payload, { abortEarly: false });
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
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                ...payload,
              }
            : f,
        ),
      );
      toast.success("FAQ updated in staging list.");
    } else {
      const newItem: FaqItem = {
        id: `faq-${Date.now()}`,
        ...payload,
      };
      setFaqs((prev) => [newItem, ...prev]);
      toast.success("New FAQ added to staging list.");
    }

    setHasUnsavedChanges(true);
    setIsFormOpen(false);
  };

  // Save Draft & Publish
  const handleSaveChanges = async () => {
    if (!homePageId || !pageDetail) {
      toast.error("Home page could not be located in database.");
      return;
    }

    try {
      const blocks = [...pageDetail.blocks];
      const blockIdx = blocks.findIndex(
        (b) =>
          b.type.toLowerCase() === "faq" || b.type.toLowerCase() === "faqs",
      );

      const blockPayload: CmsBlock = {
        id: blockIdx >= 0 && blocks[blockIdx] ? blocks[blockIdx].id : `blk_faq_${Date.now()}`,
        type: "FAQ",
        schemaVersion: 1,
        enabled: sectionEnabled,
        settings: { theme: "light" },
        content: {
          title: sectionTitle,
          items: faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category,
            enabled: f.enabled,
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
      toast.success("FAQ knowledge base saved and published live to website successfully!");
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to save changes. Please check permissions.";
      toast.error(`Save Failed: ${errorMsg}`);
    }
  };

  // Filtered List
  const filtered = faqs.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const activeCount = faqs.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              FAQ Knowledge Base
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {faqs.length} FAQs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Address buyer questions, SLAs, tech stack details, and enterprise compliance across the site.
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
            <span>Add FAQ</span>
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
              You have unsaved changes in your FAQ knowledge base. Click &quot;Save
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">
            Total FAQs
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {faqs.length}
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
          <span className="text-xs text-purple-600 font-semibold uppercase">
            Categories
          </span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {FAQ_CATEGORIES.length}
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
            placeholder="Search FAQs by question or answer keyword..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {["all", ...FAQ_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                categoryFilter === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
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
                <th className="px-4 py-3.5">Question &amp; Category</th>
                <th className="px-4 py-3.5">Answer Summary</th>
                <th className="px-4 py-3.5 text-center">Status Toggle</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingPages || isLoadingDetail ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading FAQs from CMS...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No FAQs found.
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
                            disabled={index === faqs.length - 1}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Question & Category */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.question}
                          </div>
                          {item.category && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Answer */}
                      <td className="px-4 py-3.5 max-w-md">
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                          {item.answer}
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
                            title="Edit FAQ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition"
                            title="Delete FAQ"
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
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit FAQ Item" : "Add New FAQ Item"}
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
              {/* Row 1: Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Question */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. How quickly can Nexora deploy our custom marketing infrastructure?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                />
                {formErrors.question && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.question}
                  </p>
                )}
              </div>

              {/* Row 3: Answer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide a clear, authoritative, and direct answer..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                />
                {formErrors.answer && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold">
                    {formErrors.answer}
                  </p>
                )}
              </div>

              {/* Row 4: Active Toggle inside Modal */}
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-sm"
                >
                  {editingId ? "Update FAQ" : "Add FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete FAQ Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(faqToDelete)}
        title="Delete FAQ Item"
        description="Are you sure you want to remove this FAQ from the knowledge base? You must click 'Save Changes' to push the update live."
        confirmText="Remove FAQ"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteFaq}
        onClose={() => setFaqToDelete(null)}
      />
    </div>
  );
};
export default FaqsPage;
