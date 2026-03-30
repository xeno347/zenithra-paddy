import React from "react";
import { Activity, MapPinned, Truck, Wifi } from "lucide-react";

export default function LiveTrackingPage() {
  return (
    <section className="rounded-3xl border border-border bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Live tracking</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor vehicles, collection points, and field movement in near real-time.</p>
          </div>
          <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Control center
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600"><Truck className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Active vehicles</span></div>
            <div className="mt-2 text-xl font-semibold text-slate-900">24</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600"><MapPinned className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Tracked points</span></div>
            <div className="mt-2 text-xl font-semibold text-slate-900">61</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600"><Wifi className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Network health</span></div>
            <div className="mt-2 text-xl font-semibold text-emerald-700">98.2%</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600"><Activity className="h-4 w-4" /><span className="text-xs font-semibold uppercase">Alerts</span></div>
            <div className="mt-2 text-xl font-semibold text-amber-600">3 open</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Map workspace</div>
          <div className="mt-1 text-xs text-slate-500">Vehicle routes and collection points will render here.</div>
          <div className="mt-4 flex h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            Live map canvas
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Recent events</div>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">TR-01 reached Zone A checkpoint</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">Signal drop detected for TR-12</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">Collection confirmed at North cluster</div>
          </div>
        </div>
      </div>
    </section>
  );
}
