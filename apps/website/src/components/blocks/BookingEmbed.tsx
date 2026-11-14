"use client";

import React, { useState } from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface BookingContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  bookingUrl?: string;
  calendarTitle?: string;
  durationMinutes?: number;
  ctaText?: string;
}

export const BookingEmbed: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const content = (block.content || {}) as BookingContent;

  const [selectedMeetingType, setSelectedMeetingType] = useState<number>(30);

  const title =
    content.sectionTitle || "Schedule Your Strategic Growth Consultation";
  const subtitle =
    content.sectionSubtitle ||
    "Select a convenient time for a confidential, one-on-one session with our senior growth architects.";

  const rawBookingUrl = content.bookingUrl || "";

  return (
    <section className="py-24 lg:py-32 bg-white px-6 sm:px-10 lg:px-12 xl:px-16 border-t border-slate-200/80 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-indigo-50/60 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Executive Scheduling</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-extrabold">
              Direct Access
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Meeting Type Selection Pills */}
        <div className="flex flex-wrap justify-center gap-3.5 mb-12">
          {[
            {
              minutes: 15,
              title: "Introductory Discovery Call",
              desc: "High-level alignment on goals & fit",
            },
            {
              minutes: 30,
              title: "Growth Architecture Review",
              desc: "Audit of channels, tech stack & leaks",
            },
            {
              minutes: 45,
              title: "Enterprise Strategy Deep-Dive",
              desc: "Multi-region governance & SLA roadmap",
            },
          ].map((item) => (
            <button
              key={item.minutes}
              onClick={() => setSelectedMeetingType(item.minutes)}
              className={`px-6 py-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer ${
                selectedMeetingType === item.minutes
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-102"
                  : "bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-white shadow-2xs"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMeetingType === item.minutes
                    ? "bg-white/20 text-white"
                    : "bg-white text-indigo-600 border border-slate-200 shadow-2xs"
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-extrabold block">
                  {item.title}
                </span>
                <span
                  className={`text-[11px] block font-medium ${
                    selectedMeetingType === item.minutes
                      ? "text-indigo-100"
                      : "text-slate-500"
                  }`}
                >
                  {item.minutes} Minutes • Google Meet / Teams
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Embedded Iframe or Sandbox Fallback Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/90 shadow-2xl bg-white overflow-hidden">
          {rawBookingUrl && rawBookingUrl.startsWith("http") ? (
            <div className="w-full h-[680px]">
              <iframe
                src={rawBookingUrl}
                title="Schedule Meeting"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="p-8 sm:p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-sm">
                <Video className="w-8 h-8" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedMeetingType}-Minute Growth Architecture Session
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed font-normal">
                Book direct confidential time with an executive Growth Architect to review
                your customer acquisition economics, ad efficiency, and pipeline velocity.
              </p>

              {/* Consultation Inclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto my-10 text-left">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Zero-Obligation
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Actionable advice you can execute immediately
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Senior Architect
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Direct meeting with leadership, not sales reps
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Custom Audit Brief
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Delivered within 24 hours of session completion
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{content.ctaText || "Request Consultation Slot"}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-200 hover:border-slate-300"
                >
                  Submit RFP or Inbound Inquiry
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
