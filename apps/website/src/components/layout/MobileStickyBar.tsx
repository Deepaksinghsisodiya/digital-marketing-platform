"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageSquare, Calendar } from "lucide-react";

interface MobileStickyBarProps {
  supportPhone?: string;
  bookingUrl?: string;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  supportPhone = "+91 98765 43210",
  bookingUrl = "/book-a-call",
}) => {
  const digitsOnly = supportPhone.replace(/[^0-9]/g, "");
  const cleanPhone = digitsOnly.length >= 8 ? digitsOnly : "919876543210";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-xl">
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:+${cleanPhone}`}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:text-primary hover:bg-slate-100 active:scale-95 transition shadow-xs"
        >
          <Phone className="w-4 h-4 text-primary mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Call Now</span>
        </a>

        <a
          href={`https://wa.me/${cleanPhone}?text=Hi%20Nexora,%20I%20would%20like%20to%20learn%20more%20about%20your%20digital%20marketing%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:text-primary hover:bg-slate-100 active:scale-95 transition shadow-xs"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-[10px] font-bold tracking-tight">WhatsApp</span>
        </a>

        <Link
          href={bookingUrl}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-md shadow-primary/25 active:scale-95 transition"
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Book Call</span>
        </Link>
      </div>
    </div>
  );
};
