"use client";

import React, { useState, useEffect, useRef } from "react";

interface ContactFormProps {
  initialRegion?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ initialRegion = "in" }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState(initialRegion);
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [message, setMessage] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [timeTrapToken, setTimeTrapToken] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) return;

    let isMounted = true;
    fetch(`${apiUrl}/api/v1/public/forms/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.timeTrapToken) {
          setTimeTrapToken(data.timeTrapToken);
        }
      })
      .catch(() => {
        // Handled silently; validation will prompt if token is missing
      });

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const isIndia = region === "in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitSuccess(null);
    setReferenceNumber(null);

    if (!consentGiven) {
      setErrorMessage("Please accept the privacy consent to submit your inquiry.");
      return;
    }

    if (!apiUrl) {
      setErrorMessage("API configuration error: NEXT_PUBLIC_API_URL is not set.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        region,
        state: stateName.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        customFields: message.trim() ? { notes: message.trim() } : undefined,
        consentGiven,
        consentWordingVersion: "v1.2-web",
        honeypot: honeypot || undefined,
        timeTrapToken: timeTrapToken || undefined,
        idempotencyKey: idempotencyKeyRef.current || undefined,
      };

      const res = await fetch(`${apiUrl}/api/v1/public/forms/contact/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idempotencyKeyRef.current ? { "X-Idempotency-Key": idempotencyKeyRef.current } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry. Please try again.");
      }

      setSubmitSuccess(data.message || "Thank you! Your inquiry has been submitted successfully.");
      if (data.referenceNumber) {
        setReferenceNumber(data.referenceNumber);
      }
      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setStateName("");
      setPostalCode("");
      setMessage("");
      setConsentGiven(false);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Request an Executive Consultation
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us about your digital growth goals. Our enterprise team will respond within 1 business day.
        </p>
      </div>

      {submitSuccess ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-lg font-bold text-emerald-900">Inquiry Received</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">{submitSuccess}</p>
          {referenceNumber && (
            <p className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md inline-block">
              Reference: {referenceNumber}
            </p>
          )}
          <button
            onClick={() => setSubmitSuccess(null)}
            className="mt-2 text-xs font-semibold text-emerald-800 underline"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Hidden honeypot field for bot detection */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot_check"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isIndia ? "+91 98765 43210" : "+1 (555) 019-2834"}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Global Inc."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Region *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              >
                <option value="in">India (IN)</option>
                <option value="us">United States (US)</option>
                <option value="ae">United Arab Emirates (AE)</option>
                <option value="gb">United Kingdom (GB)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder={isIndia ? "Karnataka" : "California"}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isIndia ? "PIN Code" : "ZIP / Postal Code"}
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder={isIndia ? "560001" : "94103"}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Details or Marketing Goals
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your target audience, current monthly ad spend, and expected milestones..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="consent"
              required
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed">
              I consent to Nexora processing my contact details to evaluate our business inquiry and contact me regarding enterprise solutions.
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

