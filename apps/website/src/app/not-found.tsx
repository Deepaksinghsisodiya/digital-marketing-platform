import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, SearchCode, BookOpen, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-500/10">
          404
        </div>

        <div className="space-y-2">
          <Badge variant="warning">Resource Unavailable</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            The requested marketing resource or page has either moved or is not
            yet published in our CMS.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gradient" size="default" shape="pill">
            <Link href="/">
              Return to Homepage <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="default" shape="pill">
            <Link href="/services">Browse 12 Services</Link>
          </Button>
        </div>

        {/* Helpful Shortcut Cards */}
        <div className="w-full pt-8 border-t border-slate-900 grid grid-cols-3 gap-3 text-left">
          <Link
            href="/services"
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group"
          >
            <SearchCode className="w-4 h-4 text-indigo-400 mb-1.5" />
            <span className="text-xs font-bold text-white block group-hover:text-indigo-300">
              Services
            </span>
            <span className="text-[10px] text-slate-500">All capabilities</span>
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group"
          >
            <BookOpen className="w-4 h-4 text-cyan-400 mb-1.5" />
            <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
              Insights
            </span>
            <span className="text-[10px] text-slate-500">Growth playbooks</span>
          </Link>

          <Link
            href="/contact"
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group"
          >
            <Mail className="w-4 h-4 text-emerald-400 mb-1.5" />
            <span className="text-xs font-bold text-white block group-hover:text-emerald-300">
              Support
            </span>
            <span className="text-[10px] text-slate-500">
              Direct assistance
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
