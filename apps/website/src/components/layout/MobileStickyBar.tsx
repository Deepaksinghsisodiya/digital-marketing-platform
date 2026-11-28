"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, Calendar } from "lucide-react";
import { useReducedMotion } from "../motion/useReducedMotion";

interface MobileStickyBarProps {
  supportPhone?: string;
  bookingUrl?: string;
  companyName?: string;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  supportPhone,
  bookingUrl = "/book-a-call",
  companyName = "Nexora",
}) => {
  const [visible, setVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const isReduced = useReducedMotion();

  const digitsOnly = (supportPhone || "").replace(/[^0-9]/g, "");
  const hasPhone = digitsOnly.length >= 8;
  const cleanPhone = digitsOnly;
  const waMessage = encodeURIComponent(
    `Hi ${companyName}, I would like to learn more about your digital marketing services.`
  );

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
      className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md pb-[env(safe-area-inset-bottom)] transition-all duration-500 ease-out ${isHidden
        ? "opacity-0 translate-y-8 pointer-events-none"
        : "opacity-100 translate-y-0 pointer-events-auto"
        }`}
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-900 p-1.5 rounded-2xl shadow-xl flex items-center justify-between gap-1 sm:gap-1.5">
        {hasPhone && (
          <>
            <a
              href={`tel:+${cleanPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition text-[11px] sm:text-xs font-bold whitespace-nowrap group"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span>Call Now</span>
            </a>

            <div className="w-[1px] h-5 bg-slate-200 shrink-0" />

            <a
              href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition text-[11px] sm:text-xs font-bold whitespace-nowrap group"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 relative">
                <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {!isReduced && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span>WhatsApp</span>
            </a>

            <div className="w-[1px] h-5 bg-slate-200 shrink-0" />
          </>
        )}

        <Link
          href={bookingUrl}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-[11px] sm:text-xs font-bold shadow-md shadow-primary/30 active:scale-95 transition whitespace-nowrap shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Book Call</span>
        </Link>
      </div>
    </div>
  );
};
