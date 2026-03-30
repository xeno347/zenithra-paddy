import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import * as L from "leaflet";
import "leaflet-routing-machine";
import { Lock, Plus, Route as RouteIcon, Unlock } from "lucide-react";

type PlanStatus = "pending" | "started" | "completed";

type CollectionPlan = {
  id: string;
  title: string;
  zone: string;
  date: string;
  status: PlanStatus;
};

function StatusPill({ status }: { status: PlanStatus }) {
  const meta =
    status === "completed"
      ? { label: "Completed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
      : status === "started"
        ? { label: "Started", cls: "bg-blue-50 text-blue-700 ring-blue-200" }
        : { label: "Pending", cls: "bg-amber-50 text-amber-800 ring-amber-200" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function RoutingLayer({ locked }: { locked: boolean }) {
  const map = useMap();

  const routeWaypoints = useMemo(
    () => [
      L.latLng(21.2514, 81.6296),
      L.latLng(21.2150, 81.6640),
      L.latLng(21.1805, 81.7020),
    ],
    []
  );

  useEffect(() => {
    // Fix default icon paths in leaflet (Vite-friendly)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    const routing = (L as any).Routing?.control?.({
      waypoints: routeWaypoints,
      routeWhileDragging: !locked,
      addWaypoints: !locked,
      draggableWaypoints: !locked,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 5, opacity: 0.85 }],
      },
    });

    if (!routing) return;
    routing.addTo(map);
    return () => {
      try {
        routing.remove();
      } catch {
        // ignore
      }
    };
  }, [locked, map, routeWaypoints]);

  return null;
}

export default function CollectionPlanningPage() {
  const [locked, setLocked] = useState(false);
  const [tractorCapacityPerDay, setTractorCapacityPerDay] = useState<number>(18);
  const [workingHours, setWorkingHours] = useState<number>(10);
  const [zoneInput, setZoneInput] = useState("");
  const [zones, setZones] = useState<string[]>(["Zone A", "Zone B", "Zone C"]);

  const [plans, setPlans] = useState<CollectionPlan[]>([
    {
      id: "CP-001",
      title: "Morning collection run",
      zone: "Zone A",
      date: "2026-03-30",
      status: "pending",
    },
    {
      id: "CP-002",
      title: "Mid-day consolidation",
      zone: "Zone B",
      date: "2026-03-30",
      status: "started",
    },
    {
      id: "CP-003",
      title: "Evening dispatch",
      zone: "Zone C",
      date: "2026-03-29",
      status: "completed",
    },
  ]);

  function addZone() {
    const z = zoneInput.trim();
    if (!z) return;
    setZones((prev) => (prev.includes(z) ? prev : [...prev, z]));
    setZoneInput("");
  }

  function removeZone(z: string) {
    setZones((prev) => prev.filter((x) => x !== z));
  }

  function createNewPlan() {
    const zone = zones[0] || "Unassigned";
    const next = (plans.length + 1).toString().padStart(3, "0");
    setPlans((prev) => [
      {
        id: `CP-${next}`,
        title: "New plan",
        zone,
        date: new Date().toISOString().slice(0, 10),
        status: "pending",
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Collection Planning Module</div>
            <div className="mt-1 text-xs text-slate-500">
              Configure capacity, hours and zones, then route tractors.
            </div>
          </div>

          <button
            type="button"
            onClick={createNewPlan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create new plan
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold text-slate-900">Configuration</div>
          </div>

          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className={
              locked
                ? "inline-flex items-center gap-2 rounded-xl border border-border bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                : "inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            }
          >
            {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {locked ? "Locked" : "Lock configuration"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="text-xs font-semibold text-slate-900">Per day tractor capacity</div>
            <div className="mt-1 text-[11px] text-slate-500">Set maximum paddy capacity per tractor per day.</div>
            <div className="mt-3">
              <input
                type="number"
                inputMode="numeric"
                value={tractorCapacityPerDay}
                onChange={(e) => setTractorCapacityPerDay(Number(e.target.value))}
                disabled={locked}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
              <div className="mt-1 text-[11px] text-slate-500">Units: tons (example)</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="text-xs font-semibold text-slate-900">Working hours</div>
            <div className="mt-1 text-[11px] text-slate-500">Define total working hours for the day’s plan.</div>
            <div className="mt-3">
              <input
                type="number"
                inputMode="numeric"
                value={workingHours}
                onChange={(e) => setWorkingHours(Number(e.target.value))}
                disabled={locked}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
              <div className="mt-1 text-[11px] text-slate-500">Hours/day</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="text-xs font-semibold text-slate-900">Different zones</div>
            <div className="mt-1 text-[11px] text-slate-500">Add zones to allocate routes and targets.</div>

            <div className="mt-3 flex gap-2">
              <input
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                disabled={locked}
                placeholder="e.g. Zone D"
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={addZone}
                disabled={locked}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {zones.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => removeZone(z)}
                  disabled={locked}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  title={locked ? undefined : "Remove"}
                >
                  <span>{z}</span>
                  {!locked ? <span className="text-slate-400">×</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border bg-slate-50 p-4 text-xs text-slate-600">
          <div className="font-semibold text-slate-900">Current config</div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <span className="text-slate-500">Capacity/day:</span> {tractorCapacityPerDay}
            </div>
            <div>
              <span className="text-slate-500">Working hours:</span> {workingHours}
            </div>
            <div className="truncate">
              <span className="text-slate-500">Zones:</span> {zones.join(", ") || "—"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-0 shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Route map</div>
          <div className="mt-1 text-xs text-slate-500">
            Drag the route points when unlocked.
          </div>
        </div>

        <div className="w-full">
          <MapContainer
            center={[21.2514, 81.6296]}
            zoom={12}
            scrollWheelZoom
            className="h-[460px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RoutingLayer locked={locked} />
          </MapContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Paddy collection plans</div>
            <div className="mt-1 text-xs text-slate-500">Status: pending / started / completed</div>
          </div>
          <div className="text-xs text-slate-500">{plans.length} total</div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-semibold text-slate-600">
            <div className="col-span-3">Plan ID</div>
            <div className="col-span-5">Plan</div>
            <div className="col-span-2">Zone</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <div className="divide-y divide-border">
            {plans.map((p) => (
              <div key={p.id} className="grid grid-cols-12 items-center px-4 py-3">
                <div className="col-span-3">
                  <div className="text-xs font-semibold text-slate-900">{p.id}</div>
                </div>
                <div className="col-span-5 min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-900">{p.title}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-700">{p.zone}</div>
                </div>
                <div className="col-span-1">
                  <div className="text-xs text-slate-700">{p.date}</div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <StatusPill status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
