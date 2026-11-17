import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  useGetSystemTimezonesQuery,
  useGetCurrenciesQuery,
} from "../../store/api/adminApi";
import type { PipelineStage, CountryRegion } from "../../types";
import * as yup from "yup";
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
  Sparkles,
  Phone,
  Check,
  AlertTriangle,
} from "lucide-react";

export interface GlobalCountryMeta {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
}

export const DEFAULT_GLOBAL_COUNTRIES: GlobalCountryMeta[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", currencyCode: "INR", currencySymbol: "₹" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", currencyCode: "USD", currencySymbol: "$" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", currencyCode: "GBP", currencySymbol: "£" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", currencyCode: "AED", currencySymbol: "AED" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", currencyCode: "SGD", currencySymbol: "S$" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", currencyCode: "CAD", currencySymbol: "$" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", currencyCode: "AUD", currencySymbol: "$" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", currencyCode: "EUR", currencySymbol: "€" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", currencyCode: "EUR", currencySymbol: "€" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", currencyCode: "SAR", currencySymbol: "﷼" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", currencyCode: "JPY", currencySymbol: "¥" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", currencyCode: "MYR", currencySymbol: "RM" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", currencyCode: "IDR", currencySymbol: "Rp" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", currencyCode: "ZAR", currencySymbol: "R" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", currencyCode: "EUR", currencySymbol: "€" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭", currencyCode: "CHF", currencySymbol: "CHF" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", currencyCode: "BDT", currencySymbol: "৳" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", currencyCode: "PKR", currencySymbol: "Rs" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", currencyCode: "NPR", currencySymbol: "रू" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", currencyCode: "LKR", currencySymbol: "Rs" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", currencyCode: "BRL", currencySymbol: "R$" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", currencyCode: "MXN", currencySymbol: "$" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", currencyCode: "EUR", currencySymbol: "€" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", currencyCode: "EUR", currencySymbol: "€" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", currencyCode: "NZD", currencySymbol: "$" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪", currencyCode: "EUR", currencySymbol: "€" },
];

