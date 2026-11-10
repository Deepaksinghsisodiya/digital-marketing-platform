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
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
