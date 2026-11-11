"use client";

import React, { useState, useEffect } from "react";

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nexora_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("nexora_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("nexora_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Privacy & Cookie Preferences</h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            We use cookies to personalize analytics and evaluate digital campaign performance in accordance with our Privacy Policy.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={handleDecline}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};

