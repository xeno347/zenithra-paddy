import React, { useMemo } from "react";
import { Activity, TrendingUp } from "lucide-react";
import {
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
export default function DashboardPortal({ company }) {
  const paddyData = useMemo(
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
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">Dashboard</div>
          <div className="mt-1 text-xs text-slate-600">OPEX and paddy collection trends</div>
        </div>

        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-100"
              placeholder="Search..."
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
