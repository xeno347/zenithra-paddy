import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import * as L from "leaflet";
import "leaflet-routing-machine";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  CalendarDays,
  Clock3,
  GitBranch,
  Lock,
  Play,
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

type FleetDecision = Record<
  FleetActivityId,
  {
    driverId: string;
    fleetId: string;
    groupId: string;
    capacityPerDay: number;
    usageIntent: string;
  }
>;

type GroupScheduleDay = {
  day: number;
  date: string;
  acres: number;
};

type GroupSummary = {
  id: string;
  name: string;
  activities: FleetActivityId[];
  averageCapacityPerDay: number;
  requiredDaysRaw: number;
  requiredDays: number;
  startDate: string;
  endDate: string;
  schedule: GroupScheduleDay[];
};

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

const usageIntentOptions = ["Primary operator", "Support", "Backup", "Shared rotation"];

function toGroupId(index: number) {
  return `group-${index + 1}`;
}

function toIsoDate(input: Date) {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysIso(startDate: string, offset: number) {
  const base = new Date(`${startDate}T00:00:00`);
  base.setDate(base.getDate() + offset);
  return toIsoDate(base);
}

function isoToDate(value: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDisplayDate(value: string) {
  if (!value) return "-";
  const parsed = isoToDate(value);
  return parsed
    ? parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";
}

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
  const [planLaunched, setPlanLaunched] = useState(false);
  const [workingHours, setWorkingHours] = useState<number>(10);
  const [workingAreaAcres, setWorkingAreaAcres] = useState<number>(500);
  const [groupCount, setGroupCount] = useState<number>(2);
  const [groupNames, setGroupNames] = useState<Record<string, string>>({
    "group-1": "Group 1",
    "group-2": "Group 2",
  });
  const [groupStartDates, setGroupStartDates] = useState<Record<string, string>>({
    "group-1": "",
    "group-2": "",
  });
  const zones = ["Zone A", "Zone B", "Zone C"];
  const [fleetDecision, setFleetDecision] = useState<FleetDecision>({
    slasher: { driverId: "", fleetId: "", groupId: "group-1", capacityPerDay: 15, usageIntent: "Primary operator" },
    racker: { driverId: "", fleetId: "", groupId: "group-1", capacityPerDay: 20, usageIntent: "Primary operator" },
    baler: { driverId: "", fleetId: "", groupId: "group-2", capacityPerDay: 15, usageIntent: "Primary operator" },
    loader: { driverId: "", fleetId: "", groupId: "group-2", capacityPerDay: 12, usageIntent: "Support" },
    carrier: { driverId: "", fleetId: "", groupId: "group-2", capacityPerDay: 18, usageIntent: "Shared rotation" },
  });

  const { clusters } = useMemo(
    () => buildClusters(parcels, savedClusterConfig.clusterCount, savedClusterConfig.clusterRadiusKm),
    [savedClusterConfig.clusterCount, savedClusterConfig.clusterRadiusKm]
  );

  function handleClusterChange(clusterId: string) {
    setSelectedClusterId(clusterId);
    setConfigurationSaved(false);
    setPlanLaunched(false);
  }

  function updateFleetDecision(
    activityId: FleetActivityId,
    field: "driverId" | "fleetId" | "groupId" | "capacityPerDay" | "usageIntent",
    value: string | number
  ) {
    setFleetDecision((prev) => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [field]: value,
      },
    }));
    setConfigurationSaved(false);
    setPlanLaunched(false);
  }

  const selectedCluster = selectedClusterId ? clusters.find((c) => c.id === selectedClusterId) : null;
  const selectedClusterArea = useMemo(
    () => selectedCluster?.members.reduce((sum, parcel) => sum + parcel.acres, 0) ?? 0,
    [selectedCluster]
  );

  useEffect(() => {
    if (!selectedCluster) return;
    setWorkingAreaAcres(Number(selectedClusterArea.toFixed(2)));
  }, [selectedCluster, selectedClusterArea]);

  const groupIds = useMemo(
    () => Array.from({ length: groupCount }, (_, idx) => toGroupId(idx)),
    [groupCount]
  );

  function updateGroupCount(nextValue: number) {
    const safeCount = Math.max(1, Number(nextValue) || 1);
    const allowed = new Set(Array.from({ length: safeCount }, (_, idx) => toGroupId(idx)));

    setGroupCount(safeCount);
    setGroupNames((prev) => {
      const next: Record<string, string> = {};
      Array.from({ length: safeCount }, (_, idx) => {
        const id = toGroupId(idx);
        next[id] = prev[id] || `Group ${idx + 1}`;
      });
      return next;
    });
    setGroupStartDates((prev) => {
      const next: Record<string, string> = {};
      Array.from({ length: safeCount }, (_, idx) => {
        const id = toGroupId(idx);
        next[id] = prev[id] || "";
      });
      return next;
    });
    setFleetDecision((prev) => {
      const next = { ...prev };
      fleetActivities.forEach((activity) => {
        const chosenGroup = prev[activity.id].groupId;
        if (!allowed.has(chosenGroup)) {
          next[activity.id] = { ...next[activity.id], groupId: toGroupId(0) };
        }
      });
      return next;
    });
    setConfigurationSaved(false);
    setPlanLaunched(false);
  }

  const groupSummaries = useMemo<GroupSummary[]>(() => {
    return groupIds.map((groupId, idx) => {
      const activities = fleetActivities
        .filter((activity) => fleetDecision[activity.id].groupId === groupId)
        .map((activity) => activity.id);

      const totalCapacity = activities.reduce(
        (sum, activityId) => sum + Math.max(0, fleetDecision[activityId].capacityPerDay || 0),
        0
      );
      const averageCapacityPerDay = activities.length ? totalCapacity / activities.length : 0;
      const requiredDaysRaw = averageCapacityPerDay > 0 ? workingAreaAcres / averageCapacityPerDay : 0;
      const requiredDays = averageCapacityPerDay > 0 ? Math.ceil(requiredDaysRaw) : 0;
      const startDate = groupStartDates[groupId] || "";
      const endDate = startDate && requiredDays > 0 ? addDaysIso(startDate, requiredDays - 1) : "";

      let remaining = Math.max(0, workingAreaAcres);
      const schedule: GroupScheduleDay[] =
        startDate && requiredDays > 0
          ? Array.from({ length: requiredDays }, (_, dayIndex) => {
              const mapped = Math.min(averageCapacityPerDay, remaining);
              remaining -= mapped;
              return {
                day: dayIndex + 1,
                date: addDaysIso(startDate, dayIndex),
                acres: Number(mapped.toFixed(2)),
              };
            })
          : [];

      return {
        id: groupId,
        name: groupNames[groupId] || `Group ${idx + 1}`,
        activities,
        averageCapacityPerDay: Number(averageCapacityPerDay.toFixed(2)),
        requiredDaysRaw,
        requiredDays,
        startDate,
        endDate,
        schedule,
      };
    });
  }, [fleetDecision, groupIds, groupNames, groupStartDates, workingAreaAcres]);

  const allActiveGroupsMapped = groupSummaries.every(
    (group) => group.activities.length === 0 || (Boolean(group.startDate) && group.requiredDays > 0)
  );
  const calendarMappingReady = configurationSaved && allActiveGroupsMapped;
  const canLaunchPlan = Boolean(selectedCluster) && calendarMappingReady;

  const plans = useMemo<CollectionPlan[]>(() => {
    if (!configurationSaved) return [];

    const todayIso = toIsoDate(new Date());
    const generated = groupSummaries.flatMap((group) =>
      group.schedule.map((slot, idx) => {
        const status: PlanStatus =
          slot.date < todayIso ? "completed" : slot.date === todayIso ? "started" : "pending";

        return {
          id: "",
          title: `${group.name} day ${slot.day} (${slot.acres} acres)`,
          zone: selectedCluster?.id || "-",
          date: slot.date,
          status,
          order: idx,
        };
      })
    );

    return generated
      .sort((a, b) => (a.date === b.date ? a.order - b.order : a.date.localeCompare(b.date)))
      .map((plan, index) => ({
        id: `CP-${String(index + 1).padStart(3, "0")}`,
        title: plan.title,
        zone: plan.zone,
        date: plan.date,
        status: plan.status,
      }));
  }, [configurationSaved, groupSummaries, selectedCluster?.id]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/40 to-cyan-50/35 p-6 shadow-soft">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 -bottom-20 h-52 w-52 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-700">Operations Control</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Collection Planning Dashboard</div>
            <div className="mt-1 text-sm text-slate-500">Plan capacity, schedule group calendars, and launch route-ready collection plans.</div>
          </div>
          <div className="w-full lg:w-[320px]">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Active cluster</div>
            <select
              value={selectedClusterId}
              onChange={(e) => handleClusterChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white/95 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:ring-4 focus:ring-primary/10"
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

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cluster area</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{selectedClusterArea.toFixed(2)} acres</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Working hours</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{workingHours} hrs</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Calendar groups</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{groupCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plans generated</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{plans.length}</div>
          </div>
        </div>
        </div>
      </section>

      <section className={`relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${!selectedCluster ? "blur-[1px]" : ""}`}>
        {!selectedCluster && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-600">Select a cluster to configure</div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-emerald-700" />
            <div className="text-base font-semibold text-slate-900">Configuration Setup</div>
          </div>

          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            disabled={!selectedCluster}
            className={
              locked && selectedCluster
                ? "inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                : "inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {locked ? "Locked" : "Lock configuration"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Tractor className="h-3.5 w-3.5 text-emerald-700" />
              <span>Working area (acres)</span>
            </div>
            <div className="mt-1.5">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={workingAreaAcres}
                onChange={(e) => {
                  setWorkingAreaAcres(Math.max(0, Number(e.target.value) || 0));
                  setConfigurationSaved(false);
                  setPlanLaunched(false);
                }}
                disabled={locked || !selectedCluster}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
              />
            </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Clock3 className="h-3.5 w-3.5 text-sky-700" />
              <span>Working hours</span>
            </div>
            <div className="mt-1.5">
              <input
                type="number"
                inputMode="numeric"
                value={workingHours}
                onChange={(e) => {
                  setWorkingHours(Number(e.target.value));
                  setConfigurationSaved(false);
                  setPlanLaunched(false);
                }}
                disabled={locked || !selectedCluster}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
              />
            </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <GitBranch className="h-3.5 w-3.5 text-amber-700" />
              <span>Vehicle groups setup</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">No. of groups</div>
                <input
                  type="number"
                  min={1}
                  value={groupCount}
                  onChange={(e) => updateGroupCount(Number(e.target.value))}
                  disabled={locked || !selectedCluster}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
                />
              </div>
              {groupIds.map((groupId, idx) => (
                <div key={groupId}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{`Group ${idx + 1} name`}</div>
                  <input
                    type="text"
                    value={groupNames[groupId] || `Group ${idx + 1}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      setGroupNames((prev) => ({ ...prev, [groupId]: value }));
                      setConfigurationSaved(false);
                      setPlanLaunched(false);
                    }}
                    disabled={locked || !selectedCluster}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 xl:col-span-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <GitBranch className="h-3.5 w-3.5 text-slate-600" />
            <span>Fleet Decision Pipeline</span>
          </div>
          <div className="mt-2 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-12 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <div className="col-span-2">Process Step</div>
                <div className="col-span-2">Driver</div>
                <div className="col-span-2">Fleet</div>
                <div className="col-span-2">Group</div>
                <div className="col-span-2">Capacity/day</div>
                <div className="col-span-2">Vehicle usage</div>
              </div>

              <div className="mt-2 space-y-2">
                {fleetActivities.map((activity, index) => (
                  <div key={activity.id} className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:-translate-y-[1px] hover:border-teal-200 hover:shadow-sm">
                    <div className="col-span-2 flex min-w-0 items-center gap-1.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                        {index + 1}
                      </div>
                      <div className="truncate text-xs font-semibold text-slate-800">{activity.label}</div>
                      {index < fleetActivities.length - 1 ? <span className="text-[10px] text-slate-300">{">"}</span> : null}
                    </div>

                    <div className="col-span-2">
                      <select
                        value={fleetDecision[activity.id].driverId}
                        onChange={(e) => updateFleetDecision(activity.id, "driverId", e.target.value)}
                        disabled={locked || !selectedCluster}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      >
                        <option value="">Select driver</option>
                        {availableDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <select
                        value={fleetDecision[activity.id].fleetId}
                        onChange={(e) => updateFleetDecision(activity.id, "fleetId", e.target.value)}
                        disabled={locked || !selectedCluster}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      >
                        <option value="">Select fleet</option>
                        {availableFleets.map((fleet) => (
                          <option key={fleet.id} value={fleet.id}>
                            {fleet.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <select
                        value={fleetDecision[activity.id].groupId}
                        onChange={(e) => updateFleetDecision(activity.id, "groupId", e.target.value)}
                        disabled={locked || !selectedCluster}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      >
                        {groupIds.map((groupId, idx) => (
                          <option key={groupId} value={groupId}>
                            {groupNames[groupId] || `Group ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={fleetDecision[activity.id].capacityPerDay}
                        onChange={(e) =>
                          updateFleetDecision(
                            activity.id,
                            "capacityPerDay",
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                        disabled={locked || !selectedCluster}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      />
                    </div>

                    <div className="col-span-2">
                      <select
                        value={fleetDecision[activity.id].usageIntent}
                        onChange={(e) => updateFleetDecision(activity.id, "usageIntent", e.target.value)}
                        disabled={locked || !selectedCluster}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      >
                        {usageIntentOptions.map((usage) => (
                          <option key={usage} value={usage}>
                            {usage}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setConfigurationSaved(true)}
            disabled={!selectedCluster || locked}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save configuration
          </button>
        </div>
      </section>

      <section className={`relative rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${!configurationSaved ? "blur-[1px]" : ""}`}>
        {!configurationSaved && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-600">Save configuration to enable group calendar mapping</div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
          <CalendarDays className="h-4 w-4 text-primary" />
          <div className="text-base font-semibold text-slate-900">Group calendar mapping</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groupSummaries.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{group.name}</div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {group.requiredDays} days
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Avg capacity/day</div>
                  <div className="mt-1 text-xs font-semibold text-slate-800">{group.averageCapacityPerDay} acres</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Raw days</div>
                  <div className="mt-1 text-xs font-semibold text-slate-800">{group.requiredDaysRaw.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Day mapping = ceil({workingAreaAcres} / {group.averageCapacityPerDay || 0}) = <span className="font-semibold text-slate-800">{group.requiredDays}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Collection period: <span className="font-semibold text-slate-800">{formatDisplayDate(group.startDate)}</span> to <span className="font-semibold text-slate-800">{formatDisplayDate(group.endDate)}</span>
              </div>

              <div className="mt-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Collection period calendar</label>
                <div className="mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-inner">
                  <DayPicker
                    mode="range"
                    selected={{
                      from: isoToDate(group.startDate),
                      to: isoToDate(group.endDate),
                    }}
                    onSelect={(range) => {
                      const value = range?.from ?? range?.to;
                      setGroupStartDates((prev) => ({
                        ...prev,
                        [group.id]: value ? toIsoDate(value) : "",
                      }));
                      setPlanLaunched(false);
                    }}
                    disabled={!selectedCluster || group.activities.length === 0 || group.requiredDays === 0}
                    className="text-[11px]"
                    classNames={{
                      month_caption: "text-sm font-semibold text-slate-900",
                      weekdays: "text-[11px] text-slate-500",
                      weekday: "font-semibold",
                      day: "h-8 w-8 rounded-md text-[11px] font-medium hover:bg-slate-100 transition",
                      today: "ring-1 ring-emerald-200",
                      range_start: "bg-emerald-600 text-white hover:bg-emerald-600",
                      range_middle: "bg-emerald-100 text-emerald-900",
                      range_end: "bg-emerald-600 text-white hover:bg-emerald-600",
                      chevron: "fill-slate-600",
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-semibold text-slate-700">Upcoming mapped days</div>
                {group.activities.length === 0 ? (
                  <div className="mt-1 text-[11px] text-slate-500">No vehicles assigned to this group.</div>
                ) : group.schedule.length === 0 ? (
                  <div className="mt-1 text-[11px] text-slate-500">Select start date to auto-create upcoming mapped days.</div>
                ) : (
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                    {group.schedule.map((slot) => (
                      <div key={`${group.id}-${slot.day}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                        <span>{`Day ${slot.day} - ${slot.date}`}</span>
                        <span className="font-semibold">{slot.acres} ac</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-soft ${!calendarMappingReady ? "blur-[1px]" : ""}`}>
        {!calendarMappingReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-10 w-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-600">Complete group calendar mapping to auto-enable route planning</div>
            </div>
          </div>
        )}

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="text-base font-semibold text-slate-900">Route map</div>
          <div className="mt-1 text-xs text-slate-500">
            Route planning is generated from mapped calendar days. Drag points only when unlocked.
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

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">Paddy collection plans</div>
            <div className="mt-1 text-xs text-slate-500">Auto-generated from group calendars and working area mapping.</div>
          </div>
          <div className="text-xs text-slate-500">{plans.length} total</div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <div className="min-w-[780px]">
              <div className="grid grid-cols-12 bg-slate-100 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
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
                {plans.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    Save configuration and choose group start dates to auto-create plans.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/40 p-5 shadow-soft">
          <div className="text-base font-semibold text-slate-900">Final launch</div>
          <div className="mt-1 text-xs text-slate-500">Launch activates mapped plans and route sequences for all configured groups.</div>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Configuration saved</span>
              <span className={configurationSaved ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{configurationSaved ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Calendar mapping ready</span>
              <span className={calendarMappingReady ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{calendarMappingReady ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Selected cluster</span>
              <span className={selectedCluster ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{selectedCluster ? selectedCluster.id : "Not selected"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPlanLaunched(true)}
            disabled={!canLaunchPlan}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Launch plan
          </button>

          {planLaunched && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              Plan launched successfully. Group calendars are locked and route planning is active.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
