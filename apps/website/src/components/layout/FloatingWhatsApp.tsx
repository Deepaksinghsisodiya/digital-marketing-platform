"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";

interface FloatingWhatsAppProps {
  phone?: string;
  companyName?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phone,
  companyName = "Nexora",
}) => {
  if (!phone || !phone.trim()) {
    return null;
  }

  const digitsOnly = phone.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 8) {
    return null;
  }
  const cleanPhone = digitsOnly;
  const waMessage = encodeURIComponent(
    `Hi ${companyName}, I'd like to discuss our growth requirements.`
  );

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => trackWhatsAppClick("floating_whatsapp_widget")}
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