export const phoneValidationSchema = yup.object().shape({
  phoneCountryCode: yup
    .string()
    .required("Country dial code is required")
    .matches(/^\+\d{1,4}$/, "Dial code must start with + and have 1-4 digits"),
  phoneNationalNumber: yup
    .string()
    .required("Phone number is required")
    .test(
      "is-valid-digits",
      "Enter a valid national phone number (7 to 15 digits, numbers only)",
      (val) => {
        if (!val) return false;
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
    ),
});

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "identity" | "pipelines" | "regions" | "smtp" | "tracking"
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

  // Dynamic Lookups (Backend .NET Timezones & Currencies)
  const { data: systemTimezones, isLoading: loadingTimezones } =
    useGetSystemTimezonesQuery();
  const { data: globalCurrencies, isLoading: loadingCurrencies } =
    useGetCurrenciesQuery();

  // Tab 1: Identity Form State
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNationalNumber, setPhoneNationalNumber] = useState("");
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("IN");
  const [timeZoneId, setTimeZoneId] = useState("Asia/Kolkata");
  const [activeRegionCodes, setActiveRegionCodes] = useState<string[]>([
    "IN",
    "US",
    "AE",
    "GB",
    "SG",
  ]);
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

  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [accentColor, setAccentColor] = useState("#06b6d4");
  const [navyColor, setNavyColor] = useState("#080c14");
  const [fontSans, setFontSans] = useState("Inter");
  const [fontHeading, setFontHeading] = useState("Plus Jakarta Sans");
  const [borderRadius, setBorderRadius] = useState("0.5rem");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [animationMode, setAnimationMode] = useState<"full" | "reduced" | "off">("full");
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<
    "fast" | "normal" | "slow"
  >("normal");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    "Enterprise Engine 2.0 Global B2B Performance Marketing",
  );
  const [announcementLink, setAnnouncementLink] = useState("/book-a-call");
  const [announcementBadge, setAnnouncementBadge] = useState("Enterprise 2.0");

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

  // Tab 5: Marketing Pixels & Analytics State
  const [gtmContainerId, setGtmContainerId] = useState("");
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [searchConsoleVerification, setSearchConsoleVerification] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

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
      if (settings.supportPhone) {
        const raw = settings.supportPhone.trim();
        const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
        if (match && match[1] && match[2] !== undefined) {
          setPhoneCountryCode(match[1]);
          setPhoneNationalNumber(match[2].trim());
          setSupportPhone(raw);
        } else {
          setPhoneCountryCode("+91");
          setPhoneNationalNumber(raw);
          setSupportPhone(`+91 ${raw}`);
        }
      } else {
        setPhoneCountryCode("+91");
        setPhoneNationalNumber("");
        setSupportPhone("");
      }
      setPhoneValidationError(null);

      setAddress(settings.address || "");
      setDefaultRegion(settings.defaultRegion || "IN");
      setTimeZoneId(settings.timeZoneId || "Asia/Kolkata");
      const loadedRegions =
        settings.supportedRegions && settings.supportedRegions.length > 0
          ? settings.supportedRegions
          : ["IN", "US", "AE", "GB", "SG"];
      setActiveRegionCodes(loadedRegions);
      setSupportedRegions(loadedRegions.join(", "));
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
          if (parsed.animationMode) {
            setAnimationMode(parsed.animationMode);
          } else if (parsed.animation?.enabled === false) {
            setAnimationMode("off");
          }
          if (parsed.animation) {
            if (typeof parsed.animation.enabled === "boolean")
              setAnimationEnabled(parsed.animation.enabled);
            if (parsed.animation.speed)
              setAnimationSpeed(parsed.animation.speed);
          }
        } catch {
          // fallback
        }
      }

      if (settings.announcementBarJson) {
        try {
          const parsed = JSON.parse(settings.announcementBarJson);
          if (typeof parsed.enabled === "boolean")
            setAnnouncementEnabled(parsed.enabled);
          if (parsed.text) setAnnouncementText(parsed.text);
          if (parsed.link) setAnnouncementLink(parsed.link);
          if (parsed.badge) setAnnouncementBadge(parsed.badge);
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

      if (settings.trackingCodesJson) {
        try {
          const parsed = JSON.parse(settings.trackingCodesJson);
          if (parsed.gtmContainerId) setGtmContainerId(parsed.gtmContainerId);
          if (parsed.gaMeasurementId) setGaMeasurementId(parsed.gaMeasurementId);
          if (parsed.metaPixelId) setMetaPixelId(parsed.metaPixelId);
          if (parsed.searchConsoleVerification) setSearchConsoleVerification(parsed.searchConsoleVerification);
        } catch {
          // fallback
        }
      }

      if (settings.bookingUrl) {
        setBookingUrl(settings.bookingUrl);
      }
    }
  }, [settings]);

  const handlePhoneChange = async (newCode: string, newNumber: string) => {
    setPhoneCountryCode(newCode);
    setPhoneNationalNumber(newNumber);
    const combined = newNumber.trim() ? `${newCode} ${newNumber.trim()}` : "";
    setSupportPhone(combined);

    if (newNumber.trim().length > 0) {
      try {
        await phoneValidationSchema.validate({
          phoneCountryCode: newCode,
          phoneNationalNumber: newNumber,
        });
        setPhoneValidationError(null);
      } catch (err: unknown) {
        if (err instanceof yup.ValidationError) {
          setPhoneValidationError(err.message);
        }
      }
    } else {
      setPhoneValidationError(null);
    }
  };

  const handleAddRegion = (codeToAdd: string) => {
    const upper = codeToAdd.trim().toUpperCase();
    if (!upper || activeRegionCodes.includes(upper)) return;
    const updated = [...activeRegionCodes, upper];
    setActiveRegionCodes(updated);
    setSupportedRegions(updated.join(", "));
  };

  const handleRemoveRegion = (codeToRemove: string) => {
    if (codeToRemove.toUpperCase() === defaultRegion.toUpperCase()) {
      alert(
        `Cannot remove ${codeToRemove} because it is the current Default Platform Home Region. Switch the default region first.`,
      );
      return;
    }
    const updated = activeRegionCodes.filter(
      (c) => c.toUpperCase() !== codeToRemove.toUpperCase(),
    );
    setActiveRegionCodes(updated);
    setSupportedRegions(updated.join(", "));
  };

  const getRegionMeta = (
    code: string,
  ): { flag: string; name: string; currency: string } => {
    const fromApi = (countryRegions || []).find(
      (r) => r.code.toUpperCase() === code.toUpperCase(),
    );
    if (fromApi) {
      return {
        flag: fromApi.flagEmoji || "🌐",
        name: fromApi.name,
        currency: `${fromApi.currencyCode} (${fromApi.currencySymbol})`,
      };
    }
    const fromGlobal = DEFAULT_GLOBAL_COUNTRIES.find(
      (c) => c.code.toUpperCase() === code.toUpperCase(),
    );
    if (fromGlobal) {
      return {
        flag: fromGlobal.flag,
        name: fromGlobal.name,
        currency: `${fromGlobal.currencyCode} (${fromGlobal.currencySymbol})`,
      };
    }
    return {
      flag: "🌐",
      name: code,
      currency: "Standard",
    };
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate international phone with Yup
    if (phoneNationalNumber.trim()) {
      try {
        await phoneValidationSchema.validate({
          phoneCountryCode,
          phoneNationalNumber,
        });
        setPhoneValidationError(null);
      } catch (err: unknown) {
        if (err instanceof yup.ValidationError) {
          setPhoneValidationError(err.message);
          setFeedback({
            type: "error",
            message: `Validation Error (Phone): ${err.message}`,
          });
          return;
        }
      }
    }

    const fullPhone = phoneNationalNumber.trim()
      ? `${phoneCountryCode} ${phoneNationalNumber.trim()}`
      : "";

    try {
      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone: fullPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: activeRegionCodes,
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
        themeTokensJson: JSON.stringify({
          ...(settings?.themeTokensJson ? JSON.parse(settings.themeTokensJson) : {}),
          animationMode,
          animation: {
            enabled: animationMode !== "off",
            speed: animationMode === "reduced" ? "slow" : "normal",
          },
        }),
        announcementBarJson: JSON.stringify({
          enabled: announcementEnabled,
          text: announcementText,
          link: announcementLink,
          badge: announcementBadge,
        }),
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

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trackingPayload = JSON.stringify({
      gtmContainerId: gtmContainerId.trim(),
      gaMeasurementId: gaMeasurementId.trim(),
      metaPixelId: metaPixelId.trim(),
      searchConsoleVerification: searchConsoleVerification.trim(),
    });

    try {
      const res = await updateSettings({
        companyName,
        legalName: legalName || null,
        supportEmail,
        supportPhone: phoneNationalNumber.trim() ? `${phoneCountryCode} ${phoneNationalNumber.trim()}` : supportPhone,
        address: address || null,
        defaultRegion,
        supportedRegions: activeRegionCodes,
        timeZoneId,
        logoMediaId,
        versionToken,
        trackingCodesJson: trackingPayload,
        bookingUrl: bookingUrl.trim() || undefined,
      }).unwrap();

      setVersionToken(res.versionToken);
      setFeedback({
        type: "success",
        message: "Marketing analytics, pixels, and tracking tags saved and deployed to live website!",
      });
      toast.success("Marketing tracking pixels saved successfully!");
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { error?: string } };
      if (apiErr?.status === 409) {
        setFeedback({
          type: "conflict",
          message: "Concurrency conflict (409): Settings modified by another user. Please reload.",
        });
      } else {
        setFeedback({
          type: "error",
          message: apiErr?.data?.error || "Failed to update tracking configuration.",
        });
        toast.error("Failed to save tracking tags.");
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
        themeTokensJson: JSON.stringify({
          ...(settings?.themeTokensJson ? JSON.parse(settings.themeTokensJson) : {}),
          animationMode,
          animation: {
            enabled: animationMode !== "off",
            speed: animationMode === "reduced" ? "slow" : "normal",
          },
        }),
        announcementBarJson: JSON.stringify({
          enabled: announcementEnabled,
          text: announcementText,
          link: announcementLink,
          badge: announcementBadge,
        }),
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
        themeTokensJson: JSON.stringify({
          ...(settings?.themeTokensJson ? JSON.parse(settings.themeTokensJson) : {}),
          animationMode,
          animation: {
            enabled: animationMode !== "off",
            speed: animationMode === "reduced" ? "slow" : "normal",
          },
        }),
        announcementBarJson: JSON.stringify({
          enabled: announcementEnabled,
          text: announcementText,
          link: announcementLink,
          badge: announcementBadge,
        }),
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
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Platform Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pipelines")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "pipelines"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
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
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
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
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email & SMTP Gateway</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracking")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "tracking"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Marketing Pixels & Analytics</span>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Support Phone / Hotline</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    International Multi-Country Format
                  </span>
                </label>
                <div className="flex gap-2">
                  {/* Country Dial Code Selector */}
                  <select
                    value={phoneCountryCode}
                    onChange={(e) =>
                      handlePhoneChange(e.target.value, phoneNationalNumber)
                    }
                    className="w-32 px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                  >
                    {DEFAULT_GLOBAL_COUNTRIES.map((c) => (
                      <option
                        key={`${c.code}-${c.dialCode}`}
                        value={c.dialCode}
                      >
                        {c.flag} {c.code} ({c.dialCode})
                      </option>
                    ))}
                  </select>

                  {/* National Phone Number Input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      value={phoneNationalNumber}
                      onChange={(e) =>
                        handlePhoneChange(phoneCountryCode, e.target.value)
                      }
                      placeholder="e.g. 8889647593 or 555-0199"
                      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                        phoneValidationError
                          ? "border-rose-400 dark:border-rose-600 focus:ring-rose-500"
                          : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Live Yup Validation Indicator */}
                {phoneValidationError ? (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneValidationError}</span>
                  </p>
                ) : phoneNationalNumber.trim().length >= 7 ? (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Valid number: {phoneCountryCode} {phoneNationalNumber}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Select country code and enter 7-15 digit telephone or mobile number.
                  </p>
                )}
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

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Regional Defaults, Platform Timezone & Multi-Country Markets
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure global multi-country support, dynamic server timezones, and active country target markets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Platform Home Region
                </label>
                <select
                  value={defaultRegion}
                  onChange={(e) => {
                    const newDef = e.target.value;
                    setDefaultRegion(newDef);
                    if (!activeRegionCodes.includes(newDef)) {
                      const updated = [...activeRegionCodes, newDef];
                      setActiveRegionCodes(updated);
                      setSupportedRegions(updated.join(", "));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {(countryRegions || []).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.flagEmoji} {r.name} ({r.currencyCode} - {r.currencySymbol})
                    </option>
                  ))}
                  {(countryRegions || []).length === 0 && (
                    <>
                      <option value="IN">🇮🇳 India (INR - ₹)</option>
                      <option value="US">🇺🇸 United States (USD - $)</option>
                    </>
                  )}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Primary home market used for default pricing display and lead assignment.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Platform Time Zone</span>
                  {loadingTimezones ? (
                    <span className="text-[10px] text-slate-400 animate-pulse">Loading .NET timezones...</span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ {systemTimezones?.length || 0} Dynamic Timezones
                    </span>
                  )}
                </label>
                <select
                  value={timeZoneId}
                  onChange={(e) => setTimeZoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <optgroup label="Popular Global Time Zones">
                    <option value="Asia/Kolkata">India Standard Time - Asia/Kolkata (UTC+05:30)</option>
                    <option value="UTC">Coordinated Universal Time - UTC (UTC+00:00)</option>
                    <option value="America/New_York">Eastern Time (US) - America/New_York (UTC-05:00)</option>
                    <option value="America/Los_Angeles">Pacific Time (US) - America/Los_Angeles (UTC-08:00)</option>
                    <option value="Europe/London">London / GMT - Europe/London (UTC+00:00)</option>
                    <option value="Asia/Dubai">Gulf Standard Time - Asia/Dubai (UTC+04:00)</option>
                    <option value="Asia/Singapore">Singapore Time - Asia/Singapore (UTC+08:00)</option>
                    <option value="Europe/Berlin">Central European Time - Europe/Berlin (UTC+01:00)</option>
                    <option value="Asia/Tokyo">Japan Standard Time - Asia/Tokyo (UTC+09:00)</option>
                    <option value="Australia/Sydney">Australian Eastern Time - Australia/Sydney (UTC+10:00)</option>
                  </optgroup>
                  {systemTimezones && systemTimezones.length > 0 && (
                    <optgroup label="All Server System Timezones (.NET TimeZoneInfo)">
                      {systemTimezones.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.displayName} ({tz.id})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  System clock for background cron jobs, task schedules, audit logs, and lead timestamps.
                </p>
              </div>
            </div>

            {/* Active Multi-Region Badges Selector */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active Multi-Region Codes & Target Markets
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Interactive region pills. Add or remove supported country markets for multi-country routing and currencies.
                  </p>
                </div>

                {/* Add Region Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddRegion(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>
                      + Add Target Market...
                    </option>
                    {DEFAULT_GLOBAL_COUNTRIES.filter(
                      (c) => !activeRegionCodes.includes(c.code.toUpperCase()),
                    ).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code} - {c.currencyCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Region Pills Container */}
              <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 min-h-[58px] items-center">
                {activeRegionCodes.map((code) => {
                  const meta = getRegionMeta(code);
                  const isHome =
                    code.toUpperCase() === defaultRegion.toUpperCase();
                  return (
                    <div
                      key={code}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm transition ${
                        isHome
                          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/60 text-indigo-900 dark:text-indigo-200"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="text-base leading-none">{meta.flag}</span>
                      <span className="font-mono font-bold">{code}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        {meta.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {meta.currency}
                      </span>
                      {isHome ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold tracking-wider uppercase">
                          HOME
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveRegion(code)}
                          title={`Remove ${code} from active regions`}
                          className="ml-1 p-0.5 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 rounded-md transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Animation & Motion Control (Hard Rule 9) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Website Motion &amp; Animation Engine
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control public website animations globally from database without rebuild.
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "full",
                    label: "Full Motion",
                    desc: "GPU reveals, count-up & micro-interactions",
                  },
                  {
                    id: "reduced",
                    label: "Reduced Motion",
                    desc: "Instant transitions, no movement (accessible)",
                  },
                  {
                    id: "off",
                    label: "Off",
                    desc: "Completely disable all animations",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setAnimationMode(mode.id as "full" | "reduced" | "off")
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      animationMode === mode.id
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-xs font-bold">{mode.label}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {mode.desc}
                    </span>
                  </button>
                ))}
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

      {/* Tab 2: Dynamic Pipeline Stages */}
      {activeTab === "pipelines" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2">
              {["Lead", "Client"].map((cat) => (
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

      {/* Tab 5: Marketing Pixels & Analytics (GTM, GA4, Meta Pixel) */}
      {activeTab === "tracking" && (
        <form onSubmit={handleTrackingSubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Marketing Analytics, Conversion Pixels &amp; Tracking Architecture
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Deploy Google Tag Manager, GA4, Meta Pixel, and Search Console tags dynamically to the live public website without code changes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Google Tag Manager Container ID */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Google Tag Manager (GTM) Container ID
                </label>
                <input
                  type="text"
                  value={gtmContainerId}
                  onChange={(e) => setGtmContainerId(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. GTM-XXXXXXX"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Automatically initializes GTM datalayer script in the website &lt;head&gt; across all public marketing pages.
                </p>
              </div>

              {/* Google Analytics 4 Measurement ID */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Google Analytics 4 (GA4) Measurement ID
                </label>
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. G-XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Loads Google gtag.js library and dispatches pageview and scroll depth events with anonymized IP telemetry.
                </p>
              </div>

              {/* Meta (Facebook) Pixel ID */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Meta (Facebook &amp; Instagram) Pixel ID
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value.trim())}
                  placeholder="e.g. 123456789012345"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Tracks PageView, Lead submission, and ViewContent events for Meta retargeting and Lookalike audience modeling.
                </p>
              </div>

              {/* Google Search Console Verification Token */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={searchConsoleVerification}
                  onChange={(e) => setSearchConsoleVerification(e.target.value.trim())}
                  placeholder="e.g. abcdef123456_xyz"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Generates &lt;meta name=&quot;google-site-verification&quot;&gt; tag for immediate domain ownership verification.
                </p>
              </div>

              {/* Direct Strategy Booking Calendar URL */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Direct Strategy Call Booking URL (Cal.com / Calendly / HubSpot)
                </label>
                <input
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value.trim())}
                  placeholder="https://cal.com/nexora/growth-strategy"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Embedded into the &quot;Book a Strategy Call&quot; page and mobile quick-action bar for instant 30-minute calendar reservations.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Deploying Pixels..." : "Save &amp; Deploy Tracking Configuration"}</span>
              </button>
            </div>
          </div>
        </form>
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

              {/* Quick Pick Currency from dynamic .NET Culture list */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Dynamic Currency Picker (.NET CultureInfo)</span>
                  <span className="text-[10px] text-indigo-500 font-semibold">
                    {globalCurrencies?.length || 0} Currencies Available
                  </span>
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const sel = (globalCurrencies || []).find(
                      (c) => c.code === e.target.value,
                    );
                    if (sel) {
                      setRegCurrencyCode(sel.code);
                      setRegCurrencySymbol(sel.symbol);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    -- Select currency to auto-fill code & symbol --
                  </option>
                  {(globalCurrencies || []).map((c) => (
                    <option key={`${c.code}-${c.countryName}`} value={c.code}>
                      {c.code} - {c.name} ({c.symbol}) [{c.countryName}]
                    </option>
                  ))}
                </select>
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
