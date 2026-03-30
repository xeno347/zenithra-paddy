import React from "react";
import { Bell, Building2, ShieldCheck, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  return (
    <section className="rounded-3xl border border-border bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="text-lg font-semibold tracking-tight text-slate-900">Settings</div>
        <div className="mt-1 text-sm text-slate-500">Company profile, roles, and operational preferences.</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-slate-900">
            <Building2 className="h-4 w-4" />
            <div className="text-sm font-semibold">Company profile</div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <input className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" defaultValue="Zenithra Paddy" />
            <input className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" defaultValue="Raipur Primary Site" />
            <button className="inline-flex w-fit rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:opacity-90">
              Save profile
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4" />
            <div className="text-sm font-semibold">Roles and access</div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Owner access</span><span className="text-emerald-700 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Manager approvals</span><span className="text-emerald-700 font-semibold">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Audit logs</span><span className="text-emerald-700 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-slate-900">
            <Bell className="h-4 w-4" />
            <div className="text-sm font-semibold">Notifications</div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <span>Daily operations summary</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <span>Critical alerts</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <span>Weekly performance digest</span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-slate-900">
            <SlidersHorizontal className="h-4 w-4" />
            <div className="text-sm font-semibold">Operations preferences</div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Default report frequency: Weekly</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Primary unit: Tons</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Timezone: IST (UTC+5:30)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
