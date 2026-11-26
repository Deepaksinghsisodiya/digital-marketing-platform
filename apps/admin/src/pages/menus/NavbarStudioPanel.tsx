import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import { MediaPickerModal, resolveMediaUrl } from "../media/MediaLibraryPage";
import { toast } from "../../utils/toast";
import {
  LayoutTemplate,
  Image as ImageIcon,
  Trash2,
  Save,
  Search,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  Eye,
  Monitor,
  Smartphone,
} from "lucide-react";
import type { NavigationMenuItemDto } from "../../types";

export interface NavbarConfig {
  tagline?: string;
  showSearch?: boolean;
  showCta?: boolean;
  ctaText?: string;
  alignment?: "left" | "center" | "right";
  sticky?: boolean;
  hiddenMenuUrls?: string[];
}

export interface NavbarPreviewState {
  companyName: string;
  tagline: string;
  logoPreviewUrl: string | null;
  showSearch: boolean;
  showCta: boolean;
  ctaText: string;
  alignment: "left" | "center" | "right";
  sticky: boolean;
  hiddenMenuUrls?: string[];
}

export const LiveNavbarPreview: React.FC<{
  preview: NavbarPreviewState;
  menuItems: NavigationMenuItemDto[];
}> = ({ preview, menuItems }) => {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const hiddenSet = new Set(
    (preview.hiddenMenuUrls || []).map((u) => u.trim().toLowerCase()),
  );
  const visibleItems = menuItems
    .filter((it) => !hiddenSet.has((it.url || "").trim().toLowerCase()))
    .map((it) => ({
      ...it,
      children: (it.children || []).filter(
        (c) => !hiddenSet.has((c.url || "").trim().toLowerCase()),
      ),
    }));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 p-3.5 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span>Live Website Navbar Preview</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-500 normal-case">
            {preview.sticky ? "Sticky on Scroll" : "Static"}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              viewport === "desktop"
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              viewport === "mobile"
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      <div
        className={`mx-auto transition-all duration-200 ${
          viewport === "mobile" ? "max-w-sm" : "w-full"
        }`}
      >
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 shadow-xs overflow-x-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            {preview.logoPreviewUrl ? (
              <img
                src={preview.logoPreviewUrl}
                alt="Preview Logo"
                className="w-7 h-7 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                {(preview.companyName || "N").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 leading-none">
                {preview.companyName || "Company Name"}
              </span>
              {preview.tagline.trim() && (
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  {preview.tagline}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Links */}
          {viewport === "desktop" && (
            <div
              className={`flex-1 flex items-center gap-4 text-xs font-semibold text-slate-700 whitespace-nowrap ${
                preview.alignment === "left"
                  ? "justify-start pl-3"
                  : preview.alignment === "right"
                    ? "justify-end pr-3"
                    : "justify-center"
              }`}
            >
              {visibleItems.length === 0 ? (
                <span className="text-slate-400 italic text-[11px]">No visible links</span>
              ) : (
                visibleItems.slice(0, 7).map((item) => (
                  <span key={item.id} className="inline-flex items-center gap-0.5">
                    <span>{item.label}</span>
                    {item.children && item.children.length > 0 && (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </span>
                ))
              )}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {preview.showSearch && viewport === "desktop" && (
              <span className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </span>
            )}
            {preview.showCta && (
              <span className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center gap-1">
                <span>{preview.ctaText.trim() || "Book a Call"}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
            {viewport === "mobile" && (
              <span className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                &#9776;
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const navbarSchema = yup.object().shape({
  companyName: yup
    .string()
    .trim()
    .required("Company name is required.")
    .min(2, "Company name must be at least 2 characters.")
    .max(80, "Company name cannot exceed 80 characters."),
  tagline: yup.string().trim().max(80, "Tagline cannot exceed 80 characters.").optional(),
  ctaText: yup.string().trim().max(40, "CTA label cannot exceed 40 characters.").optional(),
  bookingUrl: yup
    .string()
    .trim()
    .test(
      "valid-url",
      "CTA URL must start with /, http://, or https://",
      (val) =>
        !val ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
    )
    .optional(),
});

export const NavbarStudioPanel: React.FC<{
  onPreviewChange?: (preview: NavbarPreviewState) => void;
}> = ({ onPreviewChange }) => {
  const { data: settings, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [logoMediaId, setLogoMediaId] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      companyName: "",
      tagline: "",
      showSearch: true,
      showCta: true,
      ctaText: "Book a Call",
      bookingUrl: "/book-a-call",
      alignment: "center" as "left" | "center" | "right",
      sticky: true,
    },
    validationSchema: navbarSchema,
    onSubmit: async (values) => {
      if (!settings) return;

      let existingTokens: Record<string, unknown> = {};
      if (settings.themeTokensJson) {
        try {
          existingTokens = JSON.parse(settings.themeTokensJson) as Record<string, unknown>;
        } catch {
          existingTokens = {};
        }
      }

      const existingNavCfg = (existingTokens.navbarConfig || {}) as NavbarConfig;
      const navbarConfig: NavbarConfig = {
        ...existingNavCfg,
        tagline: values.tagline.trim(),
        showSearch: values.showSearch,
        showCta: values.showCta,
        ctaText: values.ctaText.trim() || "Book a Call",
        alignment: values.alignment,
        sticky: values.sticky,
      };

      try {
        await updateSettings({
          companyName: values.companyName.trim(),
          legalName: settings.legalName,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          address: settings.address,
          defaultRegion: settings.defaultRegion,
          supportedRegions: settings.supportedRegions || ["IN", "US"],
          timeZoneId: settings.timeZoneId,
          logoMediaId,
          faviconMediaId: settings.faviconMediaId,
          versionToken: settings.versionToken,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUseSsl: settings.smtpUseSsl,
          smtpUserName: settings.smtpUserName,
          smtpPassword: settings.smtpPassword,
          smtpFromEmail: settings.smtpFromEmail,
          smtpFromName: settings.smtpFromName,
          sectionVisibilityJson: settings.sectionVisibilityJson,
          themeTokensJson: JSON.stringify({ ...existingTokens, navbarConfig }),
          socialLinksJson: settings.socialLinksJson,
          trackingCodesJson: settings.trackingCodesJson,
          bookingUrl: values.bookingUrl.trim() || "/book-a-call",
          announcementBarJson: settings.announcementBarJson,
          redirectRulesJson: settings.redirectRulesJson,
          webhookUrl: settings.webhookUrl,
          customDomain: settings.customDomain,
          sslStatus: settings.sslStatus,
        }).unwrap();

        await refetch();
        toast.success("Navbar brand, logo & action settings published live!");
      } catch (err: unknown) {
        const apiErr = err as { data?: { error?: string } };
        toast.error(apiErr?.data?.error || "Failed to save navbar settings.");
      }
    },
  });

  useEffect(() => {
    if (!settings) return;

    let navCfg: NavbarConfig = {};
    if (settings.themeTokensJson) {
      try {
        const parsed = JSON.parse(settings.themeTokensJson) as { navbarConfig?: NavbarConfig };
        navCfg = parsed.navbarConfig || {};
      } catch {
        navCfg = {};
      }
    }

    const resolvedLogo = settings.logoUrl
      ? resolveMediaUrl(settings.logoUrl)
      : settings.logoMediaId
        ? resolveMediaUrl(`/api/v1/public/media/${settings.logoMediaId}/download`)
        : null;

    setLogoMediaId(settings.logoMediaId || null);
    setLogoPreviewUrl(resolvedLogo);

    formik.setValues({
      companyName: settings.companyName || "",
      tagline: navCfg.tagline || "",
      showSearch: navCfg.showSearch !== false,
      showCta: navCfg.showCta !== false,
      ctaText: navCfg.ctaText || "Book a Call",
      bookingUrl: settings.bookingUrl || "/book-a-call",
      alignment: navCfg.alignment || "center",
      sticky: navCfg.sticky !== false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    let hiddenMenuUrls: string[] = [];
    if (settings?.themeTokensJson) {
      try {
        const parsed = JSON.parse(settings.themeTokensJson) as { navbarConfig?: NavbarConfig };
        hiddenMenuUrls = parsed.navbarConfig?.hiddenMenuUrls || [];
      } catch {
        hiddenMenuUrls = [];
      }
    }
    onPreviewChange?.({
      companyName: formik.values.companyName,
      tagline: formik.values.tagline,
      logoPreviewUrl,
      showSearch: formik.values.showSearch,
      showCta: formik.values.showCta,
      ctaText: formik.values.ctaText,
      alignment: formik.values.alignment,
      sticky: formik.values.sticky,
      hiddenMenuUrls,
    });
  }, [
    settings?.themeTokensJson,
    formik.values.companyName,
    formik.values.tagline,
    formik.values.showSearch,
    formik.values.showCta,
    formik.values.ctaText,
    formik.values.alignment,
    formik.values.sticky,
    logoPreviewUrl,
    onPreviewChange,
  ]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 lg:sticky lg:top-20">
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
          <LayoutTemplate className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Brand, Logo &amp; Header Settings
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Changes reflect live in the preview above
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formik.values.companyName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Nexora Technology"
            className={`w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
              formik.touched.companyName && formik.errors.companyName
                ? "border-rose-500 focus:ring-rose-500"
                : "border-slate-200 dark:border-slate-800 focus:ring-primary"
            }`}
          />
          {formik.touched.companyName && formik.errors.companyName && (
            <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{formik.errors.companyName}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Brand Tagline (Optional)
          </label>
          <input
            type="text"
            name="tagline"
            value={formik.values.tagline}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Leave blank to hide"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Logo Picker */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoPreviewUrl ? (
              <img
                src={logoPreviewUrl}
                alt="Navbar Logo"
                className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0">
                {(formik.values.companyName || "N").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Logo</div>
              <div className="text-[10px] text-slate-500 truncate">
                {logoMediaId ? "Custom image" : "Initial monogram"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <ImageIcon className="w-3 h-3 text-primary" />
              <span>{logoMediaId ? "Change" : "Select"}</span>
            </button>
            {logoMediaId && (
              <button
                type="button"
                onClick={() => {
                  setLogoMediaId(null);
                  setLogoPreviewUrl(null);
                }}
                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Remove logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* CTA Controls */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              CTA Label
            </label>
            <input
              type="text"
              name="ctaText"
              value={formik.values.ctaText}
              onChange={formik.handleChange}
              placeholder="Book a Call"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              CTA Link
            </label>
            <input
              type="text"
              name="bookingUrl"
              value={formik.values.bookingUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="/book-a-call"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                formik.touched.bookingUrl && formik.errors.bookingUrl
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-200 dark:border-slate-800 focus:ring-primary"
              }`}
            />
          </div>
        </div>
        {formik.touched.bookingUrl && formik.errors.bookingUrl && (
          <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{formik.errors.bookingUrl}</span>
          </p>
        )}

        {/* Toggles */}
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={formik.values.showSearch}
              onChange={(e) => formik.setFieldValue("showSearch", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <Search className="w-3 h-3 text-slate-500" />
            <span>Search</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={formik.values.showCta}
              onChange={(e) => formik.setFieldValue("showCta", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <MousePointerClick className="w-3 h-3 text-slate-500" />
            <span>CTA Button</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={formik.values.sticky}
              onChange={(e) => formik.setFieldValue("sticky", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>Sticky</span>
          </label>
        </div>

        {/* Alignment */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Menu Alignment
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(
              [
                { id: "left", icon: AlignLeft, label: "Left" },
                { id: "center", icon: AlignCenter, label: "Center" },
                { id: "right", icon: AlignRight, label: "Right" },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = formik.values.alignment === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => formik.setFieldValue("alignment", opt.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    active
                      ? "bg-white dark:bg-slate-900 text-primary shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || !settings}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save Brand & Header Settings"}</span>
        </button>
      </form>

      <MediaPickerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSelect={(url, _alt, asset) => {
          setLogoPreviewUrl(url);
          if (asset?.id) {
            setLogoMediaId(asset.id);
          } else {
            const match = url.match(/\/api\/v1\/public\/media\/([0-9a-fA-F-]{36})/);
            if (match && match[1]) {
              setLogoMediaId(match[1]);
            }
          }
        }}
      />
    </div>
  );
};
