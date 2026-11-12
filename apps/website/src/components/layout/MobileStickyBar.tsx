"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageSquare, Calendar } from "lucide-react";

interface MobileStickyBarProps {
  supportPhone?: string;
  bookingUrl?: string;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  supportPhone = "+1 (800) 555-0199",
  bookingUrl = "/book-a-call",
}) => {
  const cleanPhone = supportPhone.replace(/[^0-9+]/g, "");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-850 active:scale-95 transition"
        >
          <Phone className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[10px] font-bold tracking-tight">Call Now</span>
        </a>

        <a
          href={`https://wa.me/${cleanPhone.replace("+", "")}?text=Hi%20Nexora,%20I%20would%20like%20to%20learn%20more%20about%20your%20digital%20marketing%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-850 active:scale-95 transition"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[10px] font-bold tracking-tight">WhatsApp</span>
        </a>

        <Link
          href={bookingUrl}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition"
        >
          <Calendar className="w-4 h-4 mb-1" />
          <span className="text-[10px] tracking-tight">Book Call</span>
        </Link>
      </div>
    </div>
  );
};
