import React from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

type SourceType = "pipeline" | "agent";

type PipelineRow = {
  id: string;
  sourceType: SourceType;
  receivedFrom: string;
  receivedAt: string;
  landOwnerDetails: string;
  landDetails: string;
  acresOfLand: number;
  locationOfLand: string;
  landMapped: boolean;
  expectedHarvestDate: string;
  nextCropDate: string | null;
  distanceFromFacilityKm: number;
  cluster: string | null;
  coordinates?: [number, number];
  agentAvatar?: string;
};

const rows: PipelineRow[] = [
  {
    id: "PL-001",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - OCR + Risk Model",
    receivedAt: "10:25 AM",
    landOwnerDetails: "Mahesh Patel, verified KYC",
    landDetails: "Irrigated paddy plot with tube-well access",
    acresOfLand: 6.5,
    locationOfLand: "Kharora Block, Raipur",
    landMapped: true,
    expectedHarvestDate: "2026-11-12",
    nextCropDate: "2026-12-01",
    distanceFromFacilityKm: 18,
    cluster: "Cluster C2",
    coordinates: [21.2809, 81.7380],
  },
  {
    id: "AG-001",
    sourceType: "agent",
    receivedFrom: "Anita Verma (Field Agent)",
    receivedAt: "10:46 AM",
    landOwnerDetails: "Suresh Rao, spouse co-owner",
    landDetails: "Mixed soil patch near canal",
    acresOfLand: 4,
    locationOfLand: "Abhanpur, Raipur",
    landMapped: false,
    expectedHarvestDate: "2026-10-28",
    nextCropDate: null,
    distanceFromFacilityKm: 27,
    cluster: null,
    coordinates: [21.1948, 81.7725],
    agentAvatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "PL-002",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - Geo Match",
    receivedAt: "11:08 AM",
    landOwnerDetails: "Ritu Sharma, digital signature approved",
    landDetails: "Low-lying paddy area with seasonal drainage",
    acresOfLand: 8.25,
    locationOfLand: "Tilda, Raipur",
    landMapped: true,
    expectedHarvestDate: "2026-11-20",
    nextCropDate: "2026-12-15",
    distanceFromFacilityKm: 11,
    cluster: "Cluster B1",
    coordinates: [21.3239, 81.6643],
  },
  {
    id: "AG-002",
    sourceType: "agent",
    receivedFrom: "Rahul Das (Zone Agent)",
    receivedAt: "11:21 AM",
    landOwnerDetails: "Kamalini Devi, owner",
    landDetails: "Rain-fed farm, manual bunding",
    acresOfLand: 3.75,
    locationOfLand: "Arang, Raipur",
    landMapped: true,
    expectedHarvestDate: "2026-10-22",
    nextCropDate: null,
    distanceFromFacilityKm: 35,
    cluster: null,
    coordinates: [21.1901, 81.9568],
    agentAvatar: "https://i.pravatar.cc/80?img=12",
  },
];

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "AG";
}

function PipelineSignal() {
  return (
    <svg
      viewBox="0 0 130 56"
      className="h-6 w-16"
      role="img"
      aria-label="Pipeline activity"
    >
      <path
        d="M9 28 H33 M33 28 H53 M53 28 C72 28 72 11 91 11 H121 M53 28 C72 28 72 45 91 45 H121"
        fill="none"
        stroke="#ec4899"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pipeline-line"
      />
      <circle cx="9" cy="28" r="7" fill="white" stroke="#ec4899" strokeWidth="6" />
      <circle cx="33" cy="28" r="7" fill="white" stroke="#ec4899" strokeWidth="6" />
      <circle cx="53" cy="28" r="7" fill="white" stroke="#ec4899" strokeWidth="6" />
      <circle cx="121" cy="11" r="7" fill="white" stroke="#ec4899" strokeWidth="6" className="pipeline-node" />
      <circle cx="121" cy="45" r="7" fill="white" stroke="#ec4899" strokeWidth="6" className="pipeline-node" />
    </svg>
  );
}

function AgentAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const fallback = initials(name);

  return (
    <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-700">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-xs font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function prettyDate(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return input;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function FitMappedBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }

    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, points]);

  return null;
}

