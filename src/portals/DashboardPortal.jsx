import React, { useMemo } from "react";
import { Activity, TrendingUp } from "lucide-react";
import {
<<<<<<< Updated upstream
=======
  Activity,
  CheckCircle2,
  Fuel,
  Gauge,
  Leaf,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
>>>>>>> Stashed changes
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return (
    <section
      className={cx(
        "rounded-xl border border-slate-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-soft",
        className
      )}
    >
      {children}
    </section>
  );
}
<<<<<<< Updated upstream
export default function DashboardPortal({ company }) {
  const paddyData = useMemo(
=======

function ProgressBar({ value = 0.6 }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200/80">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-forest-500 to-slateInk-500"
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
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth="6" />
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
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-900">
          {Math.round(pct * 100)}%
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-600">OPEX Health</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-900">{status}</div>
      </div>
    </div>
  );
}

export default function DashboardPortal({ company }) {
  const dailyData = useMemo(
>>>>>>> Stashed changes
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

  const totalCollected = paddyData.reduce((sum, d) => sum + d.tons, 0);

  const opexSeries = useMemo(() => {
    const labor = Number(company?.opex?.labor ?? 1200);
    const fuel = Number(company?.opex?.fuel ?? 650);
    const maintenance = Number(company?.opex?.maintenance ?? 250);
    const fleet = Number(company?.opex?.loading ?? 300) + Number(company?.opex?.misc ?? 150);

    const factors = [0.92, 1.03, 0.88, 1.09, 1.01, 0.95, 1.06];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const data = days.map((day, idx) => {
      const f = factors[idx % factors.length];
      const hr = Math.max(0, Math.round((labor / 7) * f));
      const flt = Math.max(0, Math.round((fleet / 7) * (0.95 + (f - 1) * 0.6)));
      const fFuel = Math.max(0, Math.round((fuel / 7) * (0.9 + (f - 1) * 0.9)));
      const maint = Math.max(0, Math.round((maintenance / 7) * (0.97 + (f - 1) * 0.5)));
      const total = hr + flt + fFuel + maint;
      return { day, hr, fleet: flt, fuel: fFuel, maintenance: maint, total };
    });

    const avgDaily = data.reduce((sum, d) => sum + d.total, 0) / Math.max(1, data.length);
    const threshold = Math.round(avgDaily * 1.1);
    return { data, threshold };
  }, [company]);

  const tooltipStyle = {
    background: "rgba(255, 255, 255, 0.96)",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: 12,
    color: "#0f172a",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
<<<<<<< Updated upstream
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">Dashboard</div>
          <div className="mt-1 text-xs text-slate-600">OPEX and paddy collection trends</div>
=======
        <div>
          <div className="text-lg font-semibold text-slate-900">Dashboard</div>
          <div className="mt-1 text-xs text-slate-600">At-a-glance operations and output trends</div>
>>>>>>> Stashed changes
        </div>

        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-100"
<<<<<<< Updated upstream
              placeholder="Search..."
=======
              placeholder="Search ops, equipment, cycles..."
>>>>>>> Stashed changes
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">OPEX distribution</div>
              <div className="mt-0.5 text-xs text-slate-600">HR, Fleet, Fuel, Maintenance</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Daily threshold</div>
              <div className="mt-0.5 text-xs font-semibold text-slate-900">
                ${opexSeries.threshold}
              </div>
            </div>
          </div>

          <div className="h-80 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={opexSeries.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={34} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "rgba(71,85,105,0.9)" }} />
                <ReferenceLine
                  y={opexSeries.threshold}
                  stroke="rgba(239, 68, 68, 0.75)"
                  strokeDasharray="6 4"
                />
                <Line type="monotone" dataKey="hr" name="Human resources" stroke="#4c5a8b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fleet" name="Fleet" stroke="#6072aa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fuel" name="Fuel" stroke="#1aa85a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#0f172a" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Total paddy collected</div>
              <div className="mt-0.5 text-xs text-slate-600">Collected tons per day</div>
=======
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-600">OPEX Health</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">System status</div>
                </div>
                <Gauge className="h-5 w-5 text-slate-500" />
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
                  <div className="text-xs text-slate-600">Output vs Target</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">Expected {expected}t</div>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{actual}t</div>
              <div className="mt-3">
                <ProgressBar value={ratio} />
              </div>
              <div className="mt-2 text-xs text-slate-600">{Math.round(ratio * 100)}% achieved</div>
>>>>>>> Stashed changes
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                <TrendingUp className="h-4 w-4" /> Total
              </div>
              <div className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
                {totalCollected}t
              </div>
            </div>
          </div>

<<<<<<< Updated upstream
          <div className="h-80 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paddyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={34} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                <Line type="monotone" dataKey="tons" name="Tons" stroke="#1aa85a" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
=======
          <Card>
            <div className="p-5">
              <div className="text-xs text-slate-600">Active Site</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{company?.siteName}</div>
              <div className="mt-3 text-xs text-slate-600">
                Target: {company?.targetTonnage}t/cycle
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-9">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200/70">
              <div>
                <div className="text-sm font-semibold text-slate-900">Daily Tonnage</div>
                <div className="mt-0.5 text-xs text-slate-600">Last 7 days</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                <Activity className="h-4 w-4 text-forest-700" /> Live
              </div>
            </div>
            <div className="h-72 px-2 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tonsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1aa85a" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#1aa85a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(148,163,184,0.45)",
                      borderRadius: 12,
                      color: "#0f172a",
                    }}
                    labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }}
                  />
                  <Area type="monotone" dataKey="tons" stroke="#1aa85a" strokeWidth={2} fill="url(#tonsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="xl:col-span-3">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200/70">
              <div>
                <div className="text-sm font-semibold text-slate-900">Live Feed</div>
                <div className="mt-0.5 text-xs text-slate-600">Recent activity</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {liveFeed.map((it, i) => {
                const Icon = it.icon;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      <Icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-slate-900">{it.title}</div>
                        <div className="text-[11px] text-slate-500">{it.t}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">{it.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
>>>>>>> Stashed changes
    </div>
  );
}
