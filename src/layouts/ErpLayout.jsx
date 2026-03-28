import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  Fuel,
  FileText,
  Settings,
  Leaf,
  LogOut,
} from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Item({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-200/75 hover:bg-white/5 hover:text-white"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function ErpLayout({ company, onReset }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slateInk-950 via-slateInk-950 to-slateInk-900 text-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-white/5 backdrop-blur md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Zenithra Paddy</div>
              <div className="mt-0.5 truncate text-xs text-slate-200/70">
                {company?.operatorName || "Company"}
              </div>
            </div>
          </div>

          <nav className="px-3 pb-4">
            <div className="space-y-1">
              <Item to="/dashboard" icon={BarChart3} label="Dashboard" end />
              <Item to="/assets" icon={Boxes} label="Assets" />
              <Item to="/opex" icon={Fuel} label="OPEX" />
              <Item to="/reports" icon={FileText} label="Reports" />
              <Item to="/settings" icon={Settings} label="Settings" />
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                onClick={onReset}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-200/75 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch company</span>
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{company?.siteName || "Site"}</div>
                <div className="mt-0.5 text-xs text-slate-200/70">Role: {company?.role || "owner"}</div>
              </div>
              <div className="hidden md:block text-xs text-slate-200/70">
                ERP Modules
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
