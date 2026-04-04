import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import * as L from "leaflet";
import "leaflet-routing-machine";
import {
  Clock3,
  GitBranch,
  Lock,
  Route as RouteIcon,
  Save,
  Tractor,
  Unlock,
} from "lucide-react";
import {
  buildClusters,
  getSavedLandClusterConfig,
  landClusterDemoParcels as parcels,
} from "./landClusterDemoData";

type PlanStatus = "pending" | "started" | "completed";

type CollectionPlan = {
  id: string;
  title: string;
  zone: string;
  date: string;
  status: PlanStatus;
};

type FleetActivityId = "slasher" | "racker" | "baler" | "loader" | "carrier";

type FleetDecision = Record<FleetActivityId, { driverId: string; fleetId: string }>;

const fleetActivities: { id: FleetActivityId; label: string }[] = [
  { id: "slasher", label: "Slasher" },
  { id: "racker", label: "Racker" },
  { id: "baler", label: "Baler" },
  { id: "loader", label: "Loader" },
  { id: "carrier", label: "Carrier" },
];

const availableDrivers = [
  { id: "DRV-001", name: "Ravi Patel" },
  { id: "DRV-002", name: "Sanjay Verma" },
  { id: "DRV-003", name: "Nilesh Rao" },
  { id: "DRV-004", name: "Amit Sahu" },
  { id: "DRV-005", name: "Deepak Yadav" },
  { id: "DRV-006", name: "Kiran Lal" },
];

