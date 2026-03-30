import React, { useMemo, useEffect, useState } from "react";
import { Activity, TrendingUp, Users, Truck, Clock, ArrowRight, Zap, Target, DollarSign, Briefcase } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

// Fix default icon paths in leaflet using vite/webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cx(
        "rounded-md border border-slate-200 bg-white shadow-soft transition-all",
        className
      )}
    >
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend = "up"
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="flex rounded-md bg-slate-100 p-2 text-slate-600 border border-slate-200">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        </div>
        {hint ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span className={cx(
              "px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider",
              trend === "up" ? "bg-emerald-50 text-emerald-600" :
              trend === "down" ? "bg-rose-50 text-rose-600" :
              "bg-slate-100 text-slate-600"
            )}>
              {trend === "up" ? "+12%" : trend === "down" ? "-4%" : "Avg"}
            </span>
            <span className="text-xs text-slate-500">{hint}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
type Company = {
  operatorName?: string;
  siteName?: string;
  role?: string;
  targetTonnage?: number;
  equipment?: Array<{
    id?: string;
    type?: string;
    capacity?: number;
    count?: number;
  }>;
  opex?: {
    labor?: number;
    fuel?: number;
    maintenance?: number;
    loading?: number;
    misc?: number;
  };
};

export default function DashboardPortal({ company, onReset }: { company?: Company; onReset?: () => void }) {
  const dates = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - (6 - i));
      return fmt.format(d);
    });
  }, []);

  const paddyData = useMemo(
    () =>
      [18, 24, 21, 29, 26, 31, 22].map((tons, idx) => ({
        date: dates[idx],
        tons,
      })),
    [dates]
  );

  const totalCollected = paddyData.reduce((sum, d) => sum + d.tons, 0);

  const opexSeries = useMemo(() => {
    const labor = Number(company?.opex?.labor ?? 1200);
    const fuel = Number(company?.opex?.fuel ?? 650);
    const maintenance = Number(company?.opex?.maintenance ?? 250);
    const fleet = Number(company?.opex?.loading ?? 300) + Number(company?.opex?.misc ?? 150);

    const factors = [0.92, 1.03, 0.88, 1.09, 1.01, 0.95, 1.06];

    const data = dates.map((date, idx) => {
      const f = factors[idx % factors.length];
      const hr = Math.max(0, Math.round((labor / 7) * f));
      const flt = Math.max(0, Math.round((fleet / 7) * (0.95 + (f - 1) * 0.6)));
      const fFuel = Math.max(0, Math.round((fuel / 7) * (0.9 + (f - 1) * 0.9)));
      const maint = Math.max(0, Math.round((maintenance / 7) * (0.97 + (f - 1) * 0.5)));
      return { date, hr, fleet: flt, fuel: fFuel, maintenance: maint };
    });

    function avgOf(key: "hr" | "fleet" | "fuel" | "maintenance") {
      return data.reduce((sum, d) => sum + d[key], 0) / Math.max(1, data.length);
    }

    const thresholds = {
      hr: Math.round(avgOf("hr") * 1.1),
      fleet: Math.round(avgOf("fleet") * 1.1),
      fuel: Math.round(avgOf("fuel") * 1.1),
      maintenance: Math.round(avgOf("maintenance") * 1.1),
    };

    return { data, thresholds };
  }, [company, dates]);

  const tooltipStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.96)",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: 12,
    color: "#0f172a",
  };

  const farmsCount = useMemo(() => {
    const seed = `${company?.operatorName ?? ""}|${company?.siteName ?? ""}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return (hash % 18) + 6;
  }, [company?.operatorName, company?.siteName]);

  const equipmentCount = useMemo(() => {
    return (company?.equipment ?? []).reduce((sum, e) => sum + Number(e?.count ?? 0), 0);
  }, [company?.equipment]);

  const optimizationCapacityPct = useMemo(() => {
    const target = Number(company?.targetTonnage ?? 0);
    const capacityPerCycle = (company?.equipment ?? []).reduce((sum, e) => {
      return sum + Number(e?.capacity ?? 0) * Number(e?.count ?? 0);
    }, 0);

    if (!target || !capacityPerCycle) return 72;
    return Math.max(0, Math.min(100, Math.round((capacityPerCycle / target) * 100)));
  }, [company?.equipment, company?.targetTonnage]);

  const operationalStrength = useMemo(() => {
    const base = farmsCount * 6 + equipmentCount * 8;
    return Math.max(10, Math.round(base));
  }, [equipmentCount, farmsCount]);

  const estimatedMoneySaved = useMemo(() => {
    const weeklyOpex =
      Number(company?.opex?.labor ?? 0) +
      Number(company?.opex?.fuel ?? 0) +
      Number(company?.opex?.maintenance ?? 0) +
      Number(company?.opex?.loading ?? 0) +
      Number(company?.opex?.misc ?? 0);

    const estimated = weeklyOpex * (optimizationCapacityPct / 100) * 0.06;
    return Math.max(0, Math.round(estimated));
  }, [company?.opex, optimizationCapacityPct]);

  const money = useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }, []);

  return (
    <div className="min-h-full bg-background pb-8 pt-4 text-slate-900">
      <main className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Dashboard v3</h1>
            <p className="mt-1 text-sm text-slate-500">Operational metrics and OPEX tracking</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-soft transition-colors hover:bg-slate-50"
            >
              Change Site
            </Link>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:opacity-90"
            >
              New Initialization
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Farms Covered" value={farmsCount} hint="Active points" icon={Target} trend="up" />
          <KpiCard label="Operational Strength" value={operationalStrength} hint="Est. manpower" icon={Users} trend="up" />
          <KpiCard label="Optimization" value={`${optimizationCapacityPct}%`} hint="Utilization" icon={Zap} trend="neutral" />
          <KpiCard label="Money Saved" value={money.format(estimatedMoneySaved)} hint="WTD savings" icon={DollarSign} trend="up" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* Quick Actions (Left Column) */}
          <div className="xl:col-span-3 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
              <Link to="/settings" className="text-sm font-medium text-blue-600 hover:text-blue-700">All</Link>
            </div>
            <div className="flex flex-col gap-3 flex-grow">
              <Link
                to="/dashboard"
                className="group flex flex-col justify-center flex-grow rounded-md border border-slate-200 bg-white p-4 shadow-soft transition-all hover:bg-slate-50"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-primary transition-colors">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Current Operations</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
              <Link
                to="/hrms#fleet"
                className="group flex flex-col justify-center flex-grow rounded-md border border-slate-200 bg-white p-4 shadow-soft transition-all hover:bg-slate-50"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-primary transition-colors">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Fleet Management</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
              <Link
                to="/hrms#attendance"
                className="group flex flex-col justify-center flex-grow rounded-md border border-slate-200 bg-white p-4 shadow-soft transition-all hover:bg-slate-50"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-primary transition-colors">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Team Attendance</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* Total Paddy Collected (Right Column) */}
          <div className="xl:col-span-9 flex flex-col pt-10 xl:pt-0">
            <div className="mb-4 xl:hidden">
              <h2 className="text-base font-semibold text-slate-900">Total Paddy Collected</h2>
            </div>
            <Card className="flex-grow flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 rounded-t-2xl">
                <div>
                  <h3 className="font-semibold text-slate-900">Total Paddy Collected</h3>
                  <p className="mt-1 text-sm text-slate-500">Weekly tonnage yield across all active sites</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +14%
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalCollected}t</div>
                </div>
              </div>

              <div className="px-4 py-6 flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paddyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                    <Line type="monotone" dataKey="tons" name="Tons" stroke="#1aa85a" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">OPEX Distribution Analysis</h2>
              <p className="mt-1 text-sm text-slate-500">Resource utilization vs estimated thresholds</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-grow">
              <Card className="flex flex-col h-full">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Human Resources</div>
                      <div className="mt-0.5 text-xs text-slate-500">Daily cost map</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Ceiling</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">
                      ${opexSeries.thresholds.hr}
                    </div>
                  </div>
                </div>
                <div className="h-56 px-2 py-5 flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opexSeries.data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={40} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                      <ReferenceLine y={opexSeries.thresholds.hr} stroke="rgba(15,23,42,0.35)" strokeDasharray="6 4" />
                      <Line type="monotone" dataKey="hr" name="Human resources" stroke="#4c5a8b" strokeWidth={2.25} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Fleet Operations</div>
                      <div className="mt-0.5 text-xs text-slate-500">Daily cost map</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Ceiling</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">
                      ${opexSeries.thresholds.fleet}
                    </div>
                  </div>
                </div>
                <div className="h-56 px-2 py-5 flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opexSeries.data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={40} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                      <ReferenceLine y={opexSeries.thresholds.fleet} stroke="rgba(15,23,42,0.35)" strokeDasharray="6 4" />
                      <Line type="monotone" dataKey="fleet" name="Fleet" stroke="#6072aa" strokeWidth={2.25} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Fuel Consumption</div>
                      <div className="mt-0.5 text-xs text-slate-500">Daily cost map</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Ceiling</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">
                      ${opexSeries.thresholds.fuel}
                    </div>
                  </div>
                </div>
                <div className="h-56 px-2 py-5 flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opexSeries.data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={40} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                      <ReferenceLine y={opexSeries.thresholds.fuel} stroke="rgba(15,23,42,0.35)" strokeDasharray="6 4" />
                      <Line type="monotone" dataKey="fuel" name="Fuel" stroke="#1aa85a" strokeWidth={2.25} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="flex flex-col h-full">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Maintenance</div>
                      <div className="mt-0.5 text-xs text-slate-500">Daily cost map</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Ceiling</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">
                      ${opexSeries.thresholds.maintenance}
                    </div>
                  </div>
                </div>
                <div className="h-56 px-2 py-5 flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opexSeries.data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(71,85,105,0.75)" tickLine={false} axisLine={false} width={40} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(15, 23, 42, 0.7)" }} />
                      <ReferenceLine y={opexSeries.thresholds.maintenance} stroke="rgba(15,23,42,0.35)" strokeDasharray="6 4" />
                      <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="#94a3b8" strokeWidth={2.25} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Live Operations Map</h2>
                <p className="mt-1 text-sm text-slate-500">Fleet and personnel locations</p>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Expand</button>
            </div>
            
            <Card className="flex-grow flex flex-col relative overflow-hidden bg-slate-50 min-h-[400px]">
              <div className="flex-grow relative z-10 w-full h-full min-h-[350px]">
                <MapContainer center={[21.2514, 81.6296]} zoom={11} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  />
                  
                  {/* Sites */}
                  <CircleMarker center={[21.28, 81.65]} radius={8} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Site A (Active)</div>
                    </Popup>
                  </CircleMarker>
                  <CircleMarker center={[21.22, 81.61]} radius={8} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Site B (Active)</div>
                    </Popup>
                  </CircleMarker>

                  {/* Fleet */}
                  <CircleMarker center={[21.24, 81.67]} radius={6} pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Fleet #4</div>
                      <div className="text-xs text-slate-500">In Transit</div>
                    </Popup>
                  </CircleMarker>
                  <CircleMarker center={[21.26, 81.59]} radius={6} pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Fleet #2</div>
                      <div className="text-xs text-slate-500">Loading</div>
                    </Popup>
                  </CircleMarker>

                  {/* Personnel */}
                  <CircleMarker center={[21.25, 81.63]} radius={5} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Team Alpha</div>
                    </Popup>
                  </CircleMarker>
                  <CircleMarker center={[21.21, 81.65]} radius={5} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
                    <Popup>
                      <div className="text-sm font-semibold">Team Beta</div>
                    </Popup>
                  </CircleMarker>
                </MapContainer>
              </div>

              {/* Map Legend */}
              <div className="relative z-20 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span> 
                    <span>Sites (6)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-violet-100"></span> 
                    <span>Fleet (12)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100"></span> 
                    <span>Personnel (4)</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
