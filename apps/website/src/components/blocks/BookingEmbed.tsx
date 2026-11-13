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
    <section className="py-24 bg-white px-6 sm:px-10 lg:px-12 xl:px-16 border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Executive Scheduling</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800">
              Direct Access
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* Meeting Type Selection Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
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
              className={`px-5 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                selectedMeetingType === item.minutes
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  selectedMeetingType === item.minutes
                    ? "bg-white/20 text-white"
                    : "bg-white text-slate-600 shadow-xs"
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">{item.title}</span>
                <span
                  className={`text-[11px] block ${
                    selectedMeetingType === item.minutes
                      ? "text-indigo-100"
                      : "text-slate-500"
                  }`}
                >
                  {item.minutes} Minutes • Google Meet
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Embedded Iframe or Sandbox Fallback Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 shadow-xl bg-white overflow-hidden">
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
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <Video className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedMeetingType}-Minute Growth Consultation
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Book direct time with an executive Growth Architect to review
                your customer acquisition costs, ad efficiency, and pipeline
                velocity.
              </p>

              {/* Consultation Inclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto my-8 text-left">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Zero-Obligation
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Actionable advice you can execute immediately
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Senior Architect
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Direct meeting with leadership, not sales reps
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Custom Audit Brief
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Delivered within 24 hours of call completion
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition duration-200 flex items-center justify-center gap-2"
                >
                  <span>{content.ctaText || "Request Meeting Time"}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
                >
                  Direct Inquiry Form
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
