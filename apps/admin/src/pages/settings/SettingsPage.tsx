import React, { useState, useEffect } from "react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useTestSmtpConnectionMutation,
  useGetAdminPipelineStagesQuery,
  useCreatePipelineStageMutation,
  useUpdatePipelineStageMutation,
  useGetAdminCountryRegionsQuery,
  useCreateCountryRegionMutation,
  useUpdateCountryRegionMutation,
} from "../../store/api/adminApi";
import type { PipelineStage, CountryRegion } from "../../types";
import { MediaPickerModal, resolveMediaUrl } from "../media/MediaLibraryPage";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Layers,
  Globe,
  Plus,
  Edit2,
  X,
  Building2,
  Mail,
  Server,
  Eye,
  EyeOff,
  Send,
  Layout,
  BarChart3,
  Grid,
  BookOpen,
  HelpCircle,
  Megaphone,
  Palette,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "identity" | "theme" | "pipelines" | "regions" | "smtp" | "sections"
  >("identity");

  // Site Settings Query & Mutation
  const { data: settings, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [testSmtpConnection, { isLoading: isTestingSmtp }] =
    useTestSmtpConnectionMutation();

  // Lookups Queries & Mutations
  const { data: pipelineStages, refetch: refetchStages } =
    useGetAdminPipelineStagesQuery();
  const [createStage, { isLoading: creatingStage }] =
    useCreatePipelineStageMutation();
  const [updateStage, { isLoading: updatingStage }] =
    useUpdatePipelineStageMutation();

  const { data: countryRegions, refetch: refetchRegions } =
    useGetAdminCountryRegionsQuery();
  const [createRegion, { isLoading: creatingRegion }] =
    useCreateCountryRegionMutation();
  const [updateRegion, { isLoading: updatingRegion }] =
    useUpdateCountryRegionMutation();

  // Tab 1: Identity Form State
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [address, setAddress] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("IN");
  const [timeZoneId, setTimeZoneId] = useState("Asia/Kolkata");
  const [supportedRegions, setSupportedRegions] =
    useState("IN, US, AE, GB, SG");
  const [versionToken, setVersionToken] = useState("");
  const [logoMediaId, setLogoMediaId] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "conflict";
    message: string;
  } | null>(null);

  // Tab: Theme Tokens State
  const [primaryColor, setPrimaryColor] = useState("#7657ff");
  const [accentColor, setAccentColor] = useState("#3685ff");
  const [navyColor, setNavyColor] = useState("#10162f");
  const [fontSans, setFontSans] = useState("Inter");
  const [fontHeading, setFontHeading] = useState("Plus Jakarta Sans");
  const [borderRadius, setBorderRadius] = useState("0.5rem");
  const [buttonStyle, setButtonStyle] = useState("rounded");

  // Tab 2: Pipeline Stages State
  const [selectedCategory, setSelectedCategory] = useState<string>("Lead");
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [stageKey, setStageKey] = useState("");
  const [stageDisplayName, setStageDisplayName] = useState("");
  const [stageColorHex, setStageColorHex] = useState("#3b82f6");
  const [stageOrderIndex, setStageOrderIndex] = useState(0);

  // Tab 3: Regions State
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<CountryRegion | null>(
    null,
  );
  const [regCode, setRegCode] = useState("");
  const [regName, setRegName] = useState("");
  const [regCurrencyCode, setRegCurrencyCode] = useState("");
  const [regCurrencySymbol, setRegCurrencySymbol] = useState("");
  const [regFlagEmoji, setRegFlagEmoji] = useState("");
  const [regPhonePrefix, setRegPhonePrefix] = useState("");
  const [regTaxLabel, setRegTaxLabel] = useState("");
  const [regIsDefault, setRegIsDefault] = useState(false);

  // Tab 4: SMTP Gateway State
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState<number>(1025);
  const [smtpUseSsl, setSmtpUseSsl] = useState(false);
  const [smtpUserName, setSmtpUserName] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpShowPassword, setSmtpShowPassword] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Tab 5: Website Section Visibility State
  const [sectionVisibility, setSectionVisibility] = useState<
    Record<string, boolean>
  >({
    showHero: true,
    showMetricsBar: true,
    showCapabilitiesGrid: true,
    showBlogInsights: true,
    showCtaBanner: true,
    showFaq: true,
  });

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || "");
      setLegalName(settings.legalName || "");
      setSupportEmail(settings.supportEmail || "");
      setSupportPhone(settings.supportPhone || "");
      setAddress(settings.address || "");
      setDefaultRegion(settings.defaultRegion || "IN");
      setTimeZoneId(settings.timeZoneId || "Asia/Kolkata");
      setSupportedRegions((settings.supportedRegions || []).join(", "));
      setVersionToken(settings.versionToken || "");
      setLogoMediaId(settings.logoMediaId || null);
      if (settings.logoUrl) {
        setLogoPreviewUrl(settings.logoUrl);
      } else if (settings.logoMediaId) {
        setLogoPreviewUrl(
          `/api/v1/public/media/${settings.logoMediaId}/download`,
        );
      } else {
        setLogoPreviewUrl(null);
      }

      setSmtpHost(settings.smtpHost || "localhost");
      setSmtpPort(settings.smtpPort || 1025);
      setSmtpUseSsl(Boolean(settings.smtpUseSsl));
      setSmtpUserName(settings.smtpUserName || "");
      setSmtpPassword(settings.smtpPassword || "");
      setSmtpFromEmail(settings.smtpFromEmail || "noreply@nexora.local");
      setSmtpFromName(settings.smtpFromName || "Nexora Growth Platform");

      if (settings.themeTokensJson) {
        try {
          const parsed = JSON.parse(settings.themeTokensJson);
          if (parsed.primaryColor) setPrimaryColor(parsed.primaryColor);
          if (parsed.accentColor) setAccentColor(parsed.accentColor);
          if (parsed.navyColor) setNavyColor(parsed.navyColor);
          if (parsed.fontSans) setFontSans(parsed.fontSans);
          if (parsed.fontHeading) setFontHeading(parsed.fontHeading);
          if (parsed.radius) setBorderRadius(parsed.radius);
          if (parsed.buttonStyle) setButtonStyle(parsed.buttonStyle);
        } catch {
          // fallback
        }
      }

      if (settings.sectionVisibilityJson) {
        try {
          const parsed = JSON.parse(settings.sectionVisibilityJson);
          setSectionVisibility((prev) => ({ ...prev, ...parsed }));
        } catch {
          // fallback defaults
        }
      }
    }
  }, [settings]);

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const regionsList = supportedRegions
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    try {
      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: regionsList,
        timeZoneId,
        logoMediaId,
        versionToken,
        smtpHost: smtpHost.trim() || null,
        smtpPort: smtpPort ? Number(smtpPort) : null,
        smtpUseSsl,
        smtpUserName: smtpUserName.trim() || null,
        smtpPassword: smtpPassword.trim() || null,
        smtpFromEmail: smtpFromEmail.trim() || null,
        smtpFromName: smtpFromName.trim() || null,
        sectionVisibilityJson: JSON.stringify(sectionVisibility),
      }).unwrap();

      setVersionToken(res.versionToken);
      setFeedback({
        type: "success",
        message: "Platform settings updated successfully!",
      });
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { error?: string } };
      if (apiErr?.status === 409) {
        setFeedback({
          type: "conflict",
          message:
            "Concurrency conflict (409): Another administrator has modified the settings in the meantime. Please reload.",
        });
      } else {
        setFeedback({
          type: "error",
          message: apiErr?.data?.error || "Failed to update platform settings.",
        });
      }
    }
  };

  const applySmtpPreset = (
    preset: "mailpit" | "sendgrid" | "ses" | "gmail",
  ) => {
    if (preset === "mailpit") {
      setSmtpHost("localhost");
      setSmtpPort(1025);
      setSmtpUseSsl(false);
      setSmtpUserName("");
      setSmtpPassword("");
      setSmtpFromEmail("noreply@nexora.local");
      setSmtpFromName("Nexora Local Mailpit");
    } else if (preset === "sendgrid") {
      setSmtpHost("smtp.sendgrid.net");
      setSmtpPort(587);
      setSmtpUseSsl(true);
      setSmtpUserName("apikey");
    } else if (preset === "ses") {
      setSmtpHost("email-smtp.us-east-1.amazonaws.com");
      setSmtpPort(587);
      setSmtpUseSsl(true);
    } else if (preset === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort(587);
      setSmtpUseSsl(true);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const regionsList = supportedRegions
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: regionsList,
        timeZoneId,
        logoMediaId,
        versionToken,
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort),
        smtpUseSsl,
        smtpUserName: smtpUserName.trim() || null,
        smtpPassword: smtpPassword.trim() || null,
        smtpFromEmail:
          smtpFromEmail.trim() || supportEmail || "noreply@nexora.local",
        smtpFromName: smtpFromName.trim() || companyName || "Nexora Platform",
        sectionVisibilityJson: JSON.stringify(sectionVisibility),
      }).unwrap();

      setVersionToken(res.versionToken);
      setFeedback({
        type: "success",
        message:
          "SMTP Mail Gateway configuration saved and activated successfully!",
      });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: apiErr?.data?.error || "Failed to save SMTP settings.",
      });
    }
  };

  const handleSaveThemeTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const tokensPayload = JSON.stringify({
        primaryColor,
        accentColor,
        navyColor,
        fontSans,
        fontHeading,
        radius: borderRadius,
        buttonStyle,
      });

      const regionsList = supportedRegions
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: regionsList,
        timeZoneId,
        logoMediaId,
        versionToken,
        themeTokensJson: tokensPayload,
      }).unwrap();

      if (res.versionToken) setVersionToken(res.versionToken);
      setFeedback({
        type: "success",
        message:
          "Dynamic theme design tokens saved and applied to the platform!",
      });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: apiErr?.data?.error || "Failed to update theme tokens.",
      });
    }
  };

  const handleTestSmtp = async () => {
    if (!testRecipientEmail) {
      alert(
        "Please enter a recipient email address to test the SMTP connection.",
      );
      return;
    }
    setTestEmailResult(null);
    try {
      const res = await testSmtpConnection({
        host: smtpHost.trim(),
        port: Number(smtpPort),
        useSsl: smtpUseSsl,
        userName: smtpUserName.trim() || undefined,
        password: smtpPassword.trim() || undefined,
        fromEmail:
          smtpFromEmail.trim() || supportEmail || "noreply@nexora.local",
        fromName: smtpFromName.trim() || companyName || "Nexora Platform",
        recipientEmail: testRecipientEmail.trim(),
      }).unwrap();

      setTestEmailResult({
        success: true,
        message:
          res.message ||
          "Test email delivered successfully! SMTP connection verified.",
      });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setTestEmailResult({
        success: false,
        message:
          apiErr?.data?.error ||
          "SMTP test failed. Check host, port, credentials, or TLS settings.",
      });
    }
  };

  const handleSaveSectionVisibility = async () => {
    setFeedback(null);
    try {
      const regionsList = supportedRegions
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: regionsList,
        timeZoneId,
        logoMediaId,
        versionToken,
        smtpHost: smtpHost ? smtpHost.trim() : null,
        smtpPort: smtpPort ? Number(smtpPort) : null,
        smtpUseSsl,
        smtpUserName: smtpUserName ? smtpUserName.trim() : null,
        smtpPassword: smtpPassword ? smtpPassword.trim() : null,
        smtpFromEmail: smtpFromEmail ? smtpFromEmail.trim() : null,
        smtpFromName: smtpFromName ? smtpFromName.trim() : null,
        sectionVisibilityJson: JSON.stringify(sectionVisibility),
      }).unwrap();

      setVersionToken(res.versionToken);
      setFeedback({
        type: "success",
        message:
          "Website section visibility saved! The live website will reflect these toggles immediately.",
      });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: apiErr?.data?.error || "Failed to update section visibility.",
      });
    }
  };

  // Pipeline Stage Handlers
  const openCreateStage = () => {
    setEditingStage(null);
    setStageKey("");
    setStageDisplayName("");
    setStageColorHex("#3b82f6");
    setStageOrderIndex(
      pipelineStages?.filter((s) => s.category === selectedCategory).length ??
        0,
    );
    setStageModalOpen(true);
  };

  const openEditStage = (stage: PipelineStage) => {
    setEditingStage(stage);
    setStageKey(stage.stageKey);
    setStageDisplayName(stage.displayName);
    setStageColorHex(stage.colorHex);
    setStageOrderIndex(stage.orderIndex);
    setStageModalOpen(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStage) {
        await updateStage({
          id: editingStage.id,
          body: {
            displayName: stageDisplayName,
            colorHex: stageColorHex,
            orderIndex: stageOrderIndex,
            isActive: editingStage.isActive,
          },
        }).unwrap();
      } else {
        await createStage({
          category: selectedCategory,
          stageKey,
          displayName: stageDisplayName,
          colorHex: stageColorHex,
          orderIndex: stageOrderIndex,
        }).unwrap();
      }
      setStageModalOpen(false);
      refetchStages();
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      alert(errorObj?.data?.error || "Failed to save pipeline stage.");
    }
  };

  const handleToggleStageActive = async (stage: PipelineStage) => {
    try {
      await updateStage({
        id: stage.id,
        body: {
          displayName: stage.displayName,
          colorHex: stage.colorHex,
          orderIndex: stage.orderIndex,
          isActive: !stage.isActive,
        },
      }).unwrap();
      refetchStages();
    } catch {
      alert("Failed to toggle stage state.");
    }
  };

  // Region Handlers
  const openCreateRegion = () => {
    setEditingRegion(null);
    setRegCode("");
    setRegName("");
    setRegCurrencyCode("");
    setRegCurrencySymbol("");
    setRegFlagEmoji("🌐");
    setRegPhonePrefix("+");
    setRegTaxLabel("Tax / Compliance");
    setRegIsDefault(false);
    setRegionModalOpen(true);
  };

  const openEditRegion = (region: CountryRegion) => {
    setEditingRegion(region);
    setRegCode(region.code);
    setRegName(region.name);
    setRegCurrencyCode(region.currencyCode);
    setRegCurrencySymbol(region.currencySymbol);
    setRegFlagEmoji(region.flagEmoji);
    setRegPhonePrefix(region.phonePrefix);
    setRegTaxLabel(region.taxLabel);
    setRegIsDefault(region.isDefault);
    setRegionModalOpen(true);
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRegion) {
        await updateRegion({
          id: editingRegion.id,
          body: {
            name: regName,
            currencyCode: regCurrencyCode,
            currencySymbol: regCurrencySymbol,
            flagEmoji: regFlagEmoji,
            phonePrefix: regPhonePrefix,
            taxLabel: regTaxLabel,
            isDefault: regIsDefault,
            isEnabled: editingRegion.isEnabled,
            orderIndex: editingRegion.orderIndex,
          },
        }).unwrap();
      } else {
        await createRegion({
          code: regCode,
          name: regName,
          currencyCode: regCurrencyCode,
          currencySymbol: regCurrencySymbol,
          flagEmoji: regFlagEmoji,
          phonePrefix: regPhonePrefix,
          taxLabel: regTaxLabel,
          isDefault: regIsDefault,
          orderIndex: countryRegions?.length ?? 0,
        }).unwrap();
      }
      setRegionModalOpen(false);
      refetchRegions();
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      alert(errorObj?.data?.error || "Failed to save country region.");
    }
  };

  const handleToggleRegionEnabled = async (region: CountryRegion) => {
    try {
      await updateRegion({
        id: region.id,
        body: {
          name: region.name,
          currencyCode: region.currencyCode,
          currencySymbol: region.currencySymbol,
          flagEmoji: region.flagEmoji,
          phonePrefix: region.phonePrefix,
          taxLabel: region.taxLabel,
          isDefault: region.isDefault,
          isEnabled: !region.isEnabled,
          orderIndex: region.orderIndex,
        },
      }).unwrap();
      refetchRegions();
    } catch {
      alert("Failed to toggle region state.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading global platform configuration...</span>
      </div>
    );
  }

  const filteredStages = (pipelineStages || []).filter(
    (s) => s.category.toLowerCase() === selectedCategory.toLowerCase(),
  );

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Master Configuration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dynamically configure enterprise branding, lead & CRM lifecycle
            stages, global multi-region presets, custom SMTP server, and live
            website visibility toggles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetch();
            refetchStages();
            refetchRegions();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload All</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "identity"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Platform Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "theme"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Design Tokens</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pipelines")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "pipelines"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pipeline Stages ({pipelineStages?.length ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("regions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "regions"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global Regions ({countryRegions?.length ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("smtp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "smtp"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email & SMTP Gateway</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "sections"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Website Section Toggles</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : feedback.type === "conflict"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.type === "conflict" && (
            <button
              onClick={() => {
                setFeedback(null);
                refetch();
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Latest
            </button>
          )}
        </div>
      )}

      {/* Tab 1: Platform Identity & Defaults */}
      {activeTab === "identity" && (
        <form onSubmit={handleIdentitySubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Enterprise Identity & Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nexora Digital Solutions Pvt Ltd"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Support Phone / Hotline
                </label>
                <input
                  type="tel"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Headquarters Registered Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Street, City, State, Country, Postal Code"
                />
              </div>

              {/* Brand Logo & Icon */}
              <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Platform Brand Logo & Emblem
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-1.5 shadow-inner">
                    {logoPreviewUrl ? (
                      <img
                        src={resolveMediaUrl(logoPreviewUrl)}
                        alt={companyName || "Logo"}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {companyName
                          ? companyName.charAt(0).toUpperCase()
                          : "N"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsLogoModalOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                      >
                        {logoPreviewUrl
                          ? "Change Logo"
                          : "Choose / Upload Logo"}
                      </button>

                      {logoPreviewUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoMediaId(null);
                            setLogoPreviewUrl(null);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: Transparent PNG, SVG, or WebP. Displayed in
                      Admin navbar and Public website.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Regional Defaults & Timezone
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Platform Home Region
                </label>
                <select
                  value={defaultRegion}
                  onChange={(e) => setDefaultRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {(countryRegions || []).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.flagEmoji} {r.name} ({r.currencyCode} -{" "}
                      {r.currencySymbol})
                    </option>
                  ))}
                  {(countryRegions || []).length === 0 && (
                    <>
                      <option value="IN">🇮🇳 India (INR - ₹)</option>
                      <option value="US">🇺🇸 United States (USD - $)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Platform Time Zone
                </label>
                <input
                  type="text"
                  required
                  value={timeZoneId}
                  onChange={(e) => setTimeZoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Asia/Kolkata or UTC"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Active Multi-Region Codes
                </label>
                <input
                  type="text"
                  required
                  value={supportedRegions}
                  onChange={(e) => setSupportedRegions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                  placeholder="IN, US, AE, GB"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Identity Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Dynamic Theme Tokens */}
      {activeTab === "theme" && (
        <form onSubmit={handleSaveThemeTokens} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <span>Dynamic Brand Colors & Tokens</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize core CSS variable tokens. These settings directly
                  style both the public website and admin dashboard without
                  redeploying code.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Theme Tokens"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Brand Color */}
              <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Used for primary action buttons, active states, and highlights
                  (--nexora-purple).
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Used for secondary buttons, badges, and gradient accents
                  (--nexora-blue).
                </p>
              </div>

              {/* Dark Navy Background */}
              <div className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dark Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={navyColor}
                    onChange={(e) => setNavyColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={navyColor}
                    onChange={(e) => setNavyColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Used for dark hero backgrounds, footer, and midnight sections
                  (--nexora-navy).
                </p>
              </div>
            </div>

            {/* Typography & Radii */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Heading Typography
                </label>
                <select
                  value={fontHeading}
                  onChange={(e) => setFontHeading(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="Plus Jakarta Sans">
                    Plus Jakarta Sans (Modern MNC)
                  </option>
                  <option value="Inter">Inter (Clean Tech)</option>
                  <option value="Poppins">Poppins (Friendly Geometric)</option>
                  <option value="Outfit">Outfit (High-End SaaS)</option>
                  <option value="Playfair Display">
                    Playfair Display (Editorial Luxury)
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Body Typography
                </label>
                <select
                  value={fontSans}
                  onChange={(e) => setFontSans(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="Inter">Inter (Standard Enterprise)</option>
                  <option value="system-ui">System UI (Native OS)</option>
                  <option value="Open Sans">Open Sans (High Legibility)</option>
                  <option value="Roboto">Roboto (Google Neutral)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Corner Radius
                </label>
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="0.25rem">
                    0.25rem (Sharp / Modern Minimalist)
                  </option>
                  <option value="0.5rem">0.5rem (Default Enterprise)</option>
                  <option value="0.75rem">0.75rem (Rounded Modern)</option>
                  <option value="1rem">1.0rem (Organic / Soft UI)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Button Style Preset
                </label>
                <select
                  value={buttonStyle}
                  onChange={(e) => setButtonStyle(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="rounded">Rounded Rectangle</option>
                  <option value="pill">Pill (Fully Rounded)</option>
                  <option value="sharp">Sharp (Clean Rectangle)</option>
                </select>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Live Token Preview
              </h4>
              <div
                className="p-6 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all"
                style={{
                  backgroundColor: navyColor,
                  borderRadius: borderRadius,
                  fontFamily: fontSans,
                }}
              >
                <div>
                  <h5
                    className="text-lg font-black text-white"
                    style={{ fontFamily: fontHeading }}
                  >
                    Next-Generation Marketing Platform
                  </h5>
                  <p className="text-xs text-slate-300 mt-1">
                    Previewing live typography and button styles under{" "}
                    {fontHeading} and {primaryColor}.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius:
                        buttonStyle === "pill"
                          ? "9999px"
                          : buttonStyle === "sharp"
                            ? "0px"
                            : borderRadius,
                    }}
                  >
                    Primary Action
                  </button>

                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-bold text-white border border-white/20 transition-transform active:scale-95"
                    style={{
                      backgroundColor: accentColor,
                      borderRadius:
                        buttonStyle === "pill"
                          ? "9999px"
                          : buttonStyle === "sharp"
                            ? "0px"
                            : borderRadius,
                    }}
                  >
                    Accent Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Dynamic Pipeline Stages */}
      {activeTab === "pipelines" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2">
              {["Lead", "Client", "Task"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat} Pipeline Stages
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateStage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom {selectedCategory} Stage</span>
            </button>
          </div>

          {/* Stages Table */}
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5 text-left">
                      Order & Visual Badge
                    </th>
                    <th className="px-4 py-3.5 text-left">Display Name</th>
                    <th className="px-4 py-3.5 text-left">Stage Key</th>
                    <th className="px-4 py-3.5 text-left">Numeric Value</th>
                    <th className="px-4 py-3.5 text-left">Type</th>
                    <th className="px-4 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredStages.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-slate-400 font-bold w-4">
                            #{s.orderIndex}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                            style={{
                              borderColor: `${s.colorHex}40`,
                              backgroundColor: `${s.colorHex}15`,
                              color: s.colorHex,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: s.colorHex }}
                            />
                            {s.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {s.displayName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {s.stageKey}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {s.value}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.isSystem
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40"
                          }`}
                        >
                          {s.isSystem ? "System Native" : "Custom"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStageActive(s)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                            s.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {s.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditStage(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStages.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-400"
                      >
                        No stages configured for this pipeline category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Global Regions & Currencies */}
      {activeTab === "regions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure country compliance, localized currency formatting, phone
              prefixes, and tax structures dynamically.
            </p>

            <button
              type="button"
              onClick={openCreateRegion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Global Country</span>
            </button>
          </div>

          {/* Regions Table */}
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Country & Code</th>
                    <th className="px-4 py-3.5 text-left">Currency</th>
                    <th className="px-4 py-3.5 text-left">Phone Prefix</th>
                    <th className="px-4 py-3.5 text-left">Tax / Compliance</th>
                    <th className="px-4 py-3.5 text-left">Default</th>
                    <th className="px-4 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {(countryRegions || []).map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{r.flagEmoji}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {r.name}
                            </span>
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                              {r.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                          {r.currencySymbol}
                        </span>
                        <span className="font-mono text-slate-500">
                          {r.currencyCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {r.phonePrefix}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                        {r.taxLabel}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.isDefault ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                            Home Default
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleRegionEnabled(r)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                            r.isEnabled
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {r.isEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditRegion(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(countryRegions || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-400"
                      >
                        No global regions configured. Click &quot;Add Global
                        Country&quot; to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SMTP Email Gateway */}
      {activeTab === "smtp" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Outbound SMTP Email Gateway
                  </h3>
                  {settings?.smtpIsConfigured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active (Custom SMTP)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Active (Mailpit Localhost:1025)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Configure live outbound mail server for lead inquiry
                  acknowledgments, CRM notifications, password resets, and audit
                  alerts.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applySmtpPreset("mailpit")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Mailpit (Dev)
                </button>
                <button
                  type="button"
                  onClick={() => applySmtpPreset("sendgrid")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  SendGrid
                </button>
                <button
                  type="button"
                  onClick={() => applySmtpPreset("ses")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  AWS SES
                </button>
                <button
                  type="button"
                  onClick={() => applySmtpPreset("gmail")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Gmail
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Server Host
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="e.g. localhost, smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="1025, 587, 465, or 25"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smtpUseSsl"
                  checked={smtpUseSsl}
                  onChange={(e) => setSmtpUseSsl(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label
                  htmlFor="smtpUseSsl"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Enable SSL / TLS Encryption (Mandatory for port 465;
                  recommended for port 587 via STARTTLS)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Username / API Key
                  </label>
                  <input
                    type="text"
                    value={smtpUserName}
                    onChange={(e) => setSmtpUserName(e.target.value)}
                    placeholder="e.g. apikey, postmaster@yourdomain.com (Leave empty if no auth required)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      SMTP Password / Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setSmtpShowPassword(!smtpShowPassword)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1"
                    >
                      {smtpShowPassword ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>{smtpShowPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <input
                    type={smtpShowPassword ? "text" : "password"}
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="Enter SMTP password or API token"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="noreply@nexora.local or info@yourdomain.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default From Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="Nexora Growth Platform"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? "Saving Configuration..."
                      : "Save SMTP Gateway Settings"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-time SMTP Diagnostics Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Live SMTP Handshake & Test Delivery
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trigger a live SMTP connection test with the parameters above. A
              diagnostic email will be sent immediately to verify socket
              connection, TLS negotiation, and mail relay.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <input
                type="email"
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                placeholder="Enter recipient email (e.g. test@nexora.local or your email)"
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                {isTestingSmtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testing Handshake...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Diagnostic Test Email</span>
                  </>
                )}
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  testEmailResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                }`}
              >
                {testEmailResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{testEmailResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Website Section Toggles */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dynamic Public Website Section Visibility
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Toggle individual sections on the public homepage on or off in
                  real time without code deployments. Changes persist
                  immediately in the platform database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/40 transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Preview Website</span>
                </a>
                <button
                  type="button"
                  onClick={handleSaveSectionVisibility}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving ? "Saving..." : "Save Visibility Settings"}
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle Switches List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "showHero",
                  title: "Hero Banner & Value Proposition",
                  description:
                    "Main above-the-fold headline, enterprise badges, and primary call-to-action buttons.",
                  icon: Layout,
                },
                {
                  key: "showMetricsBar",
                  title: "Key Metrics & Live Telemetry",
                  description:
                    "Enterprise metrics bar displaying pipeline influenced, account audits, and attribution stats.",
                  icon: BarChart3,
                },
                {
                  key: "showCapabilitiesGrid",
                  title: "Enterprise Capabilities 6-Grid",
                  description:
                    "Comprehensive grid showcasing SEO, multi-channel attribution, AI audience modeling, and tracking.",
                  icon: Grid,
                },
                {
                  key: "showBlogInsights",
                  title: "Thought Leadership & Recent Articles",
                  description:
                    "Dynamically populated recent articles and strategic guides pulled from the blog collection.",
                  icon: BookOpen,
                },
                {
                  key: "showCtaBanner",
                  title: "Bottom Enterprise Conversion CTA Banner",
                  description:
                    "High-contrast conversion banner inviting visitors to schedule an executive growth diagnostic.",
                  icon: Megaphone,
                },
                {
                  key: "showFaq",
                  title: "Enterprise FAQ & Compliance Matrix",
                  description:
                    "Interactive FAQ section answering enterprise security, onboarding, and multi-country questions.",
                  icon: HelpCircle,
                },
              ].map((item) => {
                const isEnabled = sectionVisibility[item.key] !== false;
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      setSectionVisibility((prev) => ({
                        ...prev,
                        [item.key]: !isEnabled,
                      }))
                    }
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isEnabled
                        ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/60 shadow-sm"
                        : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                          isEnabled
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isEnabled
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {isEnabled ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Smooth Pill Switch */}
                    <button
                      type="button"
                      aria-label={`Toggle ${item.title}`}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled
                          ? "bg-indigo-600"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tip: After saving, reload the public website tab to verify that
                the disabled sections are removed from the DOM.
              </span>
              <button
                type="button"
                onClick={handleSaveSectionVisibility}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSaving ? "Saving..." : "Save Visibility Settings"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Create/Edit Modal */}
      {stageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingStage
                  ? `Edit ${editingStage.displayName}`
                  : `Add New ${selectedCategory} Stage`}
              </h3>
              <button
                onClick={() => setStageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stage Display Name
                </label>
                <input
                  type="text"
                  required
                  value={stageDisplayName}
                  onChange={(e) => setStageDisplayName(e.target.value)}
                  placeholder="e.g. Demo Scheduled"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!editingStage && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Key (Unique slug)
                  </label>
                  <input
                    type="text"
                    required
                    value={stageKey}
                    onChange={(e) =>
                      setStageKey(
                        e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      )
                    }
                    placeholder="e.g. demo_scheduled"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Color (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stageColorHex}
                      onChange={(e) => setStageColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={stageColorHex}
                      onChange={(e) => setStageColorHex(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={stageOrderIndex}
                    onChange={(e) => setStageOrderIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStage || updatingStage}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {creatingStage || updatingStage ? "Saving..." : "Save Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Region Create/Edit Modal */}
      {regionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingRegion
                  ? `Edit Country: ${editingRegion.name}`
                  : "Add New Global Country Region"}
              </h3>
              <button
                onClick={() => setRegionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country Code (2-letter)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingRegion)}
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DE, CA, AU"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Germany"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    required
                    value={regFlagEmoji}
                    onChange={(e) => setRegFlagEmoji(e.target.value)}
                    placeholder="🇩🇪"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-base text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    required
                    value={regCurrencyCode}
                    onChange={(e) =>
                      setRegCurrencyCode(e.target.value.toUpperCase())
                    }
                    placeholder="EUR"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={regCurrencySymbol}
                    onChange={(e) => setRegCurrencySymbol(e.target.value)}
                    placeholder="€"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Prefix
                  </label>
                  <input
                    type="text"
                    required
                    value={regPhonePrefix}
                    onChange={(e) => setRegPhonePrefix(e.target.value)}
                    placeholder="+49"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tax / Compliance Label
                  </label>
                  <input
                    type="text"
                    required
                    value={regTaxLabel}
                    onChange={(e) => setRegTaxLabel(e.target.value)}
                    placeholder="VAT / GST"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regIsDefault"
                  checked={regIsDefault}
                  onChange={(e) => setRegIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="regIsDefault"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Set as platform default home region
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRegion || updatingRegion}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {creatingRegion || updatingRegion
                    ? "Saving..."
                    : "Save Country"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Logo Picker Modal */}
      <MediaPickerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSelect={(url, _alt, asset) => {
          setLogoPreviewUrl(url);
          if (asset?.id) {
            setLogoMediaId(asset.id);
          } else {
            const match = url.match(
              /\/api\/v1\/public\/media\/([0-9a-fA-F-]{36})/,
            );
            if (match && match[1]) {
              setLogoMediaId(match[1]);
            }
          }
        }}
      />
    </div>
  );
};
