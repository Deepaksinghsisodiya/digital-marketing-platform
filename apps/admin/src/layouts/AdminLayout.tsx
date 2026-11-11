import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (settings?.themeTokensJson) {
      try {
        const tokens = JSON.parse(settings.themeTokensJson);
        const root = document.documentElement;
        if (tokens.primaryColor)
          root.style.setProperty("--nexora-purple", tokens.primaryColor);
        if (tokens.accentColor)
          root.style.setProperty("--nexora-blue", tokens.accentColor);
        if (tokens.navyColor)
          root.style.setProperty("--nexora-navy", tokens.navyColor);
        if (tokens.radius)
          root.style.setProperty("--nexora-radius-md", tokens.radius);
      } catch {
        // Fallback
      }
    }
  }, [settings?.themeTokensJson]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

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
          name: "Executive Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          show: true,
        },
        {
          name: "Website CMS",
          path: "/cms/pages",
          icon: Globe,
          show: hasPerm("pages.view"),
          badge: "CMS",
        },
        {
          name: "Blog & Insights",
          path: "/posts",
          icon: BookOpen,
          show: hasPerm("pages.view"),
        },
        {
          name: "Media Library",
          path: "/media",
          icon: Image,
          show: hasPerm("pages.view"),
          badge: "Assets",
        },
        {
          name: "Navigation Menus",
          path: "/menus",
          icon: FolderTree,
          show: hasPerm("pages.view"),
        },
        {
          name: "Leads Inbox",
          path: "/leads",
          icon: Inbox,
          show: hasPerm("leads.view"),
          badge: "Inbound",
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
          name: "Tasks & Actions",
          path: "/tasks",
          icon: CheckSquare,
          show: hasPerm("tasks.view"),
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
          name: "Users & Staff",
          path: "/users",
          icon: Users,
          show: hasPerm("users.view"),
        },
        {
          name: "Roles & Matrix",
          path: "/roles",
          icon: ShieldCheck,
          show: hasPerm("roles.view"),
        },
        {
          name: "Audit Trail",
          path: "/audit-logs",
          icon: FileText,
          show: hasPerm("audit.view"),
        },
        {
          name: "Site Settings",
          path: "/settings",
          icon: Sliders,
          show: hasPerm("settings.view"),
        },
      ],
    },
  ];

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
    if (path.startsWith("/tasks")) return "Task & Follow-up Actions";
    if (path.startsWith("/emails")) return "Transactional Outbox & Templates";
    if (path.startsWith("/users")) return "Staff & Access Control";
    if (path.startsWith("/roles")) return "RBAC Permissions Matrix";
    if (path.startsWith("/audit")) return "Security Audit Log Trail";
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30">
              {companyName ? companyName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-base truncate max-w-[150px] inline-block align-middle">
              {companyName}
            </span>
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
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
              <Moon className="w-5 h-5 text-indigo-600" />
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
        } lg:flex lg:h-screen lg:w-72 bg-white dark:bg-[#0c1222] border-r border-slate-200/90 dark:border-slate-800/90 flex-shrink-0 flex-col justify-between transition-colors duration-200 shadow-sm z-30 overflow-y-auto`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={resolveMediaUrl(logoUrl)}
                    alt={companyName}
                    className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
                    {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight truncate max-w-[130px]">
                      {companyName}
                    </h1>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200/70 dark:border-indigo-800/60">
                      v2.4
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate max-w-[140px]">
                    Enterprise Suite
                  </span>
                </div>
              </div>

              {/* Close button on mobile */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Navigation Groups */}
            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter((item) => item.show);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.label} className="space-y-1">
                    <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {group.label}
                    </div>
                    {visibleItems.map((item) => {
                      const isActive = location.pathname.startsWith(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25 font-bold"
                              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Card, Theme Toggle & Logout */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0a0f1d]/50">
            {/* Quick Theme Switcher Pill */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full mb-3 flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 transition-all shadow-sm"
              title="Switch Light / Dark UI mode"
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
                <span>
                  Theme: {theme === "dark" ? "Dark Standard" : "Light Mode"}
                </span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-800">
                Switch
              </span>
            </button>

            {/* Profile Bar */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                    {userInitials}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.fullName || "Administrator"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block px-1.5 py-0.2 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                        {user?.roles?.[0] || "Staff"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    title="User Session"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {user?.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" />
                        Sign Out
                      </button>
                      <button
                        onClick={handleLogoutEverywhere}
                        className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Sign Out Everywhere
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Desktop & Tablet Topbar */}
        <header className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 z-20 transition-colors">
          {/* Breadcrumbs & Route Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Platform</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                {getPageTitle()}
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Health pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">API Connected (:5201)</span>
              <span className="md:hidden">Connected</span>
            </div>
          </div>

          {/* Search, Actions & Profile Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick search button triggering Command Palette */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="relative hidden md:flex items-center rounded-xl border border-slate-200 dark:border-slate-800 w-52 lg:w-64 bg-slate-50 dark:bg-slate-900/60 hover:border-indigo-500/60 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group"
              title="Open Global Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 ml-3 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
              <span className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-400 select-none">
                Search or press...
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700/60 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Live Website</span>
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </button>
            </div>

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto w-full max-w-[1850px] 2xl:max-w-[2200px] mx-auto p-6 md:p-8 lg:p-10 xl:p-12">
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
