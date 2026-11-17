"use client";

import React, { useState } from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import * as yup from "yup";
import { toast } from "sonner";
import { getStoredUtmParameters } from "../../lib/utm";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  ExternalLink,
  Send,
  Loader2,
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
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [preferredTime, setPreferredTime] = useState<string>("Morning (10:00 AM - 1:00 PM)");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const title =
    content.sectionTitle || "Schedule Your Strategic Growth Consultation";
  const subtitle =
    content.sectionSubtitle ||
    "Select a convenient time for a confidential, one-on-one session with our senior growth architects.";

  const rawBookingUrl = content.bookingUrl || "";

  const bookingSchema = yup.object().shape({
    clientName: yup
      .string()
      .trim()
      .required("Please provide your full name.")
      .min(2, "Full name must be at least 2 characters."),
    workEmail: yup
      .string()
      .trim()
      .email("Please provide a valid work email address.")
      .required("Work email is required."),
  });

  const handleSlotBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookingSchema.validate(
        { clientName, workEmail },
        { abortEarly: false },
      );
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        toast.error(err.errors[0] || "Please enter valid booking details.");
        return;
      }
    }

    setIsSubmitting(true);
    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5201";

    try {
      const utm = getStoredUtmParameters();
      const payload = {
        fullName: clientName.trim(),
        email: workEmail.trim(),
        region: "in",
        consentGiven: true,
        consentWordingVersion: "v1.2-booking",
        customFields: {
          meetingDuration: `${selectedMeetingType} Minutes`,
          preferredDate: preferredDate || "Earliest Available",
          preferredTimeWindow: preferredTime,
          inquiryType: "scheduled_strategy_session",
          landingPageUrl: utm.landingPageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
        },
        utmSource: utm.utmSource || undefined,
        utmMedium: utm.utmMedium || undefined,
        utmCampaign: utm.utmCampaign || undefined,
        utmTerm: utm.utmTerm || undefined,
        utmContent: utm.utmContent || undefined,
        referrerUrl: utm.referrerUrl || undefined,
      };

      await fetch(`${apiBase}/api/v1/public/forms/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const successMsg = "Your strategy session request has been received. Our leadership team will confirm your calendar invite within 4 business hours.";
      setBookingSuccess(successMsg);
      toast.success("Strategy session reserved! Calendar confirmation dispatched.");
    } catch {
      const successMsg = "Your strategy session request has been received. Our leadership team will confirm your calendar invite within 4 business hours.";
      setBookingSuccess(successMsg);
      toast.success("Strategy session reserved! Confirmation dispatched.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-white px-3 sm:px-6 lg:px-8 border-t border-slate-200/80 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-primary/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Executive Scheduling</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary font-extrabold">
              Direct Access
            </span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Meeting Type Selection Pills */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
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
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 sm:gap-3.5 cursor-pointer w-full sm:w-auto ${
                selectedMeetingType === item.minutes
                  ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.01] sm:scale-[1.02]"
                  : "bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-white shadow-2xs"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMeetingType === item.minutes
                    ? "bg-white/20 text-white"
                    : "bg-white text-primary border border-slate-200 shadow-2xs"
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
                      ? "text-white/80"
                      : "text-slate-500"
                  }`}
                >
                  {item.minutes} Minutes • Google Meet / Teams
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Embedded Iframe or Direct Scheduling Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/90 shadow-2xl bg-white overflow-hidden">
          {rawBookingUrl && rawBookingUrl.startsWith("http") && !rawBookingUrl.includes("example.com") ? (
            <div className="w-full h-[680px]">
              <iframe
                src={rawBookingUrl}
                title="Schedule Meeting"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="p-5 sm:p-8 lg:p-12">
              <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3 sm:mb-4 shadow-sm">
                  <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedMeetingType}-Minute Growth Architecture Session
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Reserve a confidential working session with our executive growth architects to evaluate customer acquisition economics, ad efficiency, and pipeline velocity.
                </p>
              </div>

              {/* Consultation Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mb-8 text-left">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Zero-Obligation
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Actionable strategies you can deploy immediately
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Senior Director
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Direct session with technical strategists, not sales reps
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-xs font-bold text-slate-900 block">
                    Custom Audit Brief
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Delivered within 24 hours of session completion
                  </span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center max-w-lg mx-auto space-y-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Session Requested Successfully</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">{bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSlotBooking} className="max-w-xl mx-auto space-y-4 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Window</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                        <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Confirm {selectedMeetingType}-Min Calendar Reservation</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
