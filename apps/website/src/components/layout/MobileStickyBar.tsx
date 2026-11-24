"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, Calendar } from "lucide-react";
import { useReducedMotion } from "../motion/useReducedMotion";

interface MobileStickyBarProps {
  supportPhone?: string;
  bookingUrl?: string;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  supportPhone = "+91 98765 43210",
  bookingUrl = "/book-a-call",
}) => {
  const [visible, setVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const isReduced = useReducedMotion();

  const digitsOnly = supportPhone.replace(/[^0-9]/g, "");
  const cleanPhone = digitsOnly.length >= 8 ? digitsOnly : "919876543210";

  // Pop-in after mount (~1.5s delay)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hide while mobile keyboard / form is focused so it does not block inputs
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        setIsInputFocused(true);
      }
    };
    const handleFocusOut = () => {
      setIsInputFocused(false);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const isHidden = !visible || isInputFocused;

  return (
    <div
      className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md pb-[env(safe-area-inset-bottom)] transition-all duration-500 ease-out ${
        isHidden
          ? "opacity-0 translate-y-8 pointer-events-none"
          : "opacity-100 translate-y-0 pointer-events-auto"
      }`}
    >
      <div className="bg-slate-900/92 backdrop-blur-xl border border-white/15 text-white p-1.5 rounded-2xl shadow-2xl flex items-center justify-between gap-1 sm:gap-1.5">
        <a
          href={`tel:+${cleanPhone}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition text-[11px] sm:text-xs font-bold whitespace-nowrap group"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span>Call Now</span>
        </a>

        <div className="w-[1px] h-5 bg-white/15 shrink-0" />

        <a
          href={`https://wa.me/${cleanPhone}?text=Hi%20Nexora,%20I%20would%20like%20to%20learn%20more%20about%20your%20digital%20marketing%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition text-[11px] sm:text-xs font-bold whitespace-nowrap group"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 relative">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {!isReduced && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span>WhatsApp</span>
        </a>

        <div className="w-[1px] h-5 bg-white/15 shrink-0" />

        <Link
          href={bookingUrl}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#FB7185] hover:bg-[#f43f5e] text-[#0B1F2A] text-[11px] sm:text-xs font-black shadow-md shadow-[#FB7185]/30 active:scale-95 transition whitespace-nowrap shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#0B1F2A]" />
          <span>Book Call</span>
        </Link>
      </div>
    </div>
  );
};
