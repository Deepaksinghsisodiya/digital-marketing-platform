import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Globe,
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Sliders,
  Inbox,
  Mail,
  Briefcase,
  CheckSquare,
  BookOpen,
  Image as ImageIcon,
  FolderTree,
  ExternalLink,
  ArrowRight,
  Sun,
  Moon,
  X,
  Wrench,
  Award,
  MessageSquareQuote,
  HelpCircle,
  Layers,
  Megaphone,
} from "lucide-react";
import { useGetPagesQuery } from "../store/api/adminApi";
import { useTheme } from "../context/ThemeContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "CMS Pages" | "Quick Actions";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: pagesData } = useGetPagesQuery(
    { page: 1, pageSize: 20 },
    { skip: !isOpen },
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const staticItems: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        title: "Executive Dashboard",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => {
          navigate("/dashboard");
          onClose();
        },
      },
      {
        id: "nav-cms",
        title: "Website CMS & Pages Studio",
        category: "Navigation",
        icon: Globe,
        action: () => {
          navigate("/cms/pages");
          onClose();
        },
        badge: "CMS",
      },
      {
        id: "nav-hero",
        title: "Hero Banners & Visual Sliders",
        category: "Navigation",
        icon: Layers,
        action: () => {
          navigate("/cms/hero-banners");
          onClose();
        },
        badge: "Hero",
      },
      {
        id: "nav-announcements",
        title: "Announcement Bar & Top Notification Ticker",
        category: "Navigation",
        icon: Megaphone,
        action: () => {
          navigate("/cms/announcements");
          onClose();
        },
        badge: "Live",
      },
      {
        id: "nav-services",
        title: "Services & Capabilities Catalog",
        category: "Navigation",
        icon: Wrench,
        action: () => {
          navigate("/cms/services");
          onClose();
        },
        badge: "Services",
      },
      {
        id: "nav-casestudies",
        title: "Case Studies & Portfolio Proof",
        category: "Navigation",
        icon: Award,
        action: () => {
          navigate("/cms/case-studies");
          onClose();
        },
        badge: "Work",
      },
      {
        id: "nav-testimonials",
        title: "Testimonials & Client Reviews",
        category: "Navigation",
        icon: MessageSquareQuote,
        action: () => {
          navigate("/cms/testimonials");
          onClose();
        },
        badge: "Reviews",
      },
      {
        id: "nav-faqs",
        title: "FAQ Knowledge Base",
        category: "Navigation",
        icon: HelpCircle,
        action: () => {
          navigate("/cms/faqs");
          onClose();
        },
        badge: "Q&A",
      },
      {
        id: "nav-leads",
        title: "Leads Inbox & Submissions",
        category: "Navigation",
        icon: Inbox,
        action: () => {
          navigate("/leads");
          onClose();
        },
        badge: "Inbound",
      },
      {
        id: "nav-clients",
        title: "Clients & CRM Accounts",
        category: "Navigation",
        icon: Briefcase,
        action: () => {
          navigate("/clients");
          onClose();
        },
      },
      {
        id: "nav-media",
        title: "Media Library & Digital Assets",
        category: "Navigation",
        icon: ImageIcon,
        action: () => {
          navigate("/media");
          onClose();
        },
        badge: "Assets",
      },
      {
        id: "nav-blog",
        title: "Blog & Insights Articles",
        category: "Navigation",
        icon: BookOpen,
        action: () => {
          navigate("/posts");
          onClose();
        },
      },
      {
        id: "nav-menus",
        title: "Navigation Menus Editor",
        category: "Navigation",
        icon: FolderTree,
        action: () => {
          navigate("/menus");
          onClose();
        },
      },
      {
        id: "nav-email",
        title: "Email Templates & Outbox Queue",
        category: "Navigation",
        icon: Mail,
        action: () => {
          navigate("/emails");
          onClose();
        },
      },
      {
        id: "nav-users",
        title: "Users & Staff Management",
        category: "Navigation",
        icon: Users,
        action: () => {
          navigate("/users");
          onClose();
        },
      },
      {
        id: "nav-roles",
        title: "Roles & Permission Matrix",
        category: "Navigation",
        icon: ShieldCheck,
        action: () => {
          navigate("/roles");
          onClose();
        },
      },
      {
        id: "nav-audit",
        title: "System Audit Trail & Compliance",
        category: "Navigation",
        icon: FileText,
        action: () => {
          navigate("/audit");
          onClose();
        },
      },
      {
        id: "nav-settings",
        title: "Site Settings & Theme Customizer",
        category: "Navigation",
        icon: Sliders,
        action: () => {
          navigate("/settings");
          onClose();
        },
      },
      {
        id: "action-theme",
        title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        category: "Quick Actions",
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: "action-website",
        title: "Open Live Public Website in New Tab",
        category: "Quick Actions",
        icon: ExternalLink,
        action: () => {
          window.open("http://localhost:3000", "_blank");
          onClose();
        },
      },
    ],
    [navigate, onClose, theme, toggleTheme],
  );

  const dynamicPageItems: CommandItem[] = useMemo(() => {
    if (!pagesData?.items) return [];
    return pagesData.items.map((p) => ({
      id: `page-${p.id}`,
      title: `${p.title} (/${p.slug})`,
      category: "CMS Pages" as const,
      icon: Globe,
      action: () => {
        navigate(`/cms/pages`);
        onClose();
      },
      badge:
        p.status === 2 ? "Published" : p.status === 3 ? "Archived" : "Draft",
    }));
  }, [pagesData, navigate, onClose]);

  const allItems = useMemo(
    () => [...staticItems, ...dynamicPageItems],
    [staticItems, dynamicPageItems],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  // Handle keyboard navigation inside the list
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-ink border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or navigate to..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No results found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-indigo-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold block">{item.title}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected
                            ? "text-indigo-200"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? "bg-indigo-500/40 text-white border border-white/20"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? "text-white"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mr-1">
                ↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>Nexora Command System</span>
        </div>
      </div>
    </div>
  );
};
