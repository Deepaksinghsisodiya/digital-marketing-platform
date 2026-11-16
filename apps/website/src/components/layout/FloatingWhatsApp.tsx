"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface FloatingWhatsAppProps {
  phone?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phone = "+91 98765 43210",
}) => {
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  // Fallback to international agency default if number is invalid or placeholder
  const cleanPhone = digitsOnly.length >= 8 ? digitsOnly : "919876543210";

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=Hi%20Nexora,%20I'd%20like%20to%20discuss%20our%20growth%20requirements.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="hidden sm:inline-flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30 group"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
      </span>
      <MessageSquare className="w-4 h-4 fill-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat on WhatsApp
      </span>
    </a>
  );
};
