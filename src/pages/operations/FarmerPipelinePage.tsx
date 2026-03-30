import React from "react";

type SourceType = "pipeline" | "agent";

type PipelineRow = {
  id: string;
  sourceType: SourceType;
  receivedFrom: string;
  dataReceived: string;
  receivedAt: string;
  agentAvatar?: string;
};

const rows: PipelineRow[] = [
  {
    id: "PL-001",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - OCR + Risk Model",
    dataReceived: "Farmer profile, land docs (PDF), verification score: 92%",
    receivedAt: "10:25 AM",
  },
  {
    id: "AG-001",
    sourceType: "agent",
    receivedFrom: "Anita Verma (Field Agent)",
    dataReceived: "KYC correction, updated phone number, alternate nominee",
    receivedAt: "10:46 AM",
    agentAvatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "PL-002",
    sourceType: "pipeline",
    receivedFrom: "Pipeline AI - Geo Match",
    dataReceived: "Geo-fence validation, nearest collection center suggestion",
    receivedAt: "11:08 AM",
  },
  {
    id: "AG-002",
    sourceType: "agent",
    receivedFrom: "Rahul Das (Zone Agent)",
    dataReceived: "Field visit note, crop health observation, next follow-up date",
    receivedAt: "11:21 AM",
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

export default function FarmerPipelinePage() {
  return (
    <section className="min-h-[calc(100vh-160px)] rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <div className="text-sm font-semibold text-slate-900">Farmer pipeline</div>
        <div className="text-xs text-slate-500">Track incoming farmer data from AI pipelines and field agents.</div>
      </div>

      <div className="mt-4 h-[calc(100vh-270px)] min-h-[420px] overflow-auto rounded-xl border border-slate-200">
        <div className="hidden grid-cols-[1.6fr_2fr_1fr_90px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <div>Data received from</div>
          <div>What data is being received</div>
          <div>Source signal</div>
          <div>Time</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[1.6fr_2fr_1fr_90px] md:gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Data received from</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">{row.receivedFrom}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">What data is being received</div>
                <div className="mt-0.5 text-sm text-slate-600">{row.dataReceived}</div>
              </div>

              <div>
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
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">Time</div>
                <div className="mt-0.5 text-sm text-slate-500">{row.receivedAt}</div>
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
