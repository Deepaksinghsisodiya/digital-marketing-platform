"use client";

import React, { useEffect, useState } from "react";

export interface TrackingCodesConfig {
  searchConsoleVerification?: string;
  gtmContainerId?: string;
  gaMeasurementId?: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  clarityId?: string;
  hotjarSiteId?: string;
}

interface TrackingScriptsProps {
  codes: TrackingCodesConfig;
}

export const TrackingScripts: React.FC<TrackingScriptsProps> = ({ codes }) => {
  const [consent, setConsent] = useState<{ analytics: boolean; marketing: boolean }>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const checkConsent = () => {
      try {
        const raw = localStorage.getItem("nexora_cookie_consent");
        if (raw) {
          const parsed = JSON.parse(raw);
          setConsent({
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
          });
        }
      } catch {
        // fallback
      }
    };

    checkConsent();

    const handleConsentUpdate = () => checkConsent();
    window.addEventListener("nexora_cookie_consent_updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("nexora_cookie_consent_updated", handleConsentUpdate);
    };
  }, []);

  // 1. Google Tag Manager & Google Analytics 4 (Analytics Consent Gated)
  useEffect(() => {
    if (!consent.analytics) return;

    // GTM
    if (codes.gtmContainerId && !document.getElementById("nexora-gtm-script")) {
      const gtmScript = document.createElement("script");
      gtmScript.id = "nexora-gtm-script";
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${codes.gtmContainerId}`;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      document.head.appendChild(gtmScript);
    }

    // GA4
    if (codes.gaMeasurementId && !document.getElementById("nexora-ga4-script")) {
      const gaScript = document.createElement("script");
      gaScript.id = "nexora-ga4-script";
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${codes.gaMeasurementId}`;
      document.head.appendChild(gaScript);

      const inlineScript = document.createElement("script");
      inlineScript.id = "nexora-ga4-inline";
      inlineScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${codes.gaMeasurementId}', { anonymize_ip: true });
      `;
      document.head.appendChild(inlineScript);
    }

    // Microsoft Clarity
    if (codes.clarityId && !document.getElementById("nexora-clarity-script")) {
      const clarityScript = document.createElement("script");
      clarityScript.id = "nexora-clarity-script";
      clarityScript.async = true;
      clarityScript.textContent = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${codes.clarityId}");
      `;
      document.head.appendChild(clarityScript);
    }
  }, [consent.analytics, codes.gtmContainerId, codes.gaMeasurementId, codes.clarityId]);

  // 2. Meta Pixel & LinkedIn Partner (Marketing Consent Gated)
  useEffect(() => {
    if (!consent.marketing) return;

    // Meta Pixel
    if (codes.metaPixelId && !document.getElementById("nexora-meta-pixel")) {
      const metaScript = document.createElement("script");
      metaScript.id = "nexora-meta-pixel";
      metaScript.textContent = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${codes.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(metaScript);
    }

    // LinkedIn Insight Tag
    if (codes.linkedInPartnerId && !document.getElementById("nexora-linkedin-script")) {
      const liScript = document.createElement("script");
      liScript.id = "nexora-linkedin-script";
      liScript.textContent = `
        _linkedin_partner_id = "${codes.linkedInPartnerId}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `;
      document.head.appendChild(liScript);
    }
  }, [consent.marketing, codes.metaPixelId, codes.linkedInPartnerId]);

  return null;
};
