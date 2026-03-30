import React from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

type SourceType = "pipeline" | "agent";

type PipelineRow = {
  id: string;
  sourceType: SourceType;
  receivedFrom: string;
  receivedAt: string;
  ownerName: string;
  ownerContact: string;
  landOwnerDetails: string;
  landDetails: string;
  paddyType: string;
  acresOfLand: number;
  locationOfLand: string;
  landMapped: boolean;
  expectedHarvestDate: string;
  nextCropDate: string | null;
  distanceFromFacilityKm: number;
  cluster: string | null;
  coordinates?: [number, number];
};

const rows: PipelineRow[] = [
  {
    id: "PL-001",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - OCR + Risk Model",
    receivedAt: "10:25 AM",
    ownerName: "Mahesh Patel",
    ownerContact: "+91 98765 11001",
    landOwnerDetails: "Mahesh Patel, verified KYC",
    landDetails: "Irrigated paddy plot with tube-well access",
    paddyType: "Swarna",
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
    ownerName: "Suresh Rao",
    ownerContact: "+91 98765 22002",
    landOwnerDetails: "Suresh Rao, spouse co-owner",
    landDetails: "Mixed soil patch near canal",
    paddyType: "MTU-1010",
    acresOfLand: 4,
    locationOfLand: "Abhanpur, Raipur",
    landMapped: false,
    expectedHarvestDate: "2026-10-28",
    nextCropDate: null,
    distanceFromFacilityKm: 27,
    cluster: null,
    coordinates: [21.1948, 81.7725],
  },
  {
    id: "PL-002",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - Geo Match",
    receivedAt: "11:08 AM",
    ownerName: "Ritu Sharma",
    ownerContact: "+91 98765 33003",
    landOwnerDetails: "Ritu Sharma, digital signature approved",
    landDetails: "Low-lying paddy area with seasonal drainage",
    paddyType: "IR64",
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
    ownerName: "Kamalini Devi",
    ownerContact: "+91 98765 44004",
    landOwnerDetails: "Kamalini Devi, owner",
    landDetails: "Rain-fed farm, manual bunding",
    paddyType: "BPT-5204",
    acresOfLand: 3.75,
    locationOfLand: "Arang, Raipur",
    landMapped: true,
    expectedHarvestDate: "2026-10-22",
    nextCropDate: null,
    distanceFromFacilityKm: 35,
    cluster: null,
    coordinates: [21.1901, 81.9568],
  },
];

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

function LandMappingCell({ row }: { row: PipelineRow }) {
  if (!row.landMapped || !row.coordinates) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
        Not mapped
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <MapContainer
        center={row.coordinates}
        zoom={13}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-24 w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={row.coordinates} />
      </MapContainer>
    </div>
  );
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
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const selectedRow = React.useMemo(
    () => rows.find((row) => row.id === selectedRowId) || rows[0],
    [selectedRowId]
  );

  const historyById = React.useMemo(
    () =>
      rows.reduce<Record<string, string[]>>((acc, row) => {
        acc[row.id] = [
          `Lead received from ${row.receivedFrom} at ${row.receivedAt}`,
          `Land verification completed for ${row.ownerName}`,
          `Harvest window set for ${prettyDate(row.expectedHarvestDate)}`,
          row.landMapped ? "Geo coordinates mapped on plot map" : "Map coordinates pending field survey",
        ];
        return acc;
      }, {}),
    []
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

      <div className="mt-4 h-[calc(100vh-320px)] min-h-[460px] overflow-auto rounded-2xl border border-slate-200 bg-white">
        <div className="sticky top-0 z-10 hidden grid-cols-[1.35fr_1fr_1fr_0.9fr_0.8fr_1fr] gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 backdrop-blur md:grid">
          <div>Owner details</div>
          <div>Land details</div>
          <div>Land mapping</div>
          <div>Harvest / Next crop</div>
          <div>Cluster</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.map((row) => {
            return (
              <div key={row.id} className="bg-white">
                <div className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition hover:bg-slate-50 md:grid-cols-[1.35fr_1fr_1fr_0.9fr_0.8fr_1fr] md:items-center md:gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Owner details</div>
                    <div className="mt-1 mb-2 flex items-center gap-2">
                      {row.sourceType === "pipeline" ? (
                        <span className="rounded-full bg-pink-50 px-2 py-1 text-[11px] font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
                          Pipeline
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                          Agent
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      <div><span className="font-semibold text-slate-900">Owner:</span> {row.ownerName}</div>
                      <div><span className="font-semibold text-slate-900">Contact:</span> {row.ownerContact}</div>
                      <div><span className="font-semibold text-slate-900">Acres:</span> {row.acresOfLand}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Land details</div>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      <div><span className="font-semibold text-slate-900">Land address:</span> {row.locationOfLand}</div>
                      <div><span className="font-semibold text-slate-900">Land area (in acres):</span> {row.acresOfLand}</div>
                      <div><span className="font-semibold text-slate-900">Type of paddy:</span> {row.paddyType}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Land mapping</div>
                    <LandMappingCell row={row} />
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Harvest / Next crop</div>
                    <div className="text-xs font-semibold text-slate-700">{prettyDate(row.expectedHarvestDate)}</div>
                    <div className="mt-0.5 text-xs text-slate-500">Next: {row.nextCropDate ? prettyDate(row.nextCropDate) : "Nil"}</div>
                    <div className="mt-1 text-xs text-slate-500">Distance: {row.distanceFromFacilityKm} km</div>
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
                          setShowHistoryModal(true);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">History - {selectedRow.id}</div>
                <div className="mt-1 text-sm text-slate-500">{selectedRow.landOwnerDetails}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <DetailItem label="Record ID" value={selectedRow.id} />
                <DetailItem label="Received from" value={selectedRow.receivedFrom} />
                <DetailItem label="Received at" value={selectedRow.receivedAt} />
                <DetailItem label="Owner" value={selectedRow.ownerName} />
                <DetailItem label="Owner contact" value={selectedRow.ownerContact} />
                <DetailItem label="Land details" value={selectedRow.landDetails} />
                <DetailItem label="Location of land" value={selectedRow.locationOfLand} />
                <DetailItem label="Land mapped" value={selectedRow.landMapped ? "Yes" : "No"} />
                <DetailItem label="Expected harvested date" value={prettyDate(selectedRow.expectedHarvestDate)} />
                <DetailItem label="Next crop date" value={selectedRow.nextCropDate ? prettyDate(selectedRow.nextCropDate) : "Nil"} />
                <DetailItem label="Distance from warehouse/plant" value={`${selectedRow.distanceFromFacilityKm} km`} />
                <div className="sm:col-span-2 xl:col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">History timeline</div>
                  <ul className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700">
                    {(historyById[selectedRow.id] || []).map((evt) => (
                      <li key={evt}>• {evt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
