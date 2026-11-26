import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      app: {
        title: "Nexora Agency Admin",
        tagline: "Internal Operations & Control Plane",
        stepNotice: "Step 1 Foundation: Shell Initialized (No Login Required)",
        apiStatus: "Core API Status",
        apiConnected: "API Connected & Operational",
        apiConnecting: "Connecting to Core API...",
        apiDisconnected: "API Disconnected (Offline)",
        liveProbe: "Live Probe",
        readyProbe: "Ready Probe",
        database: "Database",
      },
    },
  },
  hi: {
    translation: {
      app: {
        title: "नेक्सोरा एजेंसी एडमिन",
        tagline: "आंतरिक संचालन और नियंत्रण केंद्र",
        stepNotice: "प्रारंभिक सेटअप पूर्ण",
        apiStatus: "कोर एपीआई स्थिति",
        apiConnected: "एपीआई कनेक्टेड और सक्रिय",
        apiConnecting: "कोर एपीआई से जुड़ रहा है...",
        apiDisconnected: "एपीआई डिस्कनेक्टेड (ऑफ़लाइन)",
        liveProbe: "लाइव जांच",
        readyProbe: "रेडी जांच",
        database: "डेटाबेस",
      },
    },
  },
};

export const SUPPORTED_ADMIN_LOCALES = ["en", "hi"] as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
