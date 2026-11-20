import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
  useLogoutMutation,
  useLogoutEverywhereMutation,
  useGetSettingsQuery,
} from "../store/api/adminApi";
import { resolveMediaUrl } from "../pages/media/MediaLibraryPage";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Sliders,
  LogOut,
  Globe,
  Inbox,
  Mail,
  Briefcase,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Bell,
  ExternalLink,
  Layers,
  Command,
  Image,
  FolderTree,
  Palette,
  Megaphone,
  MessageSquareQuote,
  Wrench,
  Award,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  KeyRound,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { toast } from "../utils/toast";

interface NavGroup {
  label: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    show: boolean;
    badge?: string;
  }[];
}

export const AdminLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  const [logoutEverywhereMutation] = useLogoutEverywhereMutation();
  const { data: settings } = useGetSettingsQuery();

  const companyName = settings?.companyName || "Nexora";
  const logoUrl =
    settings?.logoUrl ||
    (settings?.logoMediaId
      ? `/api/v1/public/media/${settings.logoMediaId}/download`
      : null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("nexora_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Accordion state for collapsible navigation section groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nexora_admin_sidebar_open_groups");
      if (saved) return JSON.parse(saved);
    } catch {
      // safe fallback
    }
    return {
      "Core Business": true,
      "Website & CMS": true,
      "Marketing & Proof": false,
      "System & Security": false,
    };
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [groupLabel]: !prev[groupLabel] };
      try {
        localStorage.setItem(
          "nexora_admin_sidebar_open_groups",
          JSON.stringify(next),
        );
      } catch {
        // safe fallback
      }
      return next;
    });
  };

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nexora_admin_sidebar_collapsed", String(next));
      } catch {
        // safe fallback
      }
      return next;
    });
  };

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setNotificationDrawerOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasPerm = (p: string): boolean =>
    Boolean(user?.permissions?.includes(p) || user?.roles?.includes("Owner"));

  const navGroups: NavGroup[] = [
    {
      label: "Core Business",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          show: true,
        },
        {
          name: "Leads Inbox",
          path: "/leads",
          icon: Inbox,
          show: hasPerm("leads.view"),
        },
        {
          name: "Clients & CRM",
          path: "/clients",
          icon: Briefcase,
          show: hasPerm("clients.view"),
        },
      ],
    },
    {
      label: "Website & CMS",
      items: [
        {
          name: "Pages & Studio",
          path: "/cms/pages",
          icon: Globe,
          show: hasPerm("pages.view"),
        },
        {
          name: "Blog & Articles",
          path: "/posts",
          icon: BookOpen,
          show: hasPerm("pages.view"),
        },
        {
          name: "Media Library",
          path: "/media",
          icon: Image,
          show: hasPerm("pages.view"),
        },
        {
          name: "URL Redirects",
          path: "/redirects",
          icon: ArrowLeftRight,
          show: hasPerm("pages.view") || hasPerm("settings.view"),
        },
        {
          name: "Navigation Menus",
          path: "/menus",
          icon: FolderTree,
          show: hasPerm("pages.view"),
        },
      ],
    },
    {
      label: "Marketing & Proof",
      items: [
        {
          name: "Hero Banners",
          path: "/cms/hero-banners",
          icon: Layers,
          show: hasPerm("pages.view"),
        },
        {
          name: "Services Catalog",
          path: "/cms/services",
          icon: Wrench,
          show: hasPerm("pages.view"),
        },
        {
          name: "Case Studies",
          path: "/cms/case-studies",
          icon: Award,
          show: hasPerm("pages.view"),
        },
        {
          name: "Testimonials",
          path: "/cms/testimonials",
          icon: MessageSquareQuote,
          show: hasPerm("pages.view"),
        },
        {
          name: "FAQ Base",
          path: "/cms/faqs",
          icon: HelpCircle,
          show: hasPerm("pages.view"),
        },
        {
          name: "Announcement Bar",
          path: "/cms/announcements",
          icon: Megaphone,
          show: hasPerm("pages.view") || hasPerm("settings.view"),
        },
      ],
    },
    {
      label: "System & Security",
      items: [
        {
          name: "Staff & Users",
          path: "/users",
          icon: Users,
          show: hasPerm("users.view"),
        },
        {
          name: "Roles & RBAC",
          path: "/roles",
          icon: ShieldCheck,
          show: hasPerm("roles.view"),
        },
        {
          name: "Email & Outbox",
          path: "/emails",
          icon: Mail,
          show: hasPerm("settings.view"),
        },
        {
          name: "Audit Trail",
          path: "/audit-logs",
          icon: FileText,
          show: hasPerm("audit.view"),
        },
        {
          name: "Platform Settings",
          path: "/settings",
          icon: Sliders,
          show: hasPerm("settings.view"),
        },
        {
          name: "Theme Studio",
          path: "/settings/theme-studio",
          icon: Palette,
          show: hasPerm("themes.view") || hasPerm("themes.manage"),
        },
      ],
    },
  ];

  // Auto-expand group if current active route belongs to it, and auto-close mobile menu
  useEffect(() => {
    setMobileMenuOpen(false);
    for (const group of navGroups) {
      const hasActive = group.items.some((item) =>
        item.path === "/settings"
          ? location.pathname === "/settings"
          : location.pathname.startsWith(item.path),
      );
      if (hasActive) {
        setOpenGroups((prev) =>
          prev[group.label] ? prev : { ...prev, [group.label]: true },
        );
      }
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Signed out");
    } finally {
      navigate("/login");
    }
  };

  const handleLogoutEverywhere = async () => {
    try {
      await logoutEverywhereMutation().unwrap();
      toast.success("Signed out from all active sessions");
    } catch {
      toast.error("Session reset failed");
    } finally {
      navigate("/login");
    }
  };

  // Breadcrumbs computation
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard"))
      return { section: "Overview", title: "Dashboard" };
    if (path.startsWith("/leads"))
      return { section: "Core", title: "Leads Inbox" };
    if (path.startsWith("/cms/pages"))
      return { section: "CMS", title: "Pages & Builder" };
    if (path.startsWith("/cms/hero-banners"))
      return { section: "CMS", title: "Hero Banners" };
    if (path.startsWith("/cms/announcements"))
      return { section: "CMS", title: "Announcements" };
    if (path.startsWith("/menus"))
      return { section: "CMS", title: "Navigation Menus" };
    if (path.startsWith("/cms/services"))
      return { section: "CMS", title: "Services Catalog" };
    if (path.startsWith("/cms/case-studies"))
      return { section: "CMS", title: "Case Studies" };
    if (path.startsWith("/cms/testimonials"))
      return { section: "CMS", title: "Testimonials" };
    if (path.startsWith("/cms/faqs"))
      return { section: "CMS", title: "FAQ Base" };
    if (path.startsWith("/posts"))
      return { section: "CMS", title: "Blog & Articles" };
    if (path.startsWith("/media"))
      return { section: "CMS", title: "Media Library" };
    if (path.startsWith("/redirects"))
      return { section: "CMS", title: "301 Redirects" };
    if (path.startsWith("/clients"))
      return { section: "Operations", title: "Clients & CRM" };
    if (path.startsWith("/emails"))
      return { section: "Operations", title: "Email & Outbox" };
    if (path.startsWith("/users"))
      return { section: "Security", title: "Staff & Users" };
    if (path.startsWith("/roles"))
      return { section: "Security", title: "Roles & RBAC" };
    if (path.startsWith("/audit-logs"))
      return { section: "Security", title: "Audit Trail" };
    if (path.startsWith("/settings/theme-studio"))
      return { section: "Customization", title: "Theme Studio" };
    if (path.startsWith("/settings"))
      return { section: "Platform", title: "Settings" };
    return { section: "Platform", title: "Nexora" };
  };

  const breadcrumbs = getBreadcrumbs();

  const userInitials = (user?.fullName || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-screen overflow-hidden bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-150">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <img
              src={resolveMediaUrl(logoUrl)}
              alt={companyName}
              className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-xs text-xs">
              {companyName ? companyName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[140px]">
            {companyName}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-primary" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern SaaS Sidebar (Sliding Drawer on Mobile, Sticky on Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:h-screen ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${
          sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64"
        } bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 flex flex-col justify-between shadow-xs select-none`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Nexora Brand Header */}
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  {logoUrl ? (
                    <img
                      src={resolveMediaUrl(logoUrl)}
                      alt={companyName}
                      className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-xs text-xs shrink-0 group-hover:scale-105 transition-transform">
                      {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                        {companyName}
                      </span>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20 shrink-0">
                        SaaS
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate leading-tight">
                      Admin Platform
                    </span>
                  </div>
                </Link>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-14 border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                  title="Expand sidebar"
                >
                  {logoUrl ? (
                    <img
                      src={resolveMediaUrl(logoUrl)}
                      alt={companyName}
                      className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-xs text-xs group-hover:scale-105 transition-transform">
                      {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Navigation Groups */}
            <div
              className={`p-2.5 space-y-3 overflow-y-auto ${
                sidebarCollapsed ? "px-2" : "px-3"
              } max-h-[calc(100vh-140px)]`}
            >
              {navGroups.map((group) => {
                const visibleItems = group.items.filter((item) => item.show);
                if (visibleItems.length === 0) return null;

                const isOpen = openGroups[group.label] ?? true;

                return (
                  <div key={group.label} className="space-y-1">
                    {!sidebarCollapsed ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        className="w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors select-none"
                      >
                        <span className="truncate">{group.label}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-150 shrink-0 ${
                            isOpen ? "rotate-0 text-slate-500" : "-rotate-90 text-slate-400"
                          }`}
                        />
                      </button>
                    ) : (
                      <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/60" />
                    )}

                    {/* Nav Items */}
                    {(isOpen || sidebarCollapsed) && (
                      <div className="space-y-0.5">
                        {visibleItems.map((item) => {
                          const isActive =
                            item.path === "/settings"
                              ? location.pathname === "/settings"
                              : location.pathname.startsWith(item.path);
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`group relative flex items-center ${
                                sidebarCollapsed
                                  ? "justify-center p-2.5"
                                  : "gap-2.5 px-3 py-2"
                              } rounded-xl text-xs font-medium transition-all duration-150 ${
                                isActive
                                  ? "bg-primary/10 text-primary dark:text-primary font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-r-full"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isActive
                                    ? "text-primary dark:text-primary"
                                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                }`}
                              />
                              {!sidebarCollapsed ? (
                                <>
                                  <span className="flex-1 truncate">
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                                      {item.badge}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xl shadow-black/20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.2 text-[10px] rounded bg-primary text-white">
                                      {item.badge}
                                    </span>
                                  )}
                                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-800" />
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Profile Section at Bottom of Sidebar */}
          <div className="p-2.5 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group">
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 min-w-0 flex-1"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                      {userInitials}
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white dark:border-slate-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {user?.roles?.[0] || "Staff"}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4 text-primary" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container with Topbar and Outlet */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Modern SaaS Topbar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 z-40 transition-colors">
          {/* Left: Desktop Collapse Button + Breadcrumbs + Live System Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate"
            >
              <span className="hidden sm:inline font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                {breadcrumbs.section}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0 hidden sm:inline" />
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {breadcrumbs.title}
              </span>
            </nav>

            <div className="hidden md:block h-3.5 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Live Health Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational</span>
            </div>
          </div>

          {/* Right: Search, Live Site, Notifications, Theme, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="relative hidden md:flex items-center rounded-xl border border-slate-200/90 dark:border-slate-800/90 w-48 lg:w-60 bg-slate-50/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group px-3 py-1.5 shadow-xs cursor-pointer"
              title="Search commands and resources (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />
              <span className="w-full text-xs text-slate-500 dark:text-slate-400 select-none truncate">
                Search or command...
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 shadow-xs shrink-0">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </kbd>
            </button>

            {/* Live Website Preview Link */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/70 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-700/60 shadow-xs"
              title="Open public website in new tab"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xl:inline">Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Notification Drawer Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Account menu"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px] leading-tight">
                    {user?.fullName || "Admin"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px] leading-tight">
                    {user?.roles?.[0] || "Staff"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                    userDropdownOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-100">
                  {/* Account Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {user?.roles?.[0] || "Staff"}
                    </span>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/auth/change-password"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Password</span>
                    </Link>
                    <Link
                      to="/settings/theme-studio"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition"
                    >
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      <span>Theme Studio</span>
                    </Link>
                  </div>

                  {/* Sign Out Actions */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogoutEverywhere();
                      }}
                      className="w-full px-3.5 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out Everywhere</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Slide-over Notifications & Telemetry Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
};
