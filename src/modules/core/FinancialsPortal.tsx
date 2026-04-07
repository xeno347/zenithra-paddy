import React, { useMemo } from "react";
import { Banknote, Calculator, Layers3, PiggyBank, Wallet } from "lucide-react";
import companyLogo from "../../assets/A (1).png";
import { STORAGE_KEYS } from "../../lib/config/storageKeys";
import { readJson } from "../../lib/storage/jsonStorage";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinancialSnapshot = {
  projectName?: string;
  organizationName?: string;
  unitName?: string;
  targetTonnage?: number;
  collectionGoalPerCycle?: number;
  collectionWindowDays?: number;
  collectionWindowFrom?: string;
  collectionWindowTo?: string;
  capex?: {
    amount?: number;
    items?: Array<{
      lineItem?: string;
      make?: string;
      capacityPerDay?: number;
      quantity?: number;
      perUnitCost?: number;
      amount?: number;
    }>;
  };
  opex?: {
    labor?: number;
    fuel?: number;
    maintenance?: number;
    loading?: number;
    misc?: number;
  };
  investment?: {
    amount?: number;
    equity?: number;
    debt?: number;
    debtInterestRate?: number;
  };
  credentials?: {
    loginId?: string;
    password?: string;
  };
  amortization?: {
    totalDays?: number;
  };
  registeredAt?: string;
  actualOpexThisMonth?: number;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
          {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function FinancialsPortal({ company }: { company?: FinancialSnapshot | null }) {
  const snapshot = readJson(STORAGE_KEYS.ONBOARDING_SNAPSHOT, null) as FinancialSnapshot | null;
  const data = company ?? snapshot;

  const metrics = useMemo(() => {
    const capex = Number(data?.capex?.amount ?? 0);
    const opex = Number(
      (data?.opex?.labor ?? 0) +
        (data?.opex?.fuel ?? 0) +
        (data?.opex?.maintenance ?? 0) +
        (data?.opex?.loading ?? 0) +
        (data?.opex?.misc ?? 0)
    );
    const investment = Number(data?.investment?.amount ?? capex + opex);
    const equity = Number(data?.investment?.equity ?? 0);
    const debt = Number(data?.investment?.debt ?? 0);
    const debtInterestRate = Number(data?.investment?.debtInterestRate ?? 0);

    return { capex, opex, investment, equity, debt, debtInterestRate };
  }, [data]);

  const comparativeOpexData = useMemo(() => {
    const threshold = metrics.opex;
    const actualCurrent = Number(data?.actualOpexThisMonth ?? threshold * 0.97);
    return [
      {
        name: "Jan",
        threshold,
        actual: Number((threshold * 0.92).toFixed(0)),
      },
      {
        name: "Feb",
        threshold,
        actual: Number((threshold * 1.04).toFixed(0)),
      },
      {
        name: "Mar",
        threshold,
        actual: Number(actualCurrent.toFixed(0)),
      },
    ];
  }, [data?.actualOpexThisMonth, metrics.opex]);

  const opexPieData = useMemo(() => {
    const labor = Number(data?.opex?.labor ?? 0);
    const fuel = Number(data?.opex?.fuel ?? 0);
    const maintenance = Number(data?.opex?.maintenance ?? 0);
    const vehicle = Number(data?.opex?.loading ?? 0);
    const miscellaneous = Number(data?.opex?.misc ?? 0);
    return [
      { name: "Manpower", value: labor, color: "#2563eb" },
      { name: "Fuel", value: fuel, color: "#f59e0b" },
      { name: "Maintenance", value: maintenance, color: "#16a34a" },
      { name: "Vehicle", value: vehicle, color: "#7c3aed" },
      { name: "Miscellaneous", value: miscellaneous, color: "#ef4444" },
    ];
  }, [data?.opex?.fuel, data?.opex?.labor, data?.opex?.loading, data?.opex?.maintenance, data?.opex?.misc]);

  const totalPieOpex = useMemo(
    () => opexPieData.reduce((sum, slice) => sum + Number(slice.value || 0), 0),
    [opexPieData]
  );

  const amortizationWidget = useMemo(() => {
    const now = new Date();

    const realTotalDays = Number(data?.amortization?.totalDays ?? 0);
    const realStartDate = data?.registeredAt ? new Date(data.registeredAt) : null;
    const realPrincipal = Number(data?.investment?.debt ?? 0) || Number(data?.capex?.amount ?? 0);

    const hasRealSchedule =
      realTotalDays > 0 &&
      realStartDate != null &&
      !Number.isNaN(realStartDate.getTime()) &&
      realPrincipal > 0;

    const dummyTotalDays = 540;
    const dummyPrincipal = 1200000;
    const dummyElapsedDays = 210;

    const totalDays = hasRealSchedule ? realTotalDays : dummyTotalDays;
    const principalAmount = hasRealSchedule ? realPrincipal : dummyPrincipal;
    const elapsedDays = hasRealSchedule
      ? Math.max(0, Math.floor((now.getTime() - (realStartDate as Date).getTime()) / (1000 * 60 * 60 * 24)))
      : dummyElapsedDays;

    const completionRatio = Math.max(0, Math.min(1, elapsedDays / totalDays));
    const completionPercent = completionRatio * 100;
    const amortizedAmount = principalAmount * completionRatio;
    const remainingAmount = Math.max(0, principalAmount - amortizedAmount);

    return {
      completionPercent,
      amortizedAmount,
      remainingAmount,
      principalAmount,
      isDummy: !hasRealSchedule,
    };
  }, [data?.amortization?.totalDays, data?.registeredAt, data?.investment?.debt, data?.capex?.amount]);

  const collectionRevenueData = useMemo(() => {
    const startDate = data?.collectionWindowFrom ? new Date(data.collectionWindowFrom) : null;
    const endDate = data?.collectionWindowTo ? new Date(data.collectionWindowTo) : null;
    const fallbackStart = new Date();
    fallbackStart.setDate(fallbackStart.getDate() - 10);
    fallbackStart.setHours(0, 0, 0, 0);

    const resolvedStart = startDate && !Number.isNaN(startDate.getTime()) ? startDate : fallbackStart;
    const resolvedEnd = endDate && !Number.isNaN(endDate.getTime()) ? endDate : new Date();

    const totalDays = Math.max(
      1,
      Math.round((resolvedEnd.getTime() - resolvedStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const pointCount = 6;
    const pricePerTonne = 5200;
    const baseCollection = Math.max(18, Math.round((metrics.opex || 0) / 600));

    return Array.from({ length: pointCount }, (_, index) => {
      const dayOffset = Math.round((totalDays / Math.max(1, pointCount - 1)) * index);
      const date = new Date(resolvedStart);
      date.setDate(resolvedStart.getDate() + dayOffset);

      const zigZagPattern = [11.5, -7.5, 16.0, -10.5, 18.0, -12.0];
      const zigZagOffset = zigZagPattern[index % zigZagPattern.length];
      const collectionTonnage = Number((baseCollection + index * 1.4 + zigZagOffset).toFixed(1));
      const revenue = Number((collectionTonnage * pricePerTonne).toFixed(0));

      return {
        date: date.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
        collectionDone: collectionTonnage,
        revenueGenerated: revenue,
      };
    });
  }, [data?.collectionWindowFrom, data?.collectionWindowTo, metrics.opex]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-sm">
            <img
              src={companyLogo}
              alt="Company logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Financials</h1>
        </div>
        
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Investment required"
          value={`₹ ${metrics.investment.toLocaleString()}`}
          hint="CAPEX + monthly OPEX"
          icon={Wallet}
        />
        <MetricCard
          label="CAPEX"
          value={`₹ ${metrics.capex.toLocaleString()}`}
          hint="Capital equipment spend"
          icon={Layers3}
        />
        <MetricCard
          label="Monthly OPEX"
          value={`₹ ${metrics.opex.toLocaleString()}`}
          hint="Recurring operating cost"
          icon={PiggyBank}
        />
        <MetricCard
          label="Debt rate"
          value={`${metrics.debtInterestRate.toFixed(2)}%`}
          hint="Annual interest on borrowed capital"
          icon={Banknote}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Comparative OPEX (Monthly)</div>
          <div className="mt-1 text-xs text-slate-500">Threshold vs actual OPEX for the current month.</div>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeOpexData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹ ${Number(value).toLocaleString()}`}
                />
                <Tooltip formatter={(value: number) => `₹ ${Number(value).toLocaleString()}`} />
                <Bar dataKey="threshold" fill="#94a3b8" name="Monthly OPEX Threshold" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" fill="#10b981" name="Actual OPEX" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">OPEX Expenditure Split</div>
          <div className="mt-1 text-xs text-slate-500">Manpower, fuel, maintenance, vehicle, and miscellaneous.</div>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opexPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={84}
                  innerRadius={44}
                  paddingAngle={2}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {opexPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹ ${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
            {opexPieData.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span>{slice.name}</span>
                </div>
                <span className="font-medium text-slate-700">
                  ₹ {Number(slice.value).toLocaleString()} ({totalPieOpex > 0 ? ((Number(slice.value) / totalPieOpex) * 100).toFixed(1) : "0.0"}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Amortization Completion</div>
          <div className="mt-1 text-xs text-slate-500">How much amortization has been completed successfully.</div>
          <div className="mt-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl font-bold leading-none text-emerald-600">
                {amortizationWidget.completionPercent.toFixed(1)}%
              </div>
              <div className="mt-3 text-sm text-slate-600">Completed</div>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">Actual value</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-700">
              ₹ {amortizationWidget.amortizedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs text-emerald-700">
              Remaining: ₹ {amortizationWidget.remainingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            {amortizationWidget.isDummy && (
              <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Dummy data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Collection and Revenue</div>
              <div className="mt-1 text-xs text-slate-500">
                Dummy trend series based on the onboarding collection window dates.
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-right text-xs text-slate-600">
              <div className="font-medium text-slate-900">Date range</div>
              <div>
                {data?.collectionWindowFrom && data?.collectionWindowTo
                  ? `${data.collectionWindowFrom} to ${data.collectionWindowTo}`
                  : "Dummy window"}
              </div>
            </div>
          </div>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={collectionRevenueData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Number(value).toLocaleString()} t`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹ ${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "Revenue generated"
                      ? [`₹ ${Number(value).toLocaleString()}`, name]
                      : [`${Number(value).toLocaleString()} t`, name]
                  }
                />
                <Line
                  yAxisId="left"
                  type="stepAfter"
                  dataKey="collectionDone"
                  name="Collection done"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="stepAfter"
                  dataKey="revenueGenerated"
                  name="Revenue generated"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563eb" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Collection Summary</div>
          <div className="mt-1 text-xs text-slate-500">Total dummy collection and revenue across the visible points.</div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Total collection</span>
              <span className="font-semibold text-slate-900">
                {collectionRevenueData.reduce((sum, row) => sum + row.collectionDone, 0).toFixed(1)} t
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Total revenue</span>
              <span className="font-semibold text-slate-900">
                ₹ {collectionRevenueData.reduce((sum, row) => sum + row.revenueGenerated, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Data points</span>
              <span className="font-semibold text-slate-900">{collectionRevenueData.length}</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
            Dummy series is auto-generated from the onboarding collection period, so dates stay aligned with the selected window.
          </div>
        </div>
      </div>
    </section>
  );
}