const availableFleets = [
  { id: "FLT-101", name: "Mahindra Yuvo 575" },
  { id: "FLT-102", name: "John Deere 5310" },
  { id: "FLT-103", name: "Sonalika DI 745" },
  { id: "FLT-104", name: "New Holland 3600" },
  { id: "FLT-105", name: "Powertrac Euro 50" },
  { id: "FLT-106", name: "Farmtrac Champion" },
];

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
      L.latLng(21.2814, 81.6596),
      L.latLng(21.2214, 81.6696),
    ],
    []
  );

  useEffect(() => {
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
        styles: [{ color: "#0f766e", weight: 5, opacity: 0.85 }],
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
  const savedClusterConfig = getSavedLandClusterConfig(3, 8);
  const [locked, setLocked] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [configurationSaved, setConfigurationSaved] = useState(false);
  const [tractorCapacityPerDay, setTractorCapacityPerDay] = useState<number>(18);
  const [workingHours, setWorkingHours] = useState<number>(10);
  const zones = ["Zone A", "Zone B", "Zone C"];
  const [fleetDecision, setFleetDecision] = useState<FleetDecision>({
    slasher: { driverId: "", fleetId: "" },
    racker: { driverId: "", fleetId: "" },
    baler: { driverId: "", fleetId: "" },
    loader: { driverId: "", fleetId: "" },
    carrier: { driverId: "", fleetId: "" },
  });

  const { clusters } = useMemo(
    () => buildClusters(parcels, savedClusterConfig.clusterCount, savedClusterConfig.clusterRadiusKm),
    [savedClusterConfig.clusterCount, savedClusterConfig.clusterRadiusKm]
  );

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

  function handleClusterChange(clusterId: string) {
    setSelectedClusterId(clusterId);
    setConfigurationSaved(false);
  }

  function updateFleetDecision(activityId: FleetActivityId, field: "driverId" | "fleetId", value: string) {
    setFleetDecision((prev) => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [field]: value,
      },
    }));
  }

  const selectedCluster = selectedClusterId ? clusters.find((c) => c.id === selectedClusterId) : null;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">Collection Planning Module</div>
            <div className="mt-1 text-sm text-slate-500">
              Configure capacity, hours and zones, then route tractors.
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedClusterId}
              onChange={(e) => handleClusterChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-primary/20 hover:bg-slate-50"
            >
              <option value="">Select a cluster...</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.id} ({cluster.members.length} parcels)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Capacity / day</div>
            <div className="mt-1 text-sm font-semibold text-emerald-900">{tractorCapacityPerDay} tons</div>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Working hours</div>
            <div className="mt-1 text-sm font-semibold text-sky-900">{workingHours} hrs</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Configured zones</div>
            <div className="mt-1 text-sm font-semibold text-amber-900">{zones.length}</div>
          </div>
        </div>
      </section>

      <section className={`relative rounded-2xl border border-border bg-white p-3 shadow-soft ${!selectedCluster ? "blur-sm" : ""}`}>
        {!selectedCluster && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-600">Select a cluster to configure</div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold text-slate-900">Configuration</div>
          </div>

          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            disabled={!selectedCluster}
            className={
              locked && selectedCluster
                ? "inline-flex items-center gap-1.5 rounded-xl border border-border bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-soft hover:bg-slate-800"
                : "inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {locked ? "Locked" : "Lock configuration"}
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-slate-50/70 p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Tractor className="h-3.5 w-3.5 text-emerald-700" />
              <span>Per day tractor capacity</span>
            </div>
            <div className="mt-1.5">
              <input
                type="number"
                inputMode="numeric"
                value={tractorCapacityPerDay}
                onChange={(e) => setTractorCapacityPerDay(Number(e.target.value))}
                disabled={locked || !selectedCluster}
                className="w-full rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-slate-50/70 p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Clock3 className="h-3.5 w-3.5 text-sky-700" />
              <span>Working hours</span>
            </div>
            <div className="mt-1.5">
              <input
                type="number"
                inputMode="numeric"
                value={workingHours}
                onChange={(e) => setWorkingHours(Number(e.target.value))}
                disabled={locked || !selectedCluster}
                className="w-full rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
              />
            </div>
          </div>

        </div>

        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <GitBranch className="h-3.5 w-3.5 text-slate-600" />
            <span>Fleet Decision Pipeline</span>
          </div>
          <div className="mt-1 grid grid-cols-12 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            <div className="col-span-4">Process Step</div>
            <div className="col-span-4">Driver</div>
            <div className="col-span-4">Fleet</div>
          </div>

          <div className="space-y-1">
            {fleetActivities.map((activity, index) => (
              <div key={activity.id} className="grid grid-cols-12 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                    {index + 1}
                  </div>
                  <div className="truncate text-[11px] font-semibold text-slate-800">{activity.label}</div>
                  {index < fleetActivities.length - 1 ? <span className="text-[10px] text-slate-300">{">"}</span> : null}
                </div>

                <div className="col-span-4">
                  <select
                    value={fleetDecision[activity.id].driverId}
                    onChange={(e) => updateFleetDecision(activity.id, "driverId", e.target.value)}
                    disabled={locked || !selectedCluster}
                    className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  >
                    <option value="">Select driver</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-4">
                  <select
                    value={fleetDecision[activity.id].fleetId}
                    onChange={(e) => updateFleetDecision(activity.id, "fleetId", e.target.value)}
                    disabled={locked || !selectedCluster}
                    className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  >
                    <option value="">Select fleet</option>
                    {availableFleets.map((fleet) => (
                      <option key={fleet.id} value={fleet.id}>
                        {fleet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setConfigurationSaved(true)}
            disabled={!selectedCluster || locked}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-5 py-2 text-[11px] font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3.5 w-3.5" />
            Save configuration
          </button>
        </div>
      </section>

      <section className={`relative rounded-2xl border border-border bg-white p-0 shadow-soft ${!configurationSaved ? "blur-sm" : ""}`}>
        {!configurationSaved && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-600">Save configuration to enable route mapping</div>
            </div>
          </div>
        )}
        
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
          <div className="grid grid-cols-12 bg-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            <div className="col-span-3">Plan ID</div>
            <div className="col-span-5">Plan</div>
            <div className="col-span-2">Zone</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <div className="divide-y divide-border">
            {plans.map((p) => (
              <div key={p.id} className="grid grid-cols-12 items-center px-4 py-3 transition hover:bg-slate-50">
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
