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
  CheckSquare,
  BookOpen,
  Menu,
  X,
  ChevronDown,
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationDrawer } from "../components/NotificationDrawer";

interface NavGroup {
  label: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    show: boolean;
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
    } catch {}
    return {
      "Platform Core": true,
      "Website CMS Engine": true,
      "Agency Operations": true,
      "Security & Governance": true,
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
      } catch {}
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
      } catch {}
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasPerm = (p: string): boolean =>
    Boolean(user?.permissions?.includes(p) || user?.roles?.includes("Owner"));

  const navGroups: NavGroup[] = [
    {
      label: "Platform Core",
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
      ],
    },
    {
      label: "Website CMS Engine",
      items: [
        {
          name: "Pages & Builder",
          path: "/cms/pages",
          icon: Globe,
          show: hasPerm("pages.view"),
        },
        {
          name: "Hero Banners",
          path: "/cms/hero-banners",
          icon: Layers,
          show: hasPerm("pages.view"),
        },
        {
          name: "Announcement Bar",
          path: "/cms/announcements",
          icon: Megaphone,
          show: hasPerm("pages.view") || hasPerm("settings.view"),
        },
        {
          name: "Navigation Menus",
          path: "/menus",
          icon: FolderTree,
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
          name: "Testimonials & Reviews",
          path: "/cms/testimonials",
          icon: MessageSquareQuote,
          show: hasPerm("pages.view"),
        },
        {
          name: "FAQ Knowledge Base",
          path: "/cms/faqs",
          icon: HelpCircle,
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
      ],
    },
    {
      label: "Agency Operations",
      items: [
        {
          name: "Clients & CRM",
          path: "/clients",
          icon: Briefcase,
          show: hasPerm("clients.view"),
        },
        {
          name: "Email & Outbox",
          path: "/emails",
          icon: Mail,
          show: hasPerm("settings.view"),
        },
      ],
    },
    {
      label: "Security & Governance",
      items: [
        {
          name: "Staff & Users",
          path: "/users",
          icon: Users,
          show: hasPerm("users.view"),
        },
        {
          name: "Roles & Permissions",
          path: "/roles",
          icon: ShieldCheck,
          show: hasPerm("roles.view"),
        },
        {
          name: "Security Audit Trail",
          path: "/audit-logs",
          icon: FileText,
          show: hasPerm("audit.view"),
        },
        {
          name: "Master Configuration",
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

  // Auto-expand group if current active route belongs to it
  useEffect(() => {
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
    } finally {
      navigate("/login");
    }
  };

  const handleLogoutEverywhere = async () => {
    try {
      await logoutEverywhereMutation().unwrap();
    } finally {
      navigate("/login");
    }
  };

  // Compute breadcrumb based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Executive Dashboard";
    if (path.startsWith("/cms")) return "Website CMS Engine";
    if (path.startsWith("/posts")) return "Blog & Content Intelligence";
    if (path.startsWith("/media")) return "Digital Media & Assets";
    if (path.startsWith("/menus")) return "Navigation Menus";
    if (path.startsWith("/leads")) return "Leads & Demand Capture";
    if (path.startsWith("/clients")) return "Enterprise Accounts & CRM";
    if (path.startsWith("/emails")) return "Transactional Outbox & Templates";
    if (path.startsWith("/users")) return "Staff & Access Control";
    if (path.startsWith("/roles")) return "RBAC Permissions Matrix";
    if (path.startsWith("/audit")) return "Security Audit Log Trail";
    if (path.startsWith("/settings/theme-studio")) return "Dynamic Theme Studio";
    if (path.startsWith("/settings")) return "Global Platform Configuration";
    return "Management Suite";
  };

  const userInitials = (user?.fullName || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-screen overflow-hidden bg-slate-100/60 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-200">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={resolveMediaUrl(logoUrl)}
              alt={companyName}
              className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground shadow-md shadow-primary/30">
              {companyName ? companyName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-base truncate max-w-[150px] inline-block align-middle">
              {companyName}
            </span>
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Enterprise Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "fixed inset-0 z-50 overflow-y-auto" : "hidden"
        } lg:flex lg:h-screen ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } bg-white dark:bg-[#0c1222] border-r border-slate-200/90 dark:border-slate-800/90 flex-shrink-0 flex-col justify-between transition-all duration-200 shadow-sm z-30 overflow-y-auto`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 h-14 min-h-[56px]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {logoUrl ? (
                    <img
                      src={resolveMediaUrl(logoUrl)}
                      alt={companyName}
                      className="w-9 h-9 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground shadow-md shadow-primary/30 shrink-0 text-sm">
                      {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <h1 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                        {companyName}
                      </h1>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                        Admin
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate leading-tight">
                      Enterprise Platform
                    </span>
                  </div>
                </div>

                {/* Mobile Close Button (shown only on mobile screens) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center px-2 py-3 border-b border-slate-200/80 dark:border-slate-800/80 h-14 min-h-[56px]">
                <button
                  type="button"
                  onClick={toggleSidebarCollapse}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                  title="Expand Sidebar"
                >
                  {logoUrl ? (
                    <img
                      src={resolveMediaUrl(logoUrl)}
                      alt={companyName}
                      className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 shadow-xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-foreground shadow-md shadow-primary/30 text-xs group-hover:scale-105 transition-transform">
                      {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Quick Action Navigation Groups with Collapsible Accordion Sections */}
            <div
              className={`p-3 space-y-3 overflow-y-auto ${
                sidebarCollapsed ? "px-2" : "px-3 py-3"
              } max-h-[calc(100vh-130px)]`}
            >
              {navGroups.map((group) => {
                const visibleItems = group.items.filter((item) => item.show);
                if (visibleItems.length === 0) return null;

                const isOpen = openGroups[group.label] ?? true;
                const hasActive = visibleItems.some((item) =>
                  item.path === "/settings"
                    ? location.pathname === "/settings"
                    : location.pathname.startsWith(item.path),
                );

                return (
                  <div key={group.label} className="space-y-1">
                    {!sidebarCollapsed ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors select-none ${
                          hasActive
                            ? "text-primary dark:text-primary font-black bg-primary/5 dark:bg-primary/10"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span className="truncate">{group.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                            isOpen
                              ? "rotate-0 text-slate-500"
                              : "-rotate-90 text-slate-400"
                          }`}
                        />
                      </button>
                    ) : (
                      <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/60" />
                    )}

                    {/* Nav Items (Collapsible on Expanded, Always visible as icon tooltips on collapsed) */}
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
                              title={sidebarCollapsed ? item.name : undefined}
                              className={`group flex items-center ${
                                sidebarCollapsed
                                  ? "justify-center p-2.5"
                                  : "gap-3 px-3 py-2"
                              } rounded-xl text-xs font-semibold transition-all duration-150 ${
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-bold"
                                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive
                                    ? "text-primary-foreground"
                                    : "text-slate-400 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary"
                                }`}
                              />
                              {!sidebarCollapsed && (
                                <span className="flex-1 truncate leading-snug">
                                  {item.name}
                                </span>
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

          {/* Sidebar Footer with Collapse/Expand Action (Theme switcher & Profile removed) */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0a0f1d]/50">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex w-full items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition text-xs font-semibold"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Collapse Sidebar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Desktop & Tablet Topbar */}
        <header className="h-14 flex items-center justify-between px-3 sm:px-5 bg-white dark:bg-[#0c1222] border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 z-40 transition-colors">
          {/* Breadcrumbs & Route Info + Desktop Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidebar Toggle in Topbar */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 truncate">
              <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="hidden sm:inline">Platform</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
                {getPageTitle()}
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Health pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">API Connected (:5201)</span>
              <span className="md:hidden">Connected</span>
            </div>
          </div>

          {/* Search, Actions & Header Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick search button triggering Command Palette */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="relative hidden md:flex items-center rounded-xl border border-slate-200 dark:border-slate-800 w-44 lg:w-56 bg-slate-50 dark:bg-slate-900/60 hover:border-primary/60 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group"
              title="Open Global Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 ml-3 flex-shrink-0 group-hover:text-primary transition-colors" />
              <span className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-400 select-none">
                Search...
              </span>
              <div className="mr-2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </button>

            {/* View Live Website Pill */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700/60 shadow-xs"
              title="Open Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xl:inline">Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="System Notifications & Telemetry"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>
            </div>

            {/* Quick theme toggle in Header */}
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

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200 dark:border-slate-700/80 mx-1 shrink-0" />

            {/* Header User Profile Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Account & User Session"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
                    {user?.fullName || "Administrator"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[110px] leading-tight">
                    {user?.roles?.[0] || "Staff"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 text-xs"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  {/* User Profile Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 truncate">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                      {user?.roles?.[0] || "Staff"}
                    </span>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/auth/change-password"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </Link>
                    <Link
                      to="/settings/theme-studio"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                    >
                      <Palette className="w-4 h-4 text-slate-400" />
                      <span>Theme Studio</span>
                    </Link>
                  </div>

                  {/* Logout Actions */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogoutEverywhere();
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out Everywhere</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto w-full px-3 sm:px-4 py-2 sm:py-2.5">
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
