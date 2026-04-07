import React, { useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../../lib/config/storageKeys";
import { readJson, writeJson } from "../../lib/storage/jsonStorage";
import { getDummyFleetData } from "./dummyFleetData";

type VehicleOption = {
  id: string;
  registrationNo: string;
};

type WeighmentSlip = {
  id: string;
  date: string;
  vehicleNumber: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  weighmentCharge: number;
};

function loadStoredVehicles(): VehicleOption[] {
  const stored = readJson(STORAGE_KEYS.VEHICLES, []);
  if (!Array.isArray(stored)) return [];

  return stored
    .map((item: any) => ({
      id: String(item?.id || item?.vehicle_id || item?.registrationNo || ""),
      registrationNo: String(item?.registrationNo || item?.vehicle_number || "").trim(),
    }))
    .filter((item: VehicleOption) => item.registrationNo.length > 0);
}

function loadDummyVehicles(): VehicleOption[] {
  const { vehicles } = getDummyFleetData();
  return vehicles
    .map((entry) => ({
      id: String(entry?.vehicle_id || entry?.vehicle_information?.vehicle_number || ""),
      registrationNo: String(entry?.vehicle_information?.vehicle_number || "").trim(),
    }))
    .filter((item) => item.registrationNo.length > 0);
}

function mergeVehicleOptions(primary: VehicleOption[], secondary: VehicleOption[]): VehicleOption[] {
  const byNumber = new Map<string, VehicleOption>();
  [...primary, ...secondary].forEach((item) => {
    if (!item.registrationNo) return;
    byNumber.set(item.registrationNo, item);
  });
  return Array.from(byNumber.values());
}

export default function WeighmentPage() {
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>(() =>
    mergeVehicleOptions(loadStoredVehicles(), loadDummyVehicles())
  );
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    vehicleNumber: "",
    grossWeight: "",
    tareWeight: "",
    weighmentCharge: "",
  });

  const [savedSlips, setSavedSlips] = useState<WeighmentSlip[]>(() => {
    const stored = readJson(STORAGE_KEYS.WEIGHMENT_SLIPS, []);
    return Array.isArray(stored) ? stored : [];
  });

  const netWeight = useMemo(() => {
    const gross = Number(form.grossWeight) || 0;
    const tare = Number(form.tareWeight) || 0;
    return Math.max(0, gross - tare);
  }, [form.grossWeight, form.tareWeight]);

  const refreshVehicleOptions = async () => {
    setLoadingVehicles(true);
    try {
      const mapped = mergeVehicleOptions(loadStoredVehicles(), loadDummyVehicles());

      setVehicleOptions(mapped);
      writeJson(STORAGE_KEYS.VEHICLES, mapped);
    } catch {
      // Keep stored options as fallback.
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (vehicleOptions.length === 0) {
      const mapped = mergeVehicleOptions(loadStoredVehicles(), loadDummyVehicles());
      setVehicleOptions(mapped);
      writeJson(STORAGE_KEYS.VEHICLES, mapped);
    }
  }, [vehicleOptions.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.vehicleNumber || !form.date) return;

    const slip: WeighmentSlip = {
      id: `ws-${Date.now()}`,
      date: form.date,
      vehicleNumber: form.vehicleNumber,
      grossWeight: Number(form.grossWeight) || 0,
      tareWeight: Number(form.tareWeight) || 0,
      netWeight,
      weighmentCharge: Number(form.weighmentCharge) || 0,
    };

    const next = [slip, ...savedSlips];
    setSavedSlips(next);
    writeJson(STORAGE_KEYS.WEIGHMENT_SLIPS, next);

    setForm((prev) => ({
      ...prev,
      grossWeight: "",
      tareWeight: "",
      weighmentCharge: "",
    }));
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Weighment</h1>
            <p className="mt-1 text-sm text-slate-600">
              Enter weigh slip details including weight values, date, charge, and vehicle number.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshVehicleOptions}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {loadingVehicles ? "Refreshing..." : "Refresh vehicles"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Vehicle number</span>
            <select
              value={form.vehicleNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              required
            >
              <option value="">Select vehicle</option>
              {vehicleOptions.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.registrationNo}>
                  {vehicle.registrationNo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Weighment charge (INR)</span>
            <input
              type="number"
              min={0}
              value={form.weighmentCharge}
              onChange={(e) => setForm((prev) => ({ ...prev, weighmentCharge: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., 250"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Gross weight (kg)</span>
            <input
              type="number"
              min={0}
              value={form.grossWeight}
              onChange={(e) => setForm((prev) => ({ ...prev, grossWeight: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., 8400"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tare weight (kg)</span>
            <input
              type="number"
              min={0}
              value={form.tareWeight}
              onChange={(e) => setForm((prev) => ({ ...prev, tareWeight: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., 3100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Net weight (kg)</span>
            <input
              type="number"
              value={netWeight}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </label>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save weigh slip
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-3 text-sm font-semibold text-slate-900">Recent weigh slips</div>
        {savedSlips.length === 0 ? (
          <div className="text-sm text-slate-500">No slips saved yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Vehicle</th>
                  <th className="px-3 py-2 text-right">Gross (kg)</th>
                  <th className="px-3 py-2 text-right">Tare (kg)</th>
                  <th className="px-3 py-2 text-right">Net (kg)</th>
                  <th className="px-3 py-2 text-right">Charge (INR)</th>
                </tr>
              </thead>
              <tbody>
                {savedSlips.map((slip) => (
                  <tr key={slip.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{slip.date}</td>
                    <td className="px-3 py-2">{slip.vehicleNumber}</td>
                    <td className="px-3 py-2 text-right">{slip.grossWeight.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{slip.tareWeight.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{slip.netWeight.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">₹ {slip.weighmentCharge.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
