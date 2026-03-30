import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  Radar,
  GitBranch,
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
          "flex items-center rounded-md px-3 py-2 text-sm font-semibold transition",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-primary text-white"
            : "text-[#efe8d1] hover:bg-[#4a5830] hover:text-white"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span
        className={cx(
          "truncate transition-all duration-300 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function ErpLayout({ company, onReset: _onReset, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          className={cx(
            "overflow-hidden border-b border-[#5f6f3c] bg-gradient-to-b from-[#364323] via-[#2f3b1f] to-[#27311a] transition-[width] duration-300 ease-in-out md:border-b-0 md:border-r md:border-[#5f6f3c]",
            isSidebarCollapsed ? "md:w-[88px]" : "md:w-[280px]"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-4">
            <div className={cx("flex min-w-0", isSidebarCollapsed ? "justify-center" : "items-center gap-3")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efd9] text-[#41521f] shadow-soft">
                <Leaf className="h-5 w-5" />
              </div>
              <div
                className={cx(
                  "min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
                  isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[170px] opacity-100"
                )}
              >
                <div className="truncate text-sm font-semibold leading-tight text-white">Zenithra Paddy</div>
                <div className="mt-0.5 truncate text-xs text-[#d8d0b8]">
                  {company?.operatorName || "Company"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden md:inline-flex items-center justify-center rounded-md border border-[#697b44] bg-[#44552b] p-2 text-[#efe8d1] transition hover:bg-[#4f6332] hover:text-white"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="px-3 pb-4">
            <div
              className={cx(
                "overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition-all duration-300 ease-in-out",
                "text-[#9eb08a]",
                isSidebarCollapsed ? "max-h-0 pb-0 opacity-0" : "max-h-8 pb-2 opacity-100"
              )}
            >
              Core
            </div>
            <div className="space-y-1">
              <Item to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={isSidebarCollapsed} end />
            </div>

            <div className="mt-6">
              <div
                className={cx(
                  "overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition-all duration-300 ease-in-out",
                  "text-[#9eb08a]",
                  isSidebarCollapsed ? "max-h-0 pb-0 opacity-0" : "max-h-8 pb-2 opacity-100"
                )}
              >
                Operations
              </div>
              <div className="space-y-1">
                <Item
                  to="/operations/live-tracking"
                  icon={Radar}
                  label="Live tracking"
                  collapsed={isSidebarCollapsed}
                />
                <Item
                  to="/operations/collection-planning"
                  icon={Route}
                  label="Collection planning"
                  collapsed={isSidebarCollapsed}
                />
                <Item
                  to="/operations/farmer-pipeline"
                  icon={GitBranch}
                  label="Farmer pipeline"
                  collapsed={isSidebarCollapsed}
                />
              </div>
            </div>

            <div className="mt-6">
              <div
                className={cx(
                  "overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition-all duration-300 ease-in-out",
                  "text-[#9eb08a]",
                  isSidebarCollapsed ? "max-h-0 pb-0 opacity-0" : "max-h-8 pb-2 opacity-100"
                )}
              >
                Administration
              </div>
              <div className="space-y-1">
                <Item to="/hrms" icon={Users} label="HRMS" collapsed={isSidebarCollapsed} />
                <Item to="/settings" icon={Settings} label="Settings" collapsed={isSidebarCollapsed} />
              </div>
            </div>

            <div className="mt-4 border-t border-[#5f6f3c] pt-4">
              <button
                onClick={onLogout}
                title={isSidebarCollapsed ? "Logout" : undefined}
                className={cx(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-[#efe8d1] transition hover:bg-[#4a5830] hover:text-white",
                  isSidebarCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <LogOut className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-border bg-[#fffaf0]/95 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{company?.siteName || "Site"}</div>
                <div className="mt-0.5 text-xs text-[#7a6642]">Farm Operations / Dashboard</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden rounded-sm border border-[#d7c79e] bg-[#f4ecd7] px-2.5 py-1 text-[11px] font-semibold text-[#5f4a24] md:block">
                  Paddy Straw Ops
                </div>
              </div>
            </div>
          </header>

          <main className="w-full px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
