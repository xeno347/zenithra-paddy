import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { STORAGE_KEYS } from "../../lib/config/storageKeys";
import { readJson, writeJson } from "../../lib/storage/jsonStorage";

type OnboardingPageProps = {
  onCompleteOnboarding: (data: any) => { loginId: string; password: string };
};

export default function OnboardingPage({ onCompleteOnboarding }: OnboardingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    projectName: "",
    organizationName: "",
    unitName: "",
    address: "",
    gst: "",
    pan: "",
    adminName: "",
    adminContact: "",
    collectionGoalPerCycle: "",
    collectionWindowFrom: "",
    collectionWindowTo: "",
    collectionDetails: "",
    capexAmount: "",
    capexBreakdown: "",
    opexLabor: "",
    opexFuel: "",
    opexMaintenance: "",
    opexLoading: "",
    opexMisc: "",
    investmentAmount: "",
    investmentSource: "",
    amortizationPeriod: "",
  });

  const projectIdFromState = (location.state as any)?.projectId as string | undefined;

  useEffect(() => {
    if (!projectIdFromState) return;

    const saved = readJson(STORAGE_KEYS.PROJECTS, []);
    if (!Array.isArray(saved)) return;

    const project = saved.find((entry: any) => entry?.id === projectIdFromState);
    if (!project?.company) return;

    setForm((prev) => ({
      ...prev,
      projectName: project.company?.projectName || project.projectName || "",
      organizationName: project.company?.organizationName || "",
      unitName: project.company?.unitName || "",
      address: project.company?.address || "",
      gst: project.company?.gst || "",
      pan: project.company?.pan || "",
      adminName: project.company?.adminName || "",
      adminContact: project.company?.adminContact || "",
    }));
  }, [projectIdFromState]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const dayCount30_360 = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
    if (to.getTime() < from.getTime()) return 0;

    const y1 = from.getUTCFullYear();
    const m1 = from.getUTCMonth() + 1;
    let d1 = from.getUTCDate();
    const y2 = to.getUTCFullYear();
    const m2 = to.getUTCMonth() + 1;
    let d2 = to.getUTCDate();

    // 30/360 convention: cap days at 30
    if (d1 === 31) d1 = 30;
    if (d2 === 31) d2 = 30;

    return (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1);
  };

  const validateStep = () => {
    if (step === 1) {
      return (
        form.projectName.trim() &&
        form.organizationName.trim() &&
        form.unitName.trim() &&
        form.address.trim() &&
        form.gst.trim() &&
        form.pan.trim() &&
        form.adminName.trim() &&
        form.adminContact.trim()
      );
    }
    if (step === 2) {
      const windowDays = dayCount30_360(form.collectionWindowFrom, form.collectionWindowTo);
      return (
        form.collectionGoalPerCycle.trim() &&
        (parseFloat(form.collectionGoalPerCycle) || 0) > 0 &&
        form.collectionWindowFrom.trim() &&
        form.collectionWindowTo.trim() &&
        windowDays > 0 &&
        form.collectionDetails.trim()
      );
    }
    if (step === 3) {
      return form.capexAmount.trim() && form.capexBreakdown.trim();
    }
    if (step === 4) {
      return (
        form.opexLabor.trim() &&
        form.opexFuel.trim() &&
        form.opexMaintenance.trim() &&
        form.opexLoading.trim()
      );
    }
    if (step === 5) {
      return form.investmentAmount.trim() && form.investmentSource.trim();
    }
    if (step === 6) {
      return form.amortizationPeriod.trim() && (parseInt(form.amortizationPeriod, 10) || 0) > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep() && step < 6) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (!validateStep()) return;

    const collectionGoalPerCycle = parseFloat(form.collectionGoalPerCycle) || 0;
    const collectionWindowDays = dayCount30_360(form.collectionWindowFrom, form.collectionWindowTo);
    const perDayCollectionGoal =
      collectionWindowDays > 0 ? collectionGoalPerCycle / collectionWindowDays : 0;

    const payload = {
      projectName: form.projectName.trim(),
      operatorName: form.organizationName.trim(),
      siteName: form.unitName.trim(),
      organizationName: form.organizationName.trim(),
      unitName: form.unitName.trim(),
      address: form.address.trim(),
      gst: form.gst.trim(),
      pan: form.pan.trim(),
      adminName: form.adminName.trim(),
      adminContact: form.adminContact.trim(),
      role: "owner",
      targetTonnage: perDayCollectionGoal,
      collectionGoalPerCycle,
      collectionWindowDays,
      collectionWindowFrom: form.collectionWindowFrom,
      collectionWindowTo: form.collectionWindowTo,
      collectionDetails: form.collectionDetails.trim(),
      capex: {
        amount: parseFloat(form.capexAmount) || 0,
        breakdown: form.capexBreakdown.trim(),
      },
      opex: {
        labor: parseFloat(form.opexLabor) || 0,
        fuel: parseFloat(form.opexFuel) || 0,
        maintenance: parseFloat(form.opexMaintenance) || 0,
        loading: parseFloat(form.opexLoading) || 0,
        misc: parseFloat(form.opexMisc) || 0,
      },
      investment: {
        amount: parseFloat(form.investmentAmount) || 0,
        source: form.investmentSource.trim(),
      },
      amortization: {
        period: parseInt(form.amortizationPeriod) || 0,
      },
      equipment: [],
    };

    const credentials = onCompleteOnboarding(payload);

    if (projectIdFromState) {
      const saved = readJson(STORAGE_KEYS.PROJECTS, []);
      if (Array.isArray(saved)) {
        const nextProjects = saved.map((project: any) => {
          if (project?.id !== projectIdFromState) return project;
          return {
            ...project,
            projectName: payload.projectName,
            company: payload,
            credentials,
          };
        });
        writeJson(STORAGE_KEYS.PROJECTS, nextProjects);
      }
    }

    navigate("/dashboard", { replace: true });
  };

  const progressPercentage = (step / 6) * 100;

  const collectionGoalPerCycleNumber = parseFloat(form.collectionGoalPerCycle) || 0;
  const collectionWindowDaysNumber = dayCount30_360(form.collectionWindowFrom, form.collectionWindowTo);
  const perDayCollectionGoal =
    collectionWindowDaysNumber > 0
      ? collectionGoalPerCycleNumber / collectionWindowDaysNumber
      : 0;

  const capexAmountNumber = parseFloat(form.capexAmount) || 0;
  const amortizationYears = parseInt(form.amortizationPeriod, 10) || 0;
  const amortizationPerYear = amortizationYears > 0 ? capexAmountNumber / amortizationYears : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/create-project", { replace: true })}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Setup Your Project</h1>
          <p className="text-slate-600 text-sm">Complete all sections to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-3">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition ${
                  s <= step ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Step {step} of 6
          </p>
        </div>

        {/* Step 1 : Basic details */}
        {step === 1 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Basic details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Project Name</div>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={(e) => handleChange("projectName", e.target.value)}
                  placeholder="e.g., AAI Paddy Mill"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Organization Name</div>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => handleChange("organizationName", e.target.value)}
                  placeholder="e.g., AAI Pvt Ltd"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Unit Name</div>
                <input
                  type="text"
                  value={form.unitName}
                  onChange={(e) => handleChange("unitName", e.target.value)}
                  placeholder="e.g., Main Unit"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Address</div>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="e.g., Mumbai, Maharashtra"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">GST Number</div>
                <input
                  type="text"
                  value={form.gst}
                  onChange={(e) => handleChange("gst", e.target.value)}
                  placeholder="e.g., 27AAAAA0000A1Z5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">PAN Number</div>
                <input
                  type="text"
                  value={form.pan}
                  onChange={(e) => handleChange("pan", e.target.value)}
                  placeholder="e.g., AAAAA0000A"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Admin Name</div>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={(e) => handleChange("adminName", e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Admin Contact</div>
                <input
                  type="tel"
                  value={form.adminContact}
                  onChange={(e) => handleChange("adminContact", e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Collection Target</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">
                  Collection goal per cycle (tonnes)
                </div>
                <input
                  type="number"
                  min={0}
                  value={form.collectionGoalPerCycle}
                  onChange={(e) => handleChange("collectionGoalPerCycle", e.target.value)}
                  placeholder="e.g., 600"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
                <div className="mt-1 text-xs text-slate-500">Total target for the full cycle.</div>
              </label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Per day goal (tonnes/day)</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {collectionWindowDaysNumber > 0 ? perDayCollectionGoal.toFixed(2) : "—"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Formula: collection goal / days in the collection window
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Collection window (from)</div>
                <input
                  type="date"
                  value={form.collectionWindowFrom}
                  onChange={(e) => handleChange("collectionWindowFrom", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>

              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Collection window (to)</div>
                <input
                  type="date"
                  value={form.collectionWindowTo}
                  onChange={(e) => handleChange("collectionWindowTo", e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Collection summary</div>
                <div className="text-xs text-slate-500">
                  Window days use the 30/360 convention (e.g., 30 Mar to 30 May = 60 days).
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">Window days</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {collectionWindowDaysNumber > 0 ? collectionWindowDaysNumber : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Goal per cycle</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {collectionGoalPerCycleNumber > 0 ? `${collectionGoalPerCycleNumber.toFixed(0)} t` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Per day goal</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {collectionWindowDaysNumber > 0 ? `${perDayCollectionGoal.toFixed(2)} t/day` : "—"}
                  </div>
                </div>
              </div>
            </div>
            <label>
              <div className="block text-sm font-medium text-slate-700 mb-2">Collection Details</div>
              <textarea
                value={form.collectionDetails}
                onChange={(e) => handleChange("collectionDetails", e.target.value)}
                placeholder="Describe your collection process, locations, and methods..."
                rows={4}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </label>
          </div>
        )}

        {/* Step 3 : Project Capex Calculation */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Project Capex Calculation</h2>
            </div>
            <label>
              <div className="block text-sm font-medium text-slate-700 mb-2">Total Capex Amount (₹)</div>
              <input
                type="number"
                value={form.capexAmount}
                onChange={(e) => handleChange("capexAmount", e.target.value)}
                placeholder="e.g., 500000"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </label>
            <label>
              <div className="block text-sm font-medium text-slate-700 mb-2">Capex Breakdown</div>
              <textarea
                value={form.capexBreakdown}
                onChange={(e) => handleChange("capexBreakdown", e.target.value)}
                placeholder="e.g., Machinery: 300000, Infrastructure: 150000, Installation: 50000..."
                rows={4}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </label>
          </div>
        )}

        {/* Step 4 : Project Opex Calculation */}
        {step === 4 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Project Opex Calculation</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Labor (₹/month)</div>
                <input
                  type="number"
                  value={form.opexLabor}
                  onChange={(e) => handleChange("opexLabor", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Fuel (₹/month)</div>
                <input
                  type="number"
                  value={form.opexFuel}
                  onChange={(e) => handleChange("opexFuel", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Maintenance (₹/month)</div>
                <input
                  type="number"
                  value={form.opexMaintenance}
                  onChange={(e) => handleChange("opexMaintenance", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Loading (₹/month)</div>
                <input
                  type="number"
                  value={form.opexLoading}
                  onChange={(e) => handleChange("opexLoading", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>
            <label>
              <div className="block text-sm font-medium text-slate-700 mb-2">Miscellaneous (₹/month)</div>
              <input
                type="number"
                value={form.opexMisc}
                onChange={(e) => handleChange("opexMisc", e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </label>
          </div>
        )}

        {/* Step 5 : Investment */}
        {step === 5 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Investment</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Investment Amount (₹)</div>
                <input
                  type="number"
                  value={form.investmentAmount}
                  onChange={(e) => handleChange("investmentAmount", e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Investment Source</div>
                <input
                  type="text"
                  value={form.investmentSource}
                  onChange={(e) => handleChange("investmentSource", e.target.value)}
                  placeholder="e.g., Self / Bank / Investor"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 6 : Ammotization chart */}
        {step === 6 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Ammotization chart</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Period (years)</div>
                <input
                  type="number"
                  min={1}
                  value={form.amortizationPeriod}
                  onChange={(e) => handleChange("amortizationPeriod", e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Capex used for chart</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">₹ {capexAmountNumber.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-4 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                <div>Year</div>
                <div className="text-right">Opening</div>
                <div className="text-right">Ammotization</div>
                <div className="text-right">Closing</div>
              </div>

              {amortizationYears > 0 ? (
                Array.from({ length: amortizationYears }, (_, index) => {
                  const year = index + 1;
                  const opening = capexAmountNumber - amortizationPerYear * index;
                  const closing = Math.max(0, capexAmountNumber - amortizationPerYear * year);

                  return (
                    <div
                      key={year}
                      className="grid grid-cols-4 px-4 py-2 text-sm text-slate-700 border-t border-slate-200"
                    >
                      <div className="font-medium text-slate-900">{year}</div>
                      <div className="text-right">₹ {opening.toFixed(0)}</div>
                      <div className="text-right">₹ {amortizationPerYear.toFixed(0)}</div>
                      <div className="text-right">₹ {closing.toFixed(0)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">
                  Enter a period to preview the chart.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition"
            >
              Previous
            </button>
          )}
          {step < 6 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!validateStep()}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Complete Setup
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-8">
          You can always update these details later in the settings
        </p>
      </div>
    </div>
  );
}
