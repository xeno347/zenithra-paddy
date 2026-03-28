import React, { useState } from "react";
import { Leaf, Loader2 } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Input(props) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
        "shadow-sm outline-none transition focus:border-forest-400 focus:ring-4 focus:ring-forest-100",
        props.className
      )}
    />
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-end justify-between gap-3">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Button({ loading, className, children, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-forest-600 text-white shadow-sm hover:bg-forest-700",
        "focus:outline-none focus:ring-4 focus:ring-forest-200",
        loading && "opacity-80",
        className
      )}
      disabled={loading || props.disabled}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export default function OnboardingPortal({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({
    operatorName: "",
    siteName: "",
    primaryContact: "",
    phone: "",
    targetTonnage: 120,
  });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);

    onComplete?.({
      ...company,
      registeredAt: new Date().toISOString(),
      opex: { labor: 1200, fuel: 650, maintenance: 250, loading: 300, misc: 150 },
      equipment: [{ id: crypto.randomUUID(), type: "Baler", capacity: 8, count: 2 }],
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-forest-50/30">
      <header className="border-b border-slate-200/60 bg-white/60 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-600 text-white shadow-sm">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">Zenithra Paddy</div>
            <div className="text-xs text-slate-600">Company registration</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-6 shadow-soft backdrop-blur">
          <h1 className="text-xl font-semibold text-slate-900">Register & onboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your details to activate the Operations Dashboard.
          </p>

          <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Company/Operator" hint="Legal entity">
              <Input
                required
                value={company.operatorName}
                onChange={(e) => setCompany((p) => ({ ...p, operatorName: e.target.value }))}
                placeholder="e.g., GreenLine Logistics"
              />
            </Field>
            <Field label="Site name">
              <Input
                required
                value={company.siteName}
                onChange={(e) => setCompany((p) => ({ ...p, siteName: e.target.value }))}
                placeholder="e.g., Kaveri Basin Hub"
              />
            </Field>
            <Field label="Primary contact">
              <Input
                value={company.primaryContact}
                onChange={(e) => setCompany((p) => ({ ...p, primaryContact: e.target.value }))}
                placeholder="Full name"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={company.phone}
                onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 ..."
              />
            </Field>
            <Field label="Target (tons/cycle)">
              <Input
                type="number"
                min={0}
                value={company.targetTonnage}
                onChange={(e) =>
                  setCompany((p) => ({ ...p, targetTonnage: Number(e.target.value) }))
                }
              />
            </Field>

            <div className="md:col-span-2 mt-2 flex justify-end">
              <Button type="submit" loading={loading}>
                Activate dashboard
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
