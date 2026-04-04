import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { STORAGE_KEYS } from "../../lib/config/storageKeys";
import { readJson, writeJson } from "../../lib/storage/jsonStorage";

type ProjectRecord = {
  id: string;
  projectName: string;
  createdAt: string;
  company: any;
  credentials: {
    loginId: string;
    password: string;
  } | null;
};

type CreateProjectPageProps = {
  company: any;
  onSelectProject: (data: any, credentials: { loginId: string; password: string } | null) => void;
};

export default function CreateProjectPage({
  company,
  onSelectProject,
}: CreateProjectPageProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    organizationName: "",
    unitName: "",
    address: "",
    gst: "",
    pan: "",
    adminName: "",
    adminContact: "",
  });

  const defaultProjects: ProjectRecord[] = [
    {
      id: "project-20tpd-aai",
      projectName: "AAI Paddy Mill - 20TPD",
      createdAt: new Date("2026-03-01").toISOString(),
      company: {
        projectName: "AAI Paddy Mill - 20TPD",
        operatorName: "AAI Pvt Ltd",
        siteName: "20TPD Site",
        organizationName: "AAI Pvt Ltd",
        unitName: "20TPD Site",
        address: "Mumbai",
        gst: "27AAAAA0000A1Z5",
        pan: "AAAAA0000A",
        adminName: "Admin AAI",
        adminContact: "9876543210",
        role: "owner",
        targetTonnage: 20,
        equipment: [],
        opex: { labor: 0, fuel: 0, maintenance: 0, loading: 0, misc: 0 },
      },
      credentials: null,
    },
    {
      id: "project-5tpd-belleveti",
      projectName: "Belleveti Rice Unit - 5TPD",
      createdAt: new Date("2026-03-02").toISOString(),
      company: {
        projectName: "Belleveti Rice Unit - 5TPD",
        operatorName: "Belleveti",
        siteName: "5TPD Site",
        organizationName: "Belleveti",
        unitName: "5TPD Site",
        address: "Pune",
        gst: "27BBBBB1111B1Z6",
        pan: "BBBBB1111B",
        adminName: "Admin Belleveti",
        adminContact: "9876501234",
        role: "owner",
        targetTonnage: 5,
        equipment: [],
        opex: { labor: 0, fuel: 0, maintenance: 0, loading: 0, misc: 0 },
      },
      credentials: null,
    },
    {
      id: "project-10tpd-reliance",
      projectName: "Reliance Milling - 10TPD",
      createdAt: new Date("2026-03-03").toISOString(),
      company: {
        projectName: "Reliance Milling - 10TPD",
        operatorName: "Reliance",
        siteName: "10TPD Site",
        organizationName: "Reliance",
        unitName: "10TPD Site",
        address: "Navi Mumbai",
        gst: "27CCCCC2222C1Z7",
        pan: "CCCCC2222C",
        adminName: "Admin Reliance",
        adminContact: "9898989898",
        role: "owner",
        targetTonnage: 10,
        equipment: [],
        opex: { labor: 0, fuel: 0, maintenance: 0, loading: 0, misc: 0 },
      },
      credentials: null,
    },
  ];

  useEffect(() => {
    const saved = readJson(STORAGE_KEYS.PROJECTS, []);
    if (Array.isArray(saved) && saved.length > 0) {
      setProjects(saved);
      return;
    }

    setProjects(defaultProjects);
    writeJson(STORAGE_KEYS.PROJECTS, defaultProjects);
  }, []);

  const createProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const projectName = form.projectName.trim();
    const organizationName = form.organizationName.trim();
    const unitName = form.unitName.trim();
    const address = form.address.trim();
    const gst = form.gst.trim();
    const pan = form.pan.trim();
    const adminName = form.adminName.trim();
    const adminContact = form.adminContact.trim();

    if (!projectName || !organizationName || !unitName || !address || !gst || !pan || !adminName || !adminContact) {
      return;
    }

    const payload = {
      projectName,
      operatorName: organizationName,
      siteName: unitName,
      organizationName,
      unitName,
      address,
      gst,
      pan,
      adminName,
      adminContact,
      role: "owner",
      targetTonnage: 0,
      equipment: [],
      opex: {
        labor: 0,
        fuel: 0,
        maintenance: 0,
        loading: 0,
        misc: 0,
      },
    };

    const nextProjectId = `project-${Date.now()}`;
    const nextProject: ProjectRecord = {
      id: nextProjectId,
      projectName,
      createdAt: new Date().toISOString(),
      company: payload,
      credentials: null,
    };

    const nextProjects = [nextProject, ...projects];
    setProjects(nextProjects);
    writeJson(STORAGE_KEYS.PROJECTS, nextProjects);

    setShowCreateForm(false);
    setForm({
      projectName: "",
      organizationName: "",
      unitName: "",
      address: "",
      gst: "",
      pan: "",
      adminName: "",
      adminContact: "",
    });

    onSelectProject(payload, null);
    navigate("/onboarding", { replace: true, state: { projectId: nextProjectId } });
  };

  const openProject = (project: ProjectRecord) => {
    onSelectProject(project.company, project.credentials);
    
    // If project is new and onboarding not done (no credentials), go to onboarding
    if (!project.credentials) {
      navigate("/onboarding", { replace: true, state: { projectId: project.id } });
    } else {
      // Otherwise go directly to dashboard
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10" aria-label="Create Project page">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Project</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select an existing project or create a new one to continue.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => openProject(project)}
              className="rounded-2xl border border-border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-slate-900">{project.projectName}</div>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div><span className="font-medium text-slate-700">Organization:</span> {project.company?.organizationName}</div>
                <div><span className="font-medium text-slate-700">Unit:</span> {project.company?.unitName}</div>
                <div><span className="font-medium text-slate-700">Address:</span> {project.company?.address}</div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
              {company?.siteName && company.siteName === project.company?.siteName ? (
                <div className="mt-2 text-xs font-semibold text-emerald-700">Current project</div>
              ) : null}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold">+ Create Project</div>
          </button>
        </section>

        {showCreateForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900">Create Project</h2>
              <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={createProject}>
                <label className="text-sm sm:col-span-2">
                  <div className="mb-1 font-medium text-slate-700">Project Name</div>
                  <input
                    value={form.projectName}
                    onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Project Name"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">Organization name</div>
                  <input
                    value={form.organizationName}
                    onChange={(e) => setForm((prev) => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Organization"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">Unit Name</div>
                  <input
                    value={form.unitName}
                    onChange={(e) => setForm((prev) => ({ ...prev, unitName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Unit"
                    required
                  />
                </label>

                <label className="text-sm sm:col-span-2">
                  <div className="mb-1 font-medium text-slate-700">Address</div>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Address"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">GST</div>
                  <input
                    value={form.gst}
                    onChange={(e) => setForm((prev) => ({ ...prev, gst: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="GST Number"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">PAN</div>
                  <input
                    value={form.pan}
                    onChange={(e) => setForm((prev) => ({ ...prev, pan: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="PAN Number"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">Admin Name</div>
                  <input
                    value={form.adminName}
                    onChange={(e) => setForm((prev) => ({ ...prev, adminName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Admin"
                    required
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 font-medium text-slate-700">Admin Contact</div>
                  <input
                    value={form.adminContact}
                    onChange={(e) => setForm((prev) => ({ ...prev, adminContact: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                    placeholder="Contact Number"
                    required
                  />
                </label>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
