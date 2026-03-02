import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type CurrentUser, getPrincipalProfile, logout } from "@/store/data";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Calendar,
  CheckSquare,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Ticket,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";

export type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

interface DashboardLayoutProps {
  user: CurrentUser;
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({
  user,
  navItems,
  activeSection,
  onSectionChange,
  children,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const activeItem = navItems.find((n) => n.id === activeSection);

  const roleLabel =
    user.role === "principal"
      ? "Principal"
      : user.role === "teacher"
        ? "Teacher"
        : "Student";

  const roleBadgeClass =
    user.role === "principal"
      ? "bg-primary text-primary-foreground"
      : user.role === "teacher"
        ? "badge-success text-sm"
        : "badge-info text-sm";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "260px",
          backgroundColor: "oklch(var(--sidebar))",
          borderRight: "1px solid oklch(var(--sidebar-border))",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                getPrincipalProfile().institutionLogo ||
                "/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png"
              }
              alt="Rahmaniyya Public School"
              className="w-10 h-10 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p
                className="text-xs font-bold leading-tight truncate"
                style={{ color: "oklch(0.95 0.02 264)" }}
              >
                Rahmaniyya Public School
              </p>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "oklch(0.65 0.06 264)" }}
              >
                {roleLabel} Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white shrink-0 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-2.5">
            {user.role === "principal" && getPrincipalProfile().photo ? (
              <img
                src={getPrincipalProfile().photo}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "oklch(0.55 0.15 210)" }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "oklch(0.65 0.06 264)" }}
              >
                {user.id}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadgeClass}`}
            >
              {roleLabel}
              {user.class ? ` · ${user.class}` : ""}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setSidebarOpen(false);
              }}
              className={`sidebar-link w-full text-left ${activeSection === item.id ? "active" : ""}`}
            >
              <span className="shrink-0 w-4 h-4">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 min-w-[20px] justify-center"
                  style={{
                    backgroundColor: "oklch(0.55 0.15 210)",
                    color: "white",
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-3 border-t"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link w-full text-left"
            style={{ color: "oklch(0.75 0.1 25)" }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {activeItem?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page content — watermark sits behind all content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 0, left: "260px" }}
          >
            <img
              src={
                getPrincipalProfile().institutionLogo ||
                "/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png"
              }
              alt=""
              className="w-80 h-80 object-contain select-none"
              style={{ opacity: 0.04 }}
            />
          </div>
          {/* Content above watermark */}
          <div className="relative" style={{ zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// Icon exports for use in dashboards
// ============================================================
export {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  Calendar,
  FileText,
  CheckSquare,
  BookOpen,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Mail,
  LogOut,
  BarChart3,
  Upload,
  Ticket,
  MessageSquare,
  UserCheck,
  BookOpenCheck,
};
