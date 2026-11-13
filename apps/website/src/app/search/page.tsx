"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Search, Loader2, FileText, BookOpen, ArrowRight } from "lucide-react";

interface SearchResult {
  type: string;
  title: string;
  slug: string;
  url: string;
  description?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialQuery.trim()) return;

    const executeSearch = async () => {
      setLoading(true);
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";
        const res = await fetch(
          `${apiBase}/api/v1/public/search?q=${encodeURIComponent(initialQuery.trim())}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header />

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-4xl mx-auto w-full space-y-10">
        <div className="space-y-4">
          <Badge variant="accent">Universal Search</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Search Digital Marketing Knowledge & Services
          </h1>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all services, playbooks, and insights..."
                className="pl-11"
              />
            </div>
            <Button type="submit" variant="gradient">
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : initialQuery.trim().length > 0 ? (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Found {results.length} results for &ldquo;
              <span className="text-white font-semibold">{initialQuery}</span>
              &rdquo;
            </div>

            {results.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 bg-slate-50">
                <p className="text-slate-600 text-sm">
                  No matching services or insights found. Try broader keywords
                  like &ldquo;SEO&rdquo;, &ldquo;PPC&rdquo;, or
                  &ldquo;Attribution&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((res, i) => (
                  <Card
                    key={i}
                    className="hover:border-indigo-500/50 transition"
                  >
                    <CardHeader className="p-5 flex flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                          {res.type === "Blog" ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              <Link
                                href={res.url}
                                className="hover:text-indigo-400 transition"
                              >
                                {res.title}
                              </Link>
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px]">
                              {res.type}
                            </Badge>
                          </div>
                          {res.description && (
                            <CardDescription className="text-xs mt-1 line-clamp-2">
                              {res.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Link
                        href={res.url}
                        className="p-2 text-slate-400 hover:text-white transition shrink-0"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
