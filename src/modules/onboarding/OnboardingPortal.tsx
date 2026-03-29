import React, { useState } from "react";
import { Leaf, Loader2 } from "lucide-react";
import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type LoginCredentials = {
  loginId: string;
  password: string;
};

type OnboardingPayload = {
  operatorName: string;
  siteName: string;
  primaryContact: string;
  phone: string;
  targetTonnage: number;
  role: string;
  registeredAt: string;
  opex: {
    labor: number;
    fuel: number;
    maintenance: number;
    loading: number;
    misc: number;
  };
  equipment: Array<{
    id: string;
    type: string;
    capacity: number;
    count: number;
  }>;
  reports: {
    frequency: string;
    recipients: string;
  };
};

type OnboardingPortalProps = {
  onComplete?: (data: OnboardingPayload) => LoginCredentials;
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
        "shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100",
        props.className
      )}
    />
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
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

function Button({
  loading,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-primary text-white shadow-sm hover:opacity-90",
        "focus:outline-none focus:ring-4 focus:ring-blue-100",
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

export default function OnboardingPortal({ onComplete }: OnboardingPortalProps) {
  const [loading, setLoading] = useState(false);
  const [issuedCredentials, setIssuedCredentials] = useState<LoginCredentials | null>(null);
  const [company, setCompany] = useState({
    operatorName: "",
    siteName: "",
    primaryContact: "",
    phone: "",
    targetTonnage: 120,
    assetType: "Baler",
    assetCount: 2,
    assetCapacity: 8,
    opexLabor: 1200,
    opexFuel: 650,
    opexMaintenance: 250,
    opexLoading: 300,
    opexMisc: 150,
    reportFrequency: "weekly",
    reportRecipients: "owner@company.com",
  });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);

    const created = onComplete?.({
      ...company,
      role: "owner",
      registeredAt: new Date().toISOString(),
      opex: {
        labor: Number(company.opexLabor),
        fuel: Number(company.opexFuel),
        maintenance: Number(company.opexMaintenance),
        loading: Number(company.opexLoading),
        misc: Number(company.opexMisc),
      },
      equipment: [{
        id: crypto.randomUUID(),
        type: company.assetType,
        capacity: Number(company.assetCapacity),
        count: Number(company.assetCount),
      }],
      reports: {
        frequency: company.reportFrequency,
        recipients: company.reportRecipients,
      },
    });

    if (created) setIssuedCredentials(created);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">Zenithra Paddy</div>
              <div className="text-xs text-slate-600">Company registration</div>
            </div>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to selection
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {issuedCredentials ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h1 className="text-xl font-semibold text-slate-900">Onboarding complete</h1>
            <p className="mt-2 text-sm text-slate-600">
              Use these credentials to log in to the dashboard.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-600">Login ID</div>
                <div className="mt-1 font-mono text-sm text-slate-900">{issuedCredentials.loginId}</div>
              </div>
              <div className="rounded-lg border border-border bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-600">Password</div>
                <div className="mt-1 font-mono text-sm text-slate-900">{issuedCredentials.password}</div>
              </div>
            </div>

            <div className="mt-5">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Continue to login
              </Link>
            </div>
          </div>
        ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <h1 className="text-xl font-semibold text-slate-900">Register & onboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Complete registration, Assets, OPEX, and Reports setup to get your dashboard login.
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

            <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-4">
              <div className="text-sm font-semibold text-slate-900">Assets setup</div>
            </div>

            <Field label="Primary asset type">
              <Input
                value={company.assetType}
                onChange={(e) => setCompany((p) => ({ ...p, assetType: e.target.value }))}
                placeholder="e.g., Baler"
              />
            </Field>
            <Field label="Asset count">
              <Input
                type="number"
                min={1}
                value={company.assetCount}
                onChange={(e) => setCompany((p) => ({ ...p, assetCount: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Capacity per asset (tons/hour)">
              <Input
                type="number"
                min={1}
                value={company.assetCapacity}
                onChange={(e) => setCompany((p) => ({ ...p, assetCapacity: Number(e.target.value) }))}
              />
            </Field>

            <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-4">
              <div className="text-sm font-semibold text-slate-900">OPEX setup</div>
            </div>

            <Field label="Labor budget (monthly)">
              <Input
                type="number"
                min={0}
                value={company.opexLabor}
                onChange={(e) => setCompany((p) => ({ ...p, opexLabor: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Fuel budget (monthly)">
              <Input
                type="number"
                min={0}
                value={company.opexFuel}
                onChange={(e) => setCompany((p) => ({ ...p, opexFuel: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Maintenance budget (monthly)">
              <Input
                type="number"
                min={0}
                value={company.opexMaintenance}
                onChange={(e) => setCompany((p) => ({ ...p, opexMaintenance: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Loading budget (monthly)">
              <Input
                type="number"
                min={0}
                value={company.opexLoading}
                onChange={(e) => setCompany((p) => ({ ...p, opexLoading: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Misc budget (monthly)">
              <Input
                type="number"
                min={0}
                value={company.opexMisc}
                onChange={(e) => setCompany((p) => ({ ...p, opexMisc: Number(e.target.value) }))}
              />
            </Field>

            <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-4">
              <div className="text-sm font-semibold text-slate-900">Reports setup</div>
            </div>

            <Field label="Report frequency">
              <Input
                value={company.reportFrequency}
                onChange={(e) => setCompany((p) => ({ ...p, reportFrequency: e.target.value }))}
                placeholder="daily | weekly | monthly"
              />
            </Field>
            <Field label="Report recipients" hint="Comma separated emails">
              <Input
                value={company.reportRecipients}
                onChange={(e) => setCompany((p) => ({ ...p, reportRecipients: e.target.value }))}
                placeholder="ops@company.com, owner@company.com"
              />
            </Field>

            <div className="md:col-span-2 mt-2 flex justify-end">
              <Button type="submit" loading={loading}>
                Finish onboarding and generate login
              </Button>
            </div>
          </form>
        </div>
        )}
      </main>
    </div>
  );
}