function FlyToPoint({ point }: { point: [number, number] | null }) {
  const map = useMap();

  React.useEffect(() => {
    if (!point) return;
    map.flyTo(point, 13, { duration: 0.8 });
  }, [map, point]);

  return null;
}

export default function FarmerPipelinePage() {
  const [clusterById, setClusterById] = React.useState<Record<string, string | null>>(() =>
    rows.reduce<Record<string, string | null>>((acc, row) => {
      acc[row.id] = row.cluster;
      return acc;
    }, {})
  );
  const [clusterInputById, setClusterInputById] = React.useState<Record<string, string>>({});
  const [selectedRowId, setSelectedRowId] = React.useState<string>(rows[0]?.id ?? "");
  const [activePanel, setActivePanel] = React.useState<"details" | "cluster">("details");
  const [mapFocusPoint, setMapFocusPoint] = React.useState<[number, number] | null>(null);
  const mappedRows = React.useMemo(
    () => rows.filter((row) => row.landMapped && row.coordinates),
    []
  );
  const selectedRow = React.useMemo(
    () => rows.find((row) => row.id === selectedRowId) || rows[0],
    [selectedRowId]
  );

  React.useEffect(() => {
    // Fix default Leaflet marker icon asset paths for Vite.
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

  function saveCluster(rowId: string) {
    const draft = (clusterInputById[rowId] || "").trim();
    if (!draft) return;

    setClusterById((prev) => ({ ...prev, [rowId]: draft }));
    setClusterInputById((prev) => ({ ...prev, [rowId]: "" }));
  }

  function clearCluster(rowId: string) {
    setClusterById((prev) => ({ ...prev, [rowId]: null }));
  }

  return (
    <section className="min-h-[calc(100vh-160px)] rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">Farmer pipeline</div>
            <div className="mt-1 text-sm text-slate-500">Professional intake board for AI and agent updates. Click any row to view full land details.</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-pink-200 bg-pink-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-pink-500">Pipeline</div>
              <div className="mt-0.5 text-sm font-semibold text-pink-700">{rows.filter((x) => x.sourceType === "pipeline").length}</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Agent</div>
              <div className="mt-0.5 text-sm font-semibold text-blue-700">{rows.filter((x) => x.sourceType === "agent").length}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">Mapped land</div>
              <div className="mt-0.5 text-sm font-semibold text-emerald-700">{rows.filter((x) => x.landMapped).length}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">Pending cluster</div>
              <div className="mt-0.5 text-sm font-semibold text-amber-700">{rows.filter((x) => !clusterById[x.id]).length}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Mapped Land (Leaflet)</div>
            <div className="mt-0.5 text-xs text-slate-500">Live map view for plots marked as mapped land.</div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {mappedRows.length} mapped plots
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <MapContainer
            center={[21.2514, 81.6296]}
            zoom={10}
            scrollWheelZoom={false}
            className="h-[320px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitMappedBounds points={mappedRows.map((row) => row.coordinates as [number, number])} />
            <FlyToPoint point={mapFocusPoint} />

            {mappedRows.map((row) => (
              <React.Fragment key={row.id}>
                <Marker position={row.coordinates as [number, number]}>
                  <Popup>
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900">{row.landOwnerDetails}</div>
                      <div className="mt-1 text-slate-600">{row.locationOfLand}</div>
                      <div className="mt-1 text-slate-600">Acres: {row.acresOfLand}</div>
                      <div className="text-slate-600">Expected harvest: {prettyDate(row.expectedHarvestDate)}</div>
                    </div>
                  </Popup>
                </Marker>
                {selectedRow?.id === row.id ? (
                  <CircleMarker
                    center={row.coordinates as [number, number]}
                    radius={18}
                    pathOptions={{ color: "#3c8dbc", fillOpacity: 0 }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </section>

      <div className="mt-4 h-[calc(100vh-320px)] min-h-[460px] overflow-auto rounded-2xl border border-slate-200 bg-white">
        <div className="sticky top-0 z-10 hidden grid-cols-[0.9fr_1.2fr_0.8fr_1fr_0.8fr_1fr_1.6fr] gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 backdrop-blur md:grid">
          <div>Source</div>
          <div>Owner / Location</div>
          <div>Acres</div>
          <div>Harvest / Next crop</div>
          <div>Distance</div>
          <div>Cluster</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.map((row) => {
            return (
              <div key={row.id} className="bg-white">
                <div className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition hover:bg-slate-50 md:grid-cols-[0.9fr_1.2fr_0.8fr_1fr_0.8fr_1fr_1.6fr] md:items-center md:gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Source</div>
                    <div className="mt-1 flex items-center gap-2">
                      {row.sourceType === "pipeline" ? (
                        <>
                          <PipelineSignal />
                          <span className="rounded-full bg-pink-50 px-2 py-1 text-[11px] font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
                            Pipeline
                          </span>
                        </>
                      ) : (
                        <>
                          <AgentAvatar name={row.receivedFrom} avatarUrl={row.agentAvatar} />
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                            Agent
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Owner / Location</div>
                    <div className="text-sm font-semibold text-slate-900">{row.landOwnerDetails}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{row.locationOfLand}</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Acres</div>
                    <div className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                      {row.acresOfLand}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Harvest / Next crop</div>
                    <div className="text-xs font-semibold text-slate-700">{prettyDate(row.expectedHarvestDate)}</div>
                    <div className="mt-0.5 text-xs text-slate-500">Next: {row.nextCropDate ? prettyDate(row.nextCropDate) : "Nil"}</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Distance</div>
                    <div className="text-sm font-semibold text-slate-700">{row.distanceFromFacilityKm} km</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Cluster</div>
                    {clusterById[row.id] ? (
                      <div className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        {clusterById[row.id]}
                      </div>
                    ) : (
                      <div className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                        Missing
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Actions</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRowId(row.id);
                          setActivePanel("details");
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRowId(row.id);
                          setActivePanel("cluster");
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cluster
                      </button>
                      <button
                        type="button"
                        disabled={!row.landMapped || !row.coordinates}
                        onClick={() => {
                          if (!row.coordinates || !row.landMapped) return;
                          setSelectedRowId(row.id);
                          setMapFocusPoint(row.coordinates);
                        }}
                        className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Show on map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Action Workspace</div>
            <div className="mt-0.5 text-xs text-slate-500">Selected record: {selectedRow.id} - {selectedRow.landOwnerDetails}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePanel("details")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activePanel === "details" ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("cluster")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activePanel === "cluster" ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              Cluster action
            </button>
          </div>
        </div>

        {activePanel === "details" ? (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <DetailItem label="Record ID" value={selectedRow.id} />
            <DetailItem label="Received from" value={selectedRow.receivedFrom} />
            <DetailItem label="Received at" value={selectedRow.receivedAt} />
            <DetailItem label="Land owner details" value={selectedRow.landOwnerDetails} />
            <DetailItem label="Land details" value={selectedRow.landDetails} />
            <DetailItem label="Location of land" value={selectedRow.locationOfLand} />
            <DetailItem label="Land mapped" value={selectedRow.landMapped ? "Yes" : "No"} />
            <DetailItem label="Expected harvested date" value={prettyDate(selectedRow.expectedHarvestDate)} />
            <DetailItem label="Next crop date" value={selectedRow.nextCropDate ? prettyDate(selectedRow.nextCropDate) : "Nil"} />
            <DetailItem label="Distance from warehouse/plant" value={`${selectedRow.distanceFromFacilityKm} km`} />
          </div>
        ) : (
          <div className="mt-4 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cluster action for {selectedRow.id}</div>
            <div className="mt-3 space-y-2">
              {clusterById[selectedRow.id] ? (
                <>
                  <div className="rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    Cluster: {clusterById[selectedRow.id]}
                  </div>
                  <button
                    type="button"
                    onClick={() => clearCluster(selectedRow.id)}
                    className="rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Update cluster
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={clusterInputById[selectedRow.id] || ""}
                    onChange={(e) =>
                      setClusterInputById((prev) => ({
                        ...prev,
                        [selectedRow.id]: e.target.value,
                      }))
                    }
                    placeholder="Enter cluster"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => saveCluster(selectedRow.id)}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Save cluster
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .pipeline-line {
          stroke-dasharray: 12;
          animation: flow 1.5s linear infinite;
        }

        .pipeline-node {
          animation: pingNode 1.6s ease-in-out infinite;
        }

        @keyframes flow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -24;
          }
        }

        @keyframes pingNode {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </section>
  );
}
