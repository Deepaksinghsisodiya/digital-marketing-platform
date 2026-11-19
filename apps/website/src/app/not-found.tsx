import React from "react";
import Link from "next/link";
import { ArrowRight, SearchCode, BookOpen, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      {/* Minimal Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-slate-900 tracking-tight">
            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">N</span>
            <span>NEXORA</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-primary hover:text-primary-hover"
          >
            &larr; Back to Platform
          </Link>
        </div>
      </header>

      {/* 404 Main Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-3xl shadow-xl shadow-primary/10">
          404
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Resource Unavailable
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            The requested marketing resource or page has either moved or is not
            yet published in our CMS.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-hover transition shadow-md shadow-primary/20"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition border border-slate-200"
          >
            Browse All Services
          </Link>
        </div>

        {/* Helpful Shortcut Cards */}
        <div className="w-full pt-8 border-t border-slate-200 grid grid-cols-3 gap-3 text-left">
          <Link
            href="/services"
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition group shadow-xs"
          >
            <SearchCode className="w-4 h-4 text-primary mb-1.5" />
            <span className="text-xs font-bold text-slate-900 block group-hover:text-primary">
              Services
            </span>
            <span className="text-[10px] text-slate-500">All capabilities</span>
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition group shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-primary mb-1.5" />
            <span className="text-xs font-bold text-slate-900 block group-hover:text-primary">
              Insights
            </span>
            <span className="text-[10px] text-slate-500">Growth playbooks</span>
          </Link>

          <Link
            href="/contact"
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/40 transition group shadow-xs"
          >
            <Mail className="w-4 h-4 text-primary mb-1.5" />
            <span className="text-xs font-bold text-slate-900 block group-hover:text-primary">
              Support
            </span>
            <span className="text-[10px] text-slate-500">Direct assistance</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 bg-slate-50">
        &copy; {new Date().getFullYear()} Nexora Technoligics Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
