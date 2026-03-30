import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  Settings,
  Leaf,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { ComponentType } from "react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Item({
  to,
  icon: Icon,
  label,
  collapsed = false,
  end = false,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cx(
          "flex items-center rounded-xl px-3 py-2 text-sm",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function ErpLayout({ company, onReset, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const location = useLocation();
  const isFullWidthRoute = location.pathname.startsWith("/operations/farmer-pipeline");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={cx(
          "grid min-h-screen grid-cols-1",
          isSidebarCollapsed ? "md:grid-cols-[88px_1fr]" : "md:grid-cols-[280px_1fr]"
        )}
      >
        <aside className="border-b border-border bg-white md:border-b-0 md:border-r">
          <div className={cx("flex px-4 py-4", isSidebarCollapsed ? "justify-center" : "items-center gap-3")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
              <Leaf className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight text-slate-900">Zenithra Paddy</div>
                <div className="mt-0.5 truncate text-xs text-slate-500">
                  {company?.operatorName || "Company"}
                </div>
              </div>
            )}
          </div>

          <nav className="px-3 pb-4">
            <div className="space-y-1">
              <Item to="/dashboard" icon={BarChart3} label="Dashboard" collapsed={isSidebarCollapsed} end />
              <Item to="/hrms" icon={Users} label="HRMS" collapsed={isSidebarCollapsed} />
              <Item to="/settings" icon={Settings} label="Settings" collapsed={isSidebarCollapsed} />
            </div>

            <div className="mt-6">
              {!isSidebarCollapsed && (
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Operations Managment
                </div>
              )}
              <div className="space-y-1">
                <Item
                  to="/operations/collection-planning"
                  icon={BarChart3}
                  label="Collection planning"
                  collapsed={isSidebarCollapsed}
                />
                <Item
                  to="/operations/farmer-pipeline"
                  icon={BarChart3}
                  label="Farmer pipeline"
                  collapsed={isSidebarCollapsed}
                />
                <Item
                  to="/operations/live-tracking"
                  icon={BarChart3}
                  label="Live tracking"
                  collapsed={isSidebarCollapsed}
                />
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <button
                onClick={onLogout}
                title={isSidebarCollapsed ? "Logout" : undefined}
                className={cx(
                  "mb-2 flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  isSidebarCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <LogOut className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>

              <button
                onClick={onReset}
                title={isSidebarCollapsed ? "Switch company" : undefined}
                className={cx(
                  "flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  isSidebarCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <LogOut className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Switch company</span>}
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-border bg-white/90 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{company?.siteName || "Site"}</div>
                <div className="mt-0.5 text-xs text-slate-500">Role: {company?.role || "owner"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className="hidden md:inline-flex items-center justify-center rounded-lg border border-border bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
                <div className="hidden md:block text-xs text-slate-500">
                  ERP Modules
                </div>
              </div>
            </div>
          </header>

          <main
            className={cx(
              "w-full px-4 py-6",
              isFullWidthRoute ? "max-w-none" : "mx-auto max-w-6xl"
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
