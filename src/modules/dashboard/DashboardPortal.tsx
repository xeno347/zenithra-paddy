import React, { useMemo } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Fuel,
  Gauge,
  Leaf,
  LogOut,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-border bg-white shadow-soft",
        className
      )}
    >
      {children}
    </section>
  );
}

function ProgressBar({ value = 0.6 }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

function GaugeRing({ value = 0.72 }) {
  const pct = Math.max(0, Math.min(1, value));
  const dash = 2 * Math.PI * 18;
  const dashOffset = dash * (1 - pct);
  const status = pct >= 0.85 ? "Working Systematically" : pct >= 0.7 ? "On Track" : "At Risk";
  const color = pct >= 0.85 ? "#1aa85a" : pct >= 0.7 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-4 text-slate-800">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e6edf7" strokeWidth="6" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-800">
          {Math.round(pct * 100)}%
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">OPEX Health</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-900">{status}</div>
      </div>
    </div>
  );
}

export default function DashboardPortal({ company, onReset }) {
  const dailyData = useMemo(
    () => [
      { day: "Mon", tons: 18 },
      { day: "Tue", tons: 24 },
      { day: "Wed", tons: 21 },
      { day: "Thu", tons: 29 },
      { day: "Fri", tons: 26 },
      { day: "Sat", tons: 31 },
      { day: "Sun", tons: 22 },
    ],
    []
  );

  const expected = (company?.targetTonnage || 170) * 7;
  const actual = dailyData.reduce((a, d) => a + d.tons, 0);
  const ratio = actual / expected;

  const liveFeed = [
    { t: "08:12", title: "Baler #2", desc: "Cycle started — Field 14", icon: Leaf },
    { t: "09:05", title: "Fuel", desc: `Spent $${company?.opex?.fuel || 94} — refill`, icon: Fuel },
    { t: "10:22", title: "QC", desc: "Moisture check passed", icon: CheckCircle2 },
  ];

  return (
    <div className="h-full text-slate-900">
      <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-soft xl:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Zenithra Paddy</div>
            <div className="text-xs text-slate-500">{company?.operatorName}</div>
          </div>
        </div>

        <div className="hidden md:block flex-1 max-w-xl">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-border bg-slate-50 px-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="Search ops, equipment, cycles..."
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to selection
          </Link>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-500 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            New site
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-6 xl:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">OPEX Health</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">System status</div>
                </div>
                <Gauge className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4">
                <GaugeRing value={0.86} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">Output vs Target</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">Expected {expected}t</div>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{actual}t</div>
              <div className="mt-3">
                <ProgressBar value={ratio} />
              </div>
              <div className="mt-2 text-xs text-slate-500">{Math.round(ratio * 100)}% achieved</div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="text-xs text-slate-500">Active Site</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{company?.siteName}</div>
              <div className="mt-3 text-xs text-slate-500">
                Target: {company?.targetTonnage}t/cycle
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-9">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Daily Tonnage Graph</div>
                <div className="mt-0.5 text-xs text-slate-500">Last 7 days</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                <Activity className="h-4 w-4" /> Live
              </div>
            </div>
            <div className="h-72 px-2 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tonsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f80ed" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#2f80ed" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e8eef8" vertical={false} />
                  <XAxis dataKey="day" stroke="#7a8da9" tickLine={false} axisLine={false} />
                  <YAxis stroke="#7a8da9" tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #dbe5f3",
                      borderRadius: 12,
                      color: "#0f172a",
                    }}
                    labelStyle={{ color: "#6b7280" }}
                  />
                  <Area type="monotone" dataKey="tons" stroke="#2f80ed" strokeWidth={2.5} fill="url(#tonsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="xl:col-span-3">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Live Feed</div>
                <div className="mt-0.5 text-xs text-slate-500">Recent activity</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {liveFeed.map((it, i) => {
                const Icon = it.icon;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-slate-900">{it.title}</div>
                        <div className="text-[11px] text-slate-500">{it.t}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{it.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
