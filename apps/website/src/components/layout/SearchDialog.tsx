"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, FileText, BookOpen, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchResult {
  type: string;
  title: string;
  slug: string;
  url: string;
  description?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
        const res = await fetch(
          `${apiBase}/api/v1/public/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-slate-200 shadow-2xl">
        <DialogHeader className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, playbooks, guides, and pages..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-none"
              autoFocus
            />
            {loading && (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            )}
          </div>
          <DialogTitle className="sr-only">Search Platform</DialogTitle>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto p-4 space-y-2">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Type at least 2 characters to search across published pages and
              insights.
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &ldquo;
              <span className="text-slate-900 font-semibold">{query}</span>&rdquo;.
            </div>
          ) : (
            results.map((res, idx) => (
              <Link
                key={idx}
                href={res.url}
                onClick={() => onOpenChange(false)}
                className="group flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
                    {res.type === "Blog" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                        {res.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                        {res.type}
                      </span>
                    </div>
                    {res.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0 ml-2 mt-1" />
              </Link>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or touch</span>
          <kbd className="px-1.5 py-0.5 rounded bg-background text-slate-600 font-mono text-[10px] border border-slate-200 shadow-xs">
            ESC to close
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
};
