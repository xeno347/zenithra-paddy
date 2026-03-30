import React from "react";

type SourceType = "pipeline" | "agent";

type PipelineRow = {
  id: string;
  sourceType: SourceType;
  receivedFrom: string;
  dataReceived: string;
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
  agentAvatar?: string;
};

const rows: PipelineRow[] = [
  {
    id: "PL-001",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - OCR + Risk Model",
    dataReceived: "Farmer profile, land docs (PDF), verification score: 92%",
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
  },
  {
    id: "AG-001",
    sourceType: "agent",
    receivedFrom: "Anita Verma (Field Agent)",
    dataReceived: "KYC correction, updated phone number, alternate nominee",
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
    agentAvatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "PL-002",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - Geo Match",
    dataReceived: "Geo-fence validation, nearest collection center suggestion",
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
  },
  {
    id: "AG-002",
    sourceType: "agent",
    receivedFrom: "Rahul Das (Zone Agent)",
    dataReceived: "Field visit note, crop health observation, next follow-up date",
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
      className="h-8 w-24"
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
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-700">{value}</div>
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
    <section className="min-h-[calc(100vh-160px)] rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">Farmer pipeline</div>
            <div className="mt-1 text-sm text-slate-500">Incoming records from AI pipelines and field agents with land intelligence and clustering actions.</div>
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

      <div className="mt-4 h-[calc(100vh-310px)] min-h-[460px] overflow-auto rounded-2xl border border-slate-200 bg-white">
        <div className="sticky top-0 z-10 hidden grid-cols-[1fr_1.1fr_1.3fr_2.4fr_90px_1.5fr] gap-3 border-b border-slate-200 bg-slate-100/95 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 backdrop-blur md:grid">
          <div>Source signal</div>
          <div>Data received from</div>
          <div>What data is being received</div>
          <div>Details</div>
          <div>Time</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 gap-3 px-4 py-4 transition hover:bg-slate-50/80 md:grid-cols-[1fr_1.1fr_1.3fr_2.4fr_90px_1.5fr] md:gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Source signal</div>
                <div className="mt-1 flex items-center gap-2">
                  {row.sourceType === "pipeline" ? (
                    <>
                      <PipelineSignal />
                      <span className="rounded-full bg-pink-50 px-2 py-1 text-[11px] font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
                        Pipeline (AI)
                      </span>
                    </>
                  ) : (
                    <>
                      <AgentAvatar name={row.receivedFrom} avatarUrl={row.agentAvatar} />
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                        Agent (Human)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Data received from</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">{row.receivedFrom}</div>
                <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{row.id}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">What data is being received</div>
                <div className="mt-0.5 text-sm leading-6 text-slate-600">{row.dataReceived}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Details</div>
                <div className="mt-0.5 grid grid-cols-1 gap-1.5 lg:grid-cols-2">
                  <DetailItem label="Land owner details" value={row.landOwnerDetails} />
                  <DetailItem label="Land details" value={row.landDetails} />
                  <DetailItem label="Acres of land" value={`${row.acresOfLand}`} />
                  <DetailItem label="Location of land" value={row.locationOfLand} />
                  <DetailItem label="Land mapped" value={row.landMapped ? "Yes" : "No"} />
                  <DetailItem label="Expected harvested date" value={row.expectedHarvestDate} />
                  <DetailItem label="Next crop date" value={row.nextCropDate || "Nil"} />
                  <DetailItem label="Distance from warehouse/plant" value={`${row.distanceFromFacilityKm} km`} />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Time</div>
                <div className="mt-0.5 rounded-lg bg-slate-100 px-2 py-1 text-center text-sm font-semibold text-slate-600">{row.receivedAt}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Actions</div>
                <div className="mt-1 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {clusterById[row.id] ? (
                    <>
                      <div className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        Cluster: {clusterById[row.id]}
                      </div>
                      <button
                        type="button"
                        onClick={() => clearCluster(row.id)}
                        className="rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Update cluster
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={clusterInputById[row.id] || ""}
                        onChange={(e) =>
                          setClusterInputById((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter cluster"
                        className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => saveCluster(row.id)}
                        className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
                      >
                        Save cluster
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
    </section>
  );
}
