import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

type TaskType = "Slasher" | "Racker" | "Bailer" | "Loader";
type TaskStatus = "Pending" | "Completed" | "Overdue";

type DayTask = {
  id: string;
  taskType: TaskType;
  fieldId: string;
  fieldOwnerName: string;
  fieldOwnerContact: string;
  areaAcres: number;
  status: TaskStatus;
};

function toKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeMonthCells(monthStart: Date) {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const startOffset = first.getDay();
  const totalDays = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function buildDummyTasks(monthStart: Date): Record<string, DayTask[]> {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const monthSeed = month + 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [
    1 + (monthSeed % 4),
    3 + (monthSeed % 6),
    7 + (monthSeed % 5),
    12 + (monthSeed % 7),
    18 + (monthSeed % 8),
    24 + (monthSeed % 6),
  ].filter((d) => d <= daysInMonth);

  const types: TaskType[] = ["Slasher", "Racker", "Bailer", "Loader"];
  const statuses: TaskStatus[] = ["Completed", "Pending", "Pending", "Overdue"];

  const ownerPool = [
    { name: "Ramesh Patil", phone: "+91 9876543210" },
    { name: "Suresh Pawar", phone: "+91 9822011122" },
    { name: "Anita Jadhav", phone: "+91 9819988877" },
    { name: "Dilip More", phone: "+91 9766123412" },
    { name: "Meena Kale", phone: "+91 9890012345" },
  ];

  const map: Record<string, DayTask[]> = {};

  days.forEach((day, idx) => {
    const taskCount = idx % 3 === 0 ? 2 : 1;
    const tasks: DayTask[] = Array.from({ length: taskCount }, (_, tIdx) => {
      const seq = idx + tIdx + monthSeed;
      const owner = ownerPool[seq % ownerPool.length];
      return {
        id: `T-${year}${String(month + 1).padStart(2, "0")}${String(day).padStart(2, "0")}-${tIdx + 1}`,
        taskType: types[seq % types.length],
        fieldId: `F-${100 + ((monthSeed * 17 + day + tIdx * 5) % 900)}`,
        fieldOwnerName: owner.name,
        fieldOwnerContact: owner.phone,
        areaAcres: [20, 22, 25, 28, 30][seq % 5],
        status: statuses[seq % statuses.length],
      };
    });

    map[toKey(new Date(year, month, day))] = tasks;
  });

  return map;
}

function statusClass(status: TaskStatus) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Overdue") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

export default function LiveTrackingPage() {
  const today = new Date();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const monthStarts = useMemo(
    () =>
      Array.from({ length: 8 }, (_, idx) => new Date(today.getFullYear(), today.getMonth() + idx, 1)),
    [today]
  );

  const tasksByDate = useMemo(() => {
    const merged: Record<string, DayTask[]> = {};
    monthStarts.forEach((monthStart) => {
      Object.assign(merged, buildDummyTasks(monthStart));
    });
    return merged;
  }, [monthStarts]);

  const selectedTasks = useMemo(
    () => (selectedDateKey ? tasksByDate[selectedDateKey] || [] : []),
    [selectedDateKey, tasksByDate]
  );

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return "";
    const date = new Date(selectedDateKey);
    if (Number.isNaN(date.getTime())) return selectedDateKey;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  }, [selectedDateKey]);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Cultivation Calendar</h1>
        <p className="mt-1 text-lg text-slate-500">Manage your cultivation schedule and track pending tasks.</p>
      </div>

      <div className="inline-flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded bg-emerald-500" /> All Done
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded bg-amber-300" /> Pending
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded bg-rose-300" /> Overdue
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {monthStarts.map((monthStart) => {
          const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
          const cells = makeMonthCells(monthStart);

          const monthTasks = cells
            .filter((d): d is Date => Boolean(d))
            .flatMap((d) => tasksByDate[toKey(d)] || []);

          const completed = monthTasks.filter((t) => t.status === "Completed").length;
          const completionPct = monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0;

          return (
            <div key={monthLabel} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xl font-medium text-slate-700">{monthLabel}</div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                  {completionPct}%
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] uppercase text-slate-400">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((date, idx) => {
                  if (!date) return <div key={`${monthLabel}-empty-${idx}`} className="h-10" />;

                  const key = toKey(date);
                  const tasks = tasksByDate[key] || [];

                  const hasOverdue = tasks.some((t) => t.status === "Overdue");
                  const hasPending = tasks.some((t) => t.status === "Pending");

                  const chipClass = hasOverdue
                    ? "bg-rose-100 text-rose-700 border-rose-200"
                    : hasPending
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : tasks.length > 0
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-transparent";

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDateKey(key)}
                      className={`relative h-10 rounded-lg border text-sm font-medium transition ${chipClass}`}
                      title={tasks.length > 0 ? `${tasks.length} task(s)` : "No tasks"}
                    >
                      {date.getDate()}
                      {tasks.length > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] font-semibold text-white">
                          {tasks.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={Boolean(selectedDateKey)} onOpenChange={(open) => !open && setSelectedDateKey(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedDateLabel}</DialogTitle>
          </DialogHeader>

          <div className="mb-3 text-sm text-slate-600">
            Total Tasks: <span className="font-semibold text-slate-900">{selectedTasks.length}</span>
            <span className="mx-2 text-slate-300">•</span>
            Pending: <span className="font-semibold text-amber-700">{selectedTasks.filter((t) => t.status === "Pending").length}</span>
            <span className="mx-2 text-slate-300">•</span>
            Completed: <span className="font-semibold text-emerald-700">{selectedTasks.filter((t) => t.status === "Completed").length}</span>
            <span className="mx-2 text-slate-300">•</span>
            Overdue: <span className="font-semibold text-rose-700">{selectedTasks.filter((t) => t.status === "Overdue").length}</span>
          </div>

          <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Field ID</th>
                  <th className="px-3 py-2 text-right">Assigned Acres</th>
                  <th className="px-3 py-2">Task status</th>
                </tr>
              </thead>
              <tbody>
                {selectedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                      No tasks assigned for this date.
                    </td>
                  </tr>
                ) : (
                  selectedTasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">{task.taskType}</div>
                        <div className="text-xs text-slate-500">
                          Owner: {task.fieldOwnerName} ({task.fieldOwnerContact})
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{task.fieldId}</td>
                      <td className="px-3 py-3 text-right font-medium text-slate-900">{task.areaAcres.toFixed(2)} Acres</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClass(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
