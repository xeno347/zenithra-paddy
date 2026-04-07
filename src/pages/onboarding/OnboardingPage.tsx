import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Download, X } from "lucide-react";
import { STORAGE_KEYS } from "../../lib/config/storageKeys";
import { readJson, writeJson } from "../../lib/storage/jsonStorage";

type OnboardingPageProps = {
  onCompleteOnboarding: (data: any) => { loginId: string; password: string };
};

export default function OnboardingPage({ onCompleteOnboarding }: OnboardingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [showDPRModal, setShowDPRModal] = useState(false);
  const [dprPayload, setDprPayload] = useState<any>(null);

  type CapexRow = {
    id: string;
    lineItem: string;
    isCustom: boolean;
    make: string;
    lease: boolean;
    capacityPerDay: string;
    capacityPerDayUoM: string;
    quantity: string;
    perUnitCost: string;
  };

  type OpexRow = {
    id: string;
    lineItem: string;
    isCustom: boolean;
    make: string;
    capacityPerDayUoM: string;
    capacityPerDay: string;
    quantity: string;
    perUnitCost: string;
  };

  const [capexRows, setCapexRows] = useState<CapexRow[]>([
    {
      id: "capex-slasher",
      lineItem: "Slasher",
      isCustom: false,
      make: "",
      lease: false,
      capacityPerDay: "",
      capacityPerDayUoM: "Acres/day",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "capex-racker",
      lineItem: "Racker",
      isCustom: false,
      make: "",
      lease: false,
      capacityPerDay: "",
      capacityPerDayUoM: "Acres/day",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "capex-bailer",
      lineItem: "Bailer",
      isCustom: false,
      make: "",
      lease: false,
      capacityPerDay: "",
      capacityPerDayUoM: "Tonnes per day",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "capex-loader",
      lineItem: "Loader",
      isCustom: false,
      make: "",
      lease: false,
      capacityPerDay: "",
      capacityPerDayUoM: "Tonnes per day",
      quantity: "",
      perUnitCost: "",
    },
  ]);

  const [opexRows, setOpexRows] = useState<OpexRow[]>([
    {
      id: "opex-diesel",
      lineItem: "Diesel",
      isCustom: false,
      make: "",
      capacityPerDayUoM: "Tonnes per day",
      capacityPerDay: "",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "opex-labour",
      lineItem: "Labour",
      isCustom: false,
      make: "",
      capacityPerDayUoM: "Tonnes per day",
      capacityPerDay: "",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "opex-lease-amount",
      lineItem: "Lease amount",
      isCustom: false,
      make: "",
      capacityPerDayUoM: "Tonnes per day",
      capacityPerDay: "",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "opex-maintenance",
      lineItem: "Maintenance",
      isCustom: false,
      make: "",
      capacityPerDayUoM: "Tonnes per day",
      capacityPerDay: "",
      quantity: "",
      perUnitCost: "",
    },
    {
      id: "opex-miscellaneous",
      lineItem: "Miscellaneous",
      isCustom: false,
      make: "",
      capacityPerDayUoM: "Tonnes per day",
      capacityPerDay: "",
      quantity: "",
      perUnitCost: "",
    },
  ]);
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
    averageOutputPerAcres: "",
    collectionWindowFrom: "",
    collectionWindowTo: "",
    opexLabor: "",
    opexFuel: "",
    opexMaintenance: "",
    opexLoading: "",
    opexMisc: "",
    totalInvestment: "",
    equityFunding: "",
    debtFunding: "",
    debtInterestRate: "",
    amortizationYears: "",
    amortizationMonths: "",
    amortizationDays: "",
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

  const capexItems = capexRows.map((row) => {
    const quantity = parseFloat(row.quantity) || 0;
    const perUnitCost = parseFloat(row.perUnitCost) || 0;
    const amount = quantity * perUnitCost;
    return {
      ...row,
      quantity,
      perUnitCost,
      capacityPerDay: parseFloat(row.capacityPerDay) || 0,
      amount,
    };
  });

  const capexTotal = capexItems.reduce((sum, row) => sum + (row.amount || 0), 0);

  const opexItems = opexRows.map((row) => {
    const quantity = parseFloat(row.quantity) || 0;
    const perUnitCost = parseFloat(row.perUnitCost) || 0;
    const amount = quantity * perUnitCost;
    return {
      ...row,
      quantity,
      perUnitCost,
      capacityPerDay: parseFloat(row.capacityPerDay) || 0,
      amount,
    };
  });

  const opexTotal = opexItems.reduce((sum, row) => sum + (row.amount || 0), 0);

  const updateCapexRow = (id: string, patch: Partial<CapexRow>) => {
    setCapexRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updateOpexRow = (id: string, patch: Partial<OpexRow>) => {
    setOpexRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addCapexRow = () => {
    setCapexRows((prev) => [
      ...prev,
      {
        id: `capex-custom-${Date.now()}`,
        lineItem: "",
        isCustom: true,
        make: "",
        lease: false,
        capacityPerDay: "",
        capacityPerDayUoM: "Acres/day",
        quantity: "",
        perUnitCost: "",
      },
    ]);
  };

  const addOpexRow = () => {
    setOpexRows((prev) => [
      ...prev,
      {
        id: `opex-custom-${Date.now()}`,
        lineItem: "",
        isCustom: true,
        make: "",
        capacityPerDayUoM: "Tonnes per day",
        capacityPerDay: "",
        quantity: "",
        perUnitCost: "",
      },
    ]);
  };

  const validateStep = () => {
    const totalInvestmentNumber = parseFloat(form.totalInvestment) || 0;
    const equityFundingNumber = parseFloat(form.equityFunding) || 0;
    const debtFundingNumber = parseFloat(form.debtFunding) || 0;
    const debtInterestRateNumber = parseFloat(form.debtInterestRate) || 0;
    const amortizationYearsNumber = parseInt(form.amortizationYears, 10) || 0;
    const amortizationMonthsNumber = parseInt(form.amortizationMonths, 10) || 0;
    const amortizationDaysNumber = parseInt(form.amortizationDays, 10) || 0;

    const splitMatchesTotal =
      Math.abs(totalInvestmentNumber - (equityFundingNumber + debtFundingNumber)) < 0.01;

    const hasValidAmortizationPeriod =
      amortizationYearsNumber * 360 + amortizationMonthsNumber * 30 + amortizationDaysNumber > 0;

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
        windowDays > 0
      );
    }
    if (step === 3) {
      return capexTotal > 0;
    }
    if (step === 4) {
      return opexTotal > 0;
    }
    if (step === 5) {
      return (
        investmentRequiredAmount > 0 &&
        equityFundingNumber >= 0 &&
        debtFundingNumber >= 0 &&
        Math.abs(investmentRequiredAmount - (equityFundingNumber + debtFundingNumber)) < 0.01 &&
        (debtFundingNumber === 0 || debtInterestRateNumber > 0) &&
        hasValidAmortizationPeriod
      );
    }
    if (step === 6) {
      return hasValidAmortizationPeriod;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 6) {
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

    const opexAmountFor = (label: string) => {
      const match = opexItems.find((row) => row.lineItem.trim().toLowerCase() === label.trim().toLowerCase());
      return match?.amount || 0;
    };

    const opexCustomAmount = opexItems
      .filter((row) => row.isCustom)
      .reduce((sum, row) => sum + (row.amount || 0), 0);

    const totalInvestment = investmentRequiredAmount;
    const equityFunding = parseFloat(form.equityFunding) || 0;
    const debtFunding = parseFloat(form.debtFunding) || 0;
    const debtInterestRate = parseFloat(form.debtInterestRate) || 0;
    const amortizationYearsNumber = parseInt(form.amortizationYears, 10) || 0;
    const amortizationMonthsNumber = parseInt(form.amortizationMonths, 10) || 0;
    const amortizationDaysNumber = parseInt(form.amortizationDays, 10) || 0;
    const amortizationTotalDays =
      amortizationYearsNumber * 360 + amortizationMonthsNumber * 30 + amortizationDaysNumber;

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
      capex: {
        amount: capexTotal,
        items: capexItems.map((row) => ({
          lineItem: row.lineItem,
          make: row.make.trim(),
          lease: row.lease,
          capacityPerDay: row.capacityPerDay,
          quantity: row.quantity,
          perUnitCost: row.perUnitCost,
          amount: row.amount,
        })),
      },
      opex: {
        labor: opexAmountFor("Labour"),
        fuel: opexAmountFor("Diesel"),
        maintenance: opexAmountFor("Maintenance"),
        loading: opexAmountFor("Lease amount"),
        misc: opexAmountFor("Miscellaneous") + opexCustomAmount,
      },
      investment: {
        amount: totalInvestment,
        source: "equity_debt_mix",
        equity: equityFunding,
        debt: debtFunding,
        debtInterestRate,
      },
      amortization: {
        period: amortizationYearsNumber,
        years: amortizationYearsNumber,
        months: amortizationMonthsNumber,
        days: amortizationDaysNumber,
        totalDays: amortizationTotalDays,
      },
      equipment: [],
    };

    const credentials = onCompleteOnboarding(payload);
    const onboardingSnapshot = { ...payload, credentials };
    writeJson(STORAGE_KEYS.ONBOARDING_SNAPSHOT, onboardingSnapshot);

    setDprPayload(onboardingSnapshot);
    setShowDPRModal(true);
  };

  const handleStartOperations = () => {
    if (!dprPayload || !projectIdFromState) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const saved = readJson(STORAGE_KEYS.PROJECTS, []);
    if (Array.isArray(saved)) {
      const nextProjects = saved.map((project: any) => {
        if (project?.id !== projectIdFromState) return project;
        return {
          ...project,
          projectName: dprPayload.projectName,
          company: dprPayload,
          credentials: dprPayload.credentials,
        };
      });
      writeJson(STORAGE_KEYS.PROJECTS, nextProjects);
    }

    setShowDPRModal(false);
    navigate("/dashboard", { replace: true });
  };

  const downloadDPR = () => {
    if (!dprPayload) return;

    const dprContent = generateDPRContent(dprPayload);
    const element = document.createElement("a");
    const file = new Blob([dprContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `DPR-${dprPayload.projectName.replace(/\s+/g, "_")}-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateDPRContent = (data: any) => {
    return `
═══════════════════════════════════════════════════════════════════════════════
                      DETAILED PROJECT REPORT (DPR)
═══════════════════════════════════════════════════════════════════════════════

Generated Date: ${new Date().toLocaleString()}

─────────────────────────────────────────────────────────────────────────────
1. PROJECT INFORMATION
─────────────────────────────────────────────────────────────────────────────
Project Name:          ${data.projectName}
Operator Name:         ${data.operatorName}
Site Name:             ${data.siteName}
Organization Name:     ${data.organizationName}
Unit Name:             ${data.unitName}
Address:               ${data.address}
GST Number:            ${data.gst}
PAN Number:            ${data.pan}
Role:                  ${data.role}

─────────────────────────────────────────────────────────────────────────────
2. COLLECTION TARGET
─────────────────────────────────────────────────────────────────────────────
Collection Goal Per Cycle:     ${data.collectionGoalPerCycle} tonnes
Per Day Collection Goal:       ${data.targetTonnage.toFixed(2)} tonnes/day
Collection Window:             ${data.collectionWindowFrom} to ${data.collectionWindowTo}
Collection Window Days:        ${data.collectionWindowDays} days

─────────────────────────────────────────────────────────────────────────────
3. CAPEX (CAPITAL EXPENDITURE)
─────────────────────────────────────────────────────────────────────────────
Total CAPEX Amount: ₹ ${data.capex.amount.toLocaleString()}

Equipment Details:
${data.capex.items.map((item: any) => `
  Line Item: ${item.lineItem}
  Make/Vendor: ${item.make}
  Lease: ${item.lease ? "Yes" : "No"}
  Capacity/Day: ${item.capacityPerDay}
  Quantity: ${item.quantity}
  Per Unit Cost: ₹ ${item.perUnitCost.toLocaleString()}
  Amount: ₹ ${item.amount.toLocaleString()}
`).join("\n")}

─────────────────────────────────────────────────────────────────────────────
4. OPEX (OPERATIONAL EXPENDITURE) - MONTHLY
─────────────────────────────────────────────────────────────────────────────
Labour:         ₹ ${data.opex.labor.toLocaleString()}
Diesel/Fuel:    ₹ ${data.opex.fuel.toLocaleString()}
Lease Amount:   ₹ ${data.opex.loading.toLocaleString()}
Maintenance:    ₹ ${data.opex.maintenance.toLocaleString()}
Miscellaneous:  ₹ ${data.opex.misc.toLocaleString()}
─────────────────────────────────────────────────────────────────────────────
Total Monthly OPEX: ₹ ${(data.opex.labor + data.opex.fuel + data.opex.loading + data.opex.maintenance + data.opex.misc).toLocaleString()}

─────────────────────────────────────────────────────────────────────────────
5. INVESTMENT & FUNDING
─────────────────────────────────────────────────────────────────────────────
Total Investment:      ₹ ${data.investment.amount.toLocaleString()}
Equity Funding:        ₹ ${data.investment.equity.toLocaleString()}
Debt Funding:          ₹ ${data.investment.debt.toLocaleString()}
Debt Interest Rate:    ${data.investment.debtInterestRate}% per annum

─────────────────────────────────────────────────────────────────────────────
6. AMORTIZATION SCHEDULE
─────────────────────────────────────────────────────────────────────────────
Amortization Period:   ${data.amortization.years} years, ${data.amortization.months} months, ${data.amortization.days} days
Total Days:            ${data.amortization.totalDays} days

─────────────────────────────────────────────────────────────────────────────
7. CONTACT INFORMATION
─────────────────────────────────────────────────────────────────────────────
Admin Name:            ${data.adminName}
Admin Contact:         ${data.adminContact}

═══════════════════════════════════════════════════════════════════════════════
                            END OF REPORT
═══════════════════════════════════════════════════════════════════════════════
`;
  };

  const progressPercentage = (step / 6) * 100;

  const collectionGoalPerCycleNumber = parseFloat(form.collectionGoalPerCycle) || 0;
  const collectionWindowDaysNumber = dayCount30_360(form.collectionWindowFrom, form.collectionWindowTo);
  const perDayCollectionGoal =
    collectionWindowDaysNumber > 0
      ? collectionGoalPerCycleNumber / collectionWindowDaysNumber
      : 0;

  const capexAmountNumber = capexTotal;
  const amortizationYearsInput = parseInt(form.amortizationYears, 10) || 0;
  const amortizationMonthsInput = parseInt(form.amortizationMonths, 10) || 0;
  const amortizationDaysInput = parseInt(form.amortizationDays, 10) || 0;
  const amortizationTotalDays =
    amortizationYearsInput * 360 + amortizationMonthsInput * 30 + amortizationDaysInput;
  const amortizationYears = Math.ceil(amortizationTotalDays / 360);
  const amortizationPerYear = amortizationYears > 0 ? capexAmountNumber / amortizationYears : 0;

  const amortizationTotalMonths = Math.ceil(amortizationTotalDays / 30);
  const investmentRequiredAmount = capexTotal + opexTotal;
  const equityFundingNumber = parseFloat(form.equityFunding) || 0;
  const debtFundingNumber = parseFloat(form.debtFunding) || 0;
  const debtInterestRateNumber = parseFloat(form.debtInterestRate) || 0;
  const investmentSplitDifference =
    investmentRequiredAmount - (equityFundingNumber + debtFundingNumber);

  const generateAmortizationSchedule = () => {
    if (amortizationYearsInput === 0 && amortizationTotalMonths > 0) {
      // Monthly schedule
      const monthlyPrincipal = debtFundingNumber > 0 ? debtFundingNumber / amortizationTotalMonths : 0;
      const monthlyOpex = opexTotal > 0 ? opexTotal : 0;
      const monthlyInterestRate = debtInterestRateNumber / 100 / 12;

      return Array.from({ length: amortizationTotalMonths }, (_, index) => {
        const month = index + 1;
        const openingDebt = debtFundingNumber - monthlyPrincipal * index;
        const interestCharges = Math.max(0, openingDebt * monthlyInterestRate);
        const closingDebt = Math.max(0, openingDebt - monthlyPrincipal);

        return {
          period: `Month ${month}`,
          openingDebt,
          interest: interestCharges,
          principal: monthlyPrincipal,
          opex: monthlyOpex,
          totalPayment: monthlyPrincipal + interestCharges + monthlyOpex,
          closingDebt,
        };
      });
    } else if (amortizationYearsInput > 0) {
      // Yearly schedule
      const yearlyPrincipal = debtFundingNumber > 0 ? debtFundingNumber / amortizationYearsInput : 0;
      const yearlyOpex = opexTotal > 0 ? opexTotal * 12 : 0;
      const yearlyInterestRate = debtInterestRateNumber / 100;

      return Array.from({ length: amortizationYearsInput }, (_, index) => {
        const year = index + 1;
        const openingDebt = debtFundingNumber - yearlyPrincipal * index;
        const interestCharges = Math.max(0, openingDebt * yearlyInterestRate);
        const closingDebt = Math.max(0, openingDebt - yearlyPrincipal);

        return {
          period: `Year ${year}`,
          openingDebt,
          interest: interestCharges,
          principal: yearlyPrincipal,
          opex: yearlyOpex,
          totalPayment: yearlyPrincipal + interestCharges + yearlyOpex,
          closingDebt,
        };
      });
    }
    return [];
  };

  const amortizationSchedule = generateAmortizationSchedule();

  const contentWidthClass = step === 3 || step === 4 ? "max-w-6xl" : "max-w-2xl";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4 py-10">
      <div className={`w-full ${contentWidthClass}`}>
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

            {/* Section 1: Collection Inputs */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Collection Goals</div>
                <div className="text-xs text-slate-500">Enter your collection and yield targets.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
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

                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">Average output per acres (Tonnes)</div>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.averageOutputPerAcres}
                    onChange={(e) => handleChange("averageOutputPerAcres", e.target.value)}
                    placeholder="e.g., 2.5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <div className="mt-1 text-xs text-slate-500">Expected yield per acre in tonnes.</div>
                </label>
              </div>
            </div>

            {/* Section 2: Collection Window */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Collection Window</div>
                <div className="text-xs text-slate-500">Specify the period for collection activities.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">From date</div>
                  <input
                    type="date"
                    value={form.collectionWindowFrom}
                    onChange={(e) => handleChange("collectionWindowFrom", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                  />
                </label>

                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">To date</div>
                  <input
                    type="date"
                    value={form.collectionWindowTo}
                    onChange={(e) => handleChange("collectionWindowTo", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Calculated Values */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Calculated Metrics</div>
                <div className="text-xs text-slate-500">Automatically computed from your inputs.</div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">Land required</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 ? `${(parseFloat(form.collectionGoalPerCycle) / parseFloat(form.averageOutputPerAcres)).toFixed(2)} acres` : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                   
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">Per day goal</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {collectionWindowDaysNumber > 0 ? `${perDayCollectionGoal.toFixed(2)} tonnes/day` : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                   
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium text-slate-600">Avg collection area per day </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 && collectionWindowDaysNumber > 0 ? `${(perDayCollectionGoal / parseFloat(form.averageOutputPerAcres)).toFixed(2)} acres/day` : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                   
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Collection Summary */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
              <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-200">
                <div className="text-sm font-semibold text-emerald-900">Collection Summary</div>
                <div className="text-xs text-emerald-700">
                  Window days use the 30/360 convention (e.g., 30 Mar to 30 May = 60 days).
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-5">
                <div>
                  <div className="text-xs font-medium text-emerald-700">Window days</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionWindowDaysNumber > 0 ? collectionWindowDaysNumber : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Goal per cycle</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionGoalPerCycleNumber > 0 ? `${collectionGoalPerCycleNumber.toFixed(0)} t` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Per day goal</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionWindowDaysNumber > 0 ? `${perDayCollectionGoal.toFixed(2)} t/day` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Land required</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 ? `${(parseFloat(form.collectionGoalPerCycle) / parseFloat(form.averageOutputPerAcres)).toFixed(2)} ac` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Avg area per day</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 && collectionWindowDaysNumber > 0 ? `${(perDayCollectionGoal / parseFloat(form.averageOutputPerAcres)).toFixed(2)} ac/day` : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 : Project Capex Calculation */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Project Capex Calculation</h2>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
              <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-200">
                <div className="text-sm font-semibold text-emerald-900">Collection Summary</div>
                <div className="text-xs text-emerald-700">Reference metrics from Step 2 for CAPEX planning.</div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-5">
                <div>
                  <div className="text-xs font-medium text-emerald-700">Window days</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionWindowDaysNumber > 0 ? collectionWindowDaysNumber : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Goal per cycle</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionGoalPerCycleNumber > 0 ? `${collectionGoalPerCycleNumber.toFixed(0)} t` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Per day goal</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {collectionWindowDaysNumber > 0 ? `${perDayCollectionGoal.toFixed(2)} t/day` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Land required</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 ? `${(parseFloat(form.collectionGoalPerCycle) / parseFloat(form.averageOutputPerAcres)).toFixed(2)} ac` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-700">Avg area per day</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {parseFloat(form.averageOutputPerAcres) > 0 && collectionWindowDaysNumber > 0 ? `${(perDayCollectionGoal / parseFloat(form.averageOutputPerAcres)).toFixed(2)} ac/day` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Financial model & budgeting</div>
                <div className="text-xs text-slate-500">Enter quantity and per-unit cost to calculate amounts automatically.</div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-xs font-semibold text-slate-700 border-b border-slate-300">
                      <th className="w-32 px-3 py-2 text-left border-r border-slate-200">Line items</th>
                      <th className="w-40 px-3 py-2 text-left border-r border-slate-200">Make (company's name)</th>
                      <th className="w-28 px-3 py-2 text-left border-r border-slate-200">UoM</th>
                      <th className="w-28 px-3 py-2 text-right border-r border-slate-200">Capacity</th>
                      <th className="w-24 px-3 py-2 text-right border-r border-slate-200">Quantity</th>
                      <th className="w-28 px-3 py-2 text-right border-r border-slate-200">Per unit cost</th>
                      <th className="w-28 px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {capexItems.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 text-slate-700">
                        <td className="px-3 py-2 border-r border-slate-200">
                          {row.isCustom ? (
                            <input
                              type="text"
                              value={row.lineItem}
                              onChange={(e) => updateCapexRow(row.id, { lineItem: e.target.value })}
                              placeholder="New line item"
                              className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
                            />
                          ) : (
                            <div className="font-medium text-slate-900">{row.lineItem}</div>
                          )}
                        </td>

                        <td className="px-3 py-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={row.make}
                            onChange={(e) => updateCapexRow(row.id, { make: e.target.value })}
                            placeholder="e.g., John Deere"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 border-r border-slate-200">
                          {!row.isCustom ? (
                            <div className="text-sm text-slate-900 font-medium">
                              {row.lineItem === "Slasher" || row.lineItem === "Racker"
                                ? "Acres/day"
                                : row.lineItem === "Bailer" || row.lineItem === "Loader"
                                ? "Tonnes per day"
                                : row.capacityPerDayUoM}
                            </div>
                          ) : (
                            <select
                              value={row.capacityPerDayUoM}
                              onChange={(e) => updateCapexRow(row.id, { capacityPerDayUoM: e.target.value })}
                              className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500 text-sm"
                            >
                              <option value="Acres/day">Acres/day</option>
                              <option value="Tonnes per day">Tonnes/day</option>
                              <option value="Acres">Acres</option>
                              <option value="Tonnes">Tonnes</option>
                              <option value="Tonnes/acres">Tonnes/acres</option>
                              <option value="acres/tonne">Acres/tonne</option>
                              <option value="others">Others</option>
                            </select>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={row.capacityPerDay === 0 ? "" : row.capacityPerDay}
                            onChange={(e) => {
                              const capacityValue = e.target.value;
                              updateCapexRow(row.id, { capacityPerDay: capacityValue });
                              
                              // Auto-calculate quantity for predefined items.
                              if (!row.isCustom && capacityValue) {
                                const capacityNum = parseFloat(capacityValue);
                                if (capacityNum > 0 && collectionWindowDaysNumber > 0 && parseFloat(form.averageOutputPerAcres) > 0) {
                                  const isBailerOrLoader = row.lineItem === "Bailer" || row.lineItem === "Loader";
                                  const quickMathBase = isBailerOrLoader
                                    ? perDayCollectionGoal
                                    : perDayCollectionGoal / parseFloat(form.averageOutputPerAcres);
                                  const calculatedQuantity = String(Math.ceil(quickMathBase / capacityNum));
                                  updateCapexRow(row.id, { quantity: calculatedQuantity });
                                }
                              }
                            }}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            value={row.quantity === 0 ? "" : row.quantity}
                            onChange={(e) => updateCapexRow(row.id, { quantity: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            value={row.perUnitCost === 0 ? "" : row.perUnitCost}
                            onChange={(e) => updateCapexRow(row.id, { perUnitCost: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right font-medium text-slate-900">
                          ₹ {row.amount ? row.amount.toFixed(0) : "0"}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={6} className="px-3 py-3 text-right">Total</td>
                      <td className="px-3 py-3 text-right">₹ {capexTotal.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addCapexRow}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Add new row
              </button>
            </div>
          </div>
        )}

        {/* Step 4 : Project Opex Calculation */}
        {step === 4 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Project Opex Calculation</h2>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Monthly operating costs</div>
                <div className="text-xs text-slate-500">Enter quantity and per-unit cost to calculate amounts automatically.</div>
              </div>

              <div className="p-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-xs font-semibold text-slate-700 border-b border-slate-300">
                      <th className="w-32 px-3 py-2 text-left border-r border-slate-200">Line items</th>
                      <th className="w-44 px-3 py-2 text-left border-r border-slate-200">Make (company's name)</th>
                      <th className="w-28 px-3 py-2 text-left border-r border-slate-200">UoM</th>
                      <th className="w-40 px-3 py-2 text-right border-r border-slate-200">Capacity</th>
                      <th className="w-24 px-3 py-2 text-right border-r border-slate-200">Quantity</th>
                      <th className="w-28 px-3 py-2 text-right border-r border-slate-200">Per unit cost</th>
                      <th className="w-28 px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {opexItems.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 text-slate-700">
                        <td className="px-3 py-2 border-r border-slate-200">
                          {row.isCustom ? (
                            <input
                              type="text"
                              value={row.lineItem}
                              onChange={(e) => updateOpexRow(row.id, { lineItem: e.target.value })}
                              placeholder="New line item"
                              className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
                            />
                          ) : (
                            <div className="font-medium text-slate-900">{row.lineItem}</div>
                          )}
                        </td>

                        <td className="px-3 py-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={row.make}
                            onChange={(e) => updateOpexRow(row.id, { make: e.target.value })}
                            placeholder="e.g., Vendor name"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 border-r border-slate-200">
                          <select
                            value={row.capacityPerDayUoM}
                            onChange={(e) => updateOpexRow(row.id, { capacityPerDayUoM: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500 text-sm"
                          >
                            <option value="Acres/day">Acres/day</option>
                            <option value="Tonnes per day">Tonnes/day</option>
                            <option value="Acres">Acres</option>
                            <option value="Tonnes">Tonnes</option>
                            <option value="Tonnes/acres">Tonnes/acres</option>
                            <option value="acres/tonne">Acres/tonne</option>
                            <option value="others">Others</option>
                          </select>
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            value={row.capacityPerDay === 0 ? "" : row.capacityPerDay}
                            onChange={(e) => updateOpexRow(row.id, { capacityPerDay: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            value={row.quantity === 0 ? "" : row.quantity}
                            onChange={(e) => updateOpexRow(row.id, { quantity: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right border-r border-slate-200">
                          <input
                            type="number"
                            min={0}
                            value={row.perUnitCost === 0 ? "" : row.perUnitCost}
                            onChange={(e) => updateOpexRow(row.id, { perUnitCost: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-md border border-slate-300 px-2 py-1 text-right outline-none focus:border-emerald-500"
                          />
                        </td>

                        <td className="px-3 py-2 text-right font-medium text-slate-900">
                          ₹ {row.amount ? row.amount.toFixed(0) : "0"}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={6} className="px-3 py-3 text-right">Total</td>
                      <td className="px-3 py-3 text-right">₹ {opexTotal.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addOpexRow}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Add item
              </button>
            </div>
          </div>
        )}

        {/* Step 5 : Investment */}
        {step === 5 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Investment & funding split</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Investment Required (₹)</div>
                <input
                  type="number"
                  min={0}
                  value={investmentRequiredAmount.toFixed(0)}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none"
                />
                <div className="mt-1 text-xs text-slate-500">Auto-calculated from CAPEX + OPEX in Steps 3 and 4.</div>
              </label>

              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Equity funding (₹)</div>
                <input
                  type="number"
                  min={0}
                  value={form.equityFunding}
                  onChange={(e) => handleChange("equityFunding", e.target.value)}
                  placeholder="e.g., 400000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Debt funding (₹)</div>
                <input
                  type="number"
                  min={0}
                  value={form.debtFunding}
                  onChange={(e) => handleChange("debtFunding", e.target.value)}
                  placeholder="e.g., 600000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>

              <label>
                <div className="block text-sm font-medium text-slate-700 mb-2">Debt interest rate (% per year)</div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.debtInterestRate}
                  onChange={(e) => handleChange("debtInterestRate", e.target.value)}
                  placeholder="e.g., 10.5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-medium text-slate-600">Funding split check</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                Total entered split: ₹ {(equityFundingNumber + debtFundingNumber).toLocaleString()}
              </div>
              <div className={`mt-1 text-xs ${Math.abs(investmentSplitDifference) < 0.01 ? "text-emerald-700" : "text-rose-600"}`}>
                {Math.abs(investmentSplitDifference) < 0.01
                  ? "Equity + Debt matches Investment Required."
                  : `Difference: ₹ ${Math.abs(investmentSplitDifference).toLocaleString()}`}
              </div>
              {debtFundingNumber > 0 && debtInterestRateNumber <= 0 && (
                <div className="mt-1 text-xs text-rose-600">Enter debt interest rate when debt funding is provided.</div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Period of Ammotization</h3>
                <p className="text-xs text-slate-500 mt-1">Enter amortization period in years, months, and days (e.g., 2 years, 0 months, 0 days).</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">Years</div>
                  <input
                    type="number"
                    min={0}
                    value={form.amortizationYears}
                    onChange={(e) => handleChange("amortizationYears", e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </label>
                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">Months</div>
                  <input
                    type="number"
                    min={0}
                    value={form.amortizationMonths}
                    onChange={(e) => handleChange("amortizationMonths", e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </label>
                <label>
                  <div className="block text-sm font-medium text-slate-700 mb-2">Days</div>
                  <input
                    type="number"
                    min={0}
                    value={form.amortizationDays}
                    onChange={(e) => handleChange("amortizationDays", e.target.value)}
                    placeholder="e.g., 20"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 6 : Ammotization chart */}
        {step === 6 && (
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Ammotization chart</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Period of Ammotization</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {amortizationYearsInput} years, {amortizationMonthsInput} months, {amortizationDaysInput} days
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Debt funding</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">₹ {debtFundingNumber.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Debt interest rate</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{debtInterestRateNumber.toFixed(2)}%</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">Monthly Opex</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">₹ {opexTotal.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700">Period</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Opening Debt (₹)</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Interest (₹)</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Principal (₹)</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Opex (₹)</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Total Payment (₹)</th>
                      <th className="border border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-700">Closing Debt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.length > 0 ? (
                      amortizationSchedule.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900">{row.period}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm text-slate-700">₹ {row.openingDebt.toFixed(0)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm text-slate-700">₹ {row.interest.toFixed(0)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm text-slate-700">₹ {row.principal.toFixed(0)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm text-slate-700">₹ {row.opex.toFixed(0)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm font-semibold text-slate-900">₹ {row.totalPayment.toFixed(0)}</td>
                          <td className="border border-slate-200 px-3 py-2 text-right text-sm font-semibold text-slate-900">₹ {row.closingDebt.toFixed(0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="border border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                          Enter a valid amortization period to preview the schedule.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
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

      {/* DPR Modal */}
      {showDPRModal && dprPayload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">Detailed Project Report</h2>
              <button
                onClick={() => setShowDPRModal(false)}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="space-y-6 text-sm">
                {/* Project Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Project Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-600">Project Name</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.projectName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Organization</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.organizationName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Unit Name</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.unitName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Address</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.address}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">GST Number</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.gst}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">PAN Number</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.pan}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Admin Name</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.adminName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Admin Contact</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.adminContact}</div>
                    </div>
                  </div>
                </div>

                {/* Collection Target */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Collection Target</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-600">Goal Per Cycle</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.collectionGoalPerCycle} tonnes</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Per Day Goal</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.targetTonnage.toFixed(2)} t/day</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Collection Window</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.collectionWindowFrom} to {dprPayload.collectionWindowTo}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Window Days</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.collectionWindowDays} days</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-slate-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-slate-600">Collection Details</div>
                    <div className="mt-1 text-sm text-slate-700">{dprPayload.collectionDetails}</div>
                  </div>
                </div>

                {/* CAPEX */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Capital Expenditure (CAPEX)</h3>
                  <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 font-semibold text-slate-900">Line Item</th>
                          <th className="text-right py-2 font-semibold text-slate-900">Qty</th>
                          <th className="text-right py-2 font-semibold text-slate-900">Unit Cost</th>
                          <th className="text-right py-2 font-semibold text-slate-900">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dprPayload.capex.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="py-2">{item.lineItem}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">₹ {item.perUnitCost.toLocaleString()}</td>
                            <td className="text-right font-semibold">₹ {item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-slate-900 font-semibold">
                          <td colSpan={3} className="py-2 text-right">Total CAPEX:</td>
                          <td className="text-right">₹ {dprPayload.capex.amount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* OPEX */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Operational Expenditure (OPEX) - Monthly</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Labour</span>
                      <span className="font-semibold text-slate-900">₹ {dprPayload.opex.labor.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Diesel/Fuel</span>
                      <span className="font-semibold text-slate-900">₹ {dprPayload.opex.fuel.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Lease Amount</span>
                      <span className="font-semibold text-slate-900">₹ {dprPayload.opex.loading.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Maintenance</span>
                      <span className="font-semibold text-slate-900">₹ {dprPayload.opex.maintenance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Miscellaneous</span>
                      <span className="font-semibold text-slate-900">₹ {dprPayload.opex.misc.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 mt-2">
                      <span className="font-semibold text-slate-900">Total Monthly OPEX</span>
                      <span className="font-semibold text-emerald-600">₹ {(dprPayload.opex.labor + dprPayload.opex.fuel + dprPayload.opex.loading + dprPayload.opex.maintenance + dprPayload.opex.misc).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Investment */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Investment & Funding</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-slate-600">Total Investment</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">₹ {dprPayload.investment.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Equity Funding</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">₹ {dprPayload.investment.equity.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Debt Funding</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">₹ {dprPayload.investment.debt.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-600">Debt Interest Rate</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{dprPayload.investment.debtInterestRate}% p.a.</div>
                    </div>
                  </div>
                </div>

                {/* Amortization */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Amortization Details</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Period</span>
                      <span className="font-semibold text-slate-900">{dprPayload.amortization.years} years, {dprPayload.amortization.months} months, {dprPayload.amortization.days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Days</span>
                      <span className="font-semibold text-slate-900">{dprPayload.amortization.totalDays} days</span>
                    </div>
                  </div>
                </div>

                {/* Generated Timestamp */}
                <div className="text-center text-xs text-slate-500 border-t border-slate-200 pt-4 mt-4">
                  Generated on {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={downloadDPR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                <Download className="h-4 w-4" />
                Download DPR
              </button>
              <button
                onClick={handleStartOperations}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Start Operations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
