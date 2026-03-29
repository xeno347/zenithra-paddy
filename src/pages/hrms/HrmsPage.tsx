import { useEffect, useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  X,
  Eye,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  Users,
  IndianRupee,
  Clock3,
  ClipboardCheck,
  UsersRound,
  UserPlus,
  Image as ImageIcon,
  IdCard,
  Landmark,
  Hash,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import CredentialsDialog, { type FarmerCredentials } from "../../components/farmers/CredentialsDialog";

interface StaffApiItem {
  staff_id: string;
  created_at: string;
  account_details: {
    bank_name: string;
    ifsc_code: string;
    account_number: string;
  };
  assigned_blocks: unknown[];
  assigned_vehicles: unknown[];
  staff_information: {
    staff_name: string;
    employment_type: "Permanent" | "Contract" | "Temporary" | string;
    staff_phone: string;
    staff_department: string;
    staff_designation: string;
  };
  attendance_details: {
    shift_name: string;
    weekly_off: string;
    attendance_mode: "Biometric" | "Manual" | "App";
    joining_date: string;
  };
  payroll_details: {
    monthly_salary: number;
    pay_cycle: "Monthly" | "Bi-Weekly";
    bank_name: string;
    ifsc_code: string;
    account_number: string;
  };
  team_name?: string;
  credentials?: FarmerCredentials | null;
}

type TeamItem = {
  team_id: string;
  team_name: string;
  lead_staff_id: string;
  worker_ids: string[];
};

const DUMMY_STAFF: StaffApiItem[] = [
  {
    staff_id: "STF-1001",
    created_at: "2026-01-06T09:00:00.000Z",
    account_details: {
      bank_name: "State Bank of India",
      ifsc_code: "SBIN0001234",
      account_number: "1234567890",
    },
    assigned_blocks: ["North Block"],
    assigned_vehicles: ["TR-01"],
    staff_information: {
      staff_name: "Ramesh Yadav",
      employment_type: "Permanent",
      staff_phone: "+91 9876543210",
      staff_department: "Operations",
      staff_designation: "Supervisor",
    },
    attendance_details: {
      shift_name: "Morning",
      weekly_off: "Sunday",
      attendance_mode: "Biometric",
      joining_date: "2026-01-02",
    },
    payroll_details: {
      monthly_salary: 28000,
      pay_cycle: "Monthly",
      bank_name: "State Bank of India",
      ifsc_code: "SBIN0001234",
      account_number: "1234567890",
    },
    team_name: "Field Alpha",
    credentials: { loginId: "ramesh1001", password: "Paddy@451" },
  },
  {
    staff_id: "STF-1002",
    created_at: "2026-01-08T10:30:00.000Z",
    account_details: {
      bank_name: "HDFC Bank",
      ifsc_code: "HDFC0002187",
      account_number: "9988776655",
    },
    assigned_blocks: ["East Block"],
    assigned_vehicles: [],
    staff_information: {
      staff_name: "Suman Patel",
      employment_type: "Contract",
      staff_phone: "+91 9123456789",
      staff_department: "HR",
      staff_designation: "Executive",
    },
    attendance_details: {
      shift_name: "General",
      weekly_off: "Saturday",
      attendance_mode: "App",
      joining_date: "2026-01-05",
    },
    payroll_details: {
      monthly_salary: 24000,
      pay_cycle: "Monthly",
      bank_name: "HDFC Bank",
      ifsc_code: "HDFC0002187",
      account_number: "9988776655",
    },
    team_name: "Admin Core",
    credentials: { loginId: "suman1002", password: "Paddy@672" },
  },
  {
    staff_id: "STF-1003",
    created_at: "2026-01-12T08:45:00.000Z",
    account_details: {
      bank_name: "Axis Bank",
      ifsc_code: "UTIB0004567",
      account_number: "4567891230",
    },
    assigned_blocks: ["West Block"],
    assigned_vehicles: ["TR-09"],
    staff_information: {
      staff_name: "Arjun Singh",
      employment_type: "Permanent",
      staff_phone: "+91 9012345678",
      staff_department: "Logistics",
      staff_designation: "Driver",
    },
    attendance_details: {
      shift_name: "Evening",
      weekly_off: "Sunday",
      attendance_mode: "Manual",
      joining_date: "2026-01-10",
    },
    payroll_details: {
      monthly_salary: 22000,
      pay_cycle: "Bi-Weekly",
      bank_name: "Axis Bank",
      ifsc_code: "UTIB0004567",
      account_number: "4567891230",
    },
    team_name: "Transport Wing",
    credentials: { loginId: "arjun1003", password: "Paddy@321" },
  },
];

const DUMMY_TEAMS: TeamItem[] = [
  {
    team_id: "TEAM-01",
    team_name: "Field Alpha",
    lead_staff_id: "STF-1001",
    worker_ids: ["STF-1001", "STF-1003"],
  },
  {
    team_id: "TEAM-02",
    team_name: "Admin Core",
    lead_staff_id: "STF-1002",
    worker_ids: ["STF-1002"],
  },
];

const HrmsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<StaffApiItem[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [teams, setTeams] = useState<TeamItem[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [joiningDate, setJoiningDate] = useState("2026-01-02");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState<"Permanent" | "Contract" | "Temporary">("Permanent");

  const [shiftName, setShiftName] = useState("General");
  const [weeklyOff, setWeeklyOff] = useState("Sunday");
  const [attendanceMode, setAttendanceMode] = useState<"Biometric" | "Manual" | "App">("Biometric");

  const [monthlySalary, setMonthlySalary] = useState("18000");
  const [payCycle, setPayCycle] = useState<"Monthly" | "Bi-Weekly">("Monthly");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentialsDialogStaffId, setCredentialsDialogStaffId] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  const resetForm = () => {
    setFormStep(1);
    setEditingStaffId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setJoiningDate("2026-01-02");
    setDepartment("");
    setDesignation("");
    setEmploymentType("Permanent");
    setShiftName("General");
    setWeeklyOff("Sunday");
    setAttendanceMode("Biometric");
    setMonthlySalary("18000");
    setPayCycle("Monthly");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
  };

  const handleBulkUpload = () => {
    toast.success("Bulk upload simulated with local data");
  };

  function createStaffId() {
    return `STF-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function createTeamId() {
    return `TEAM-${Math.floor(10 + Math.random() * 90)}`;
  }

  useEffect(() => {
    setIsLoadingStaff(true);
    const t = setTimeout(() => {
      setStaffList(DUMMY_STAFF);
      setTeams(DUMMY_TEAMS);
      setIsLoadingStaff(false);
    }, 400);

    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = document.getElementById("add-staff-form") as HTMLFormElement | null;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const existing = editingStaffId
      ? staffList.find((s) => s.staff_id === editingStaffId)
      : null;

    const nextStaff: StaffApiItem = {
      staff_id: existing?.staff_id || createStaffId(),
      created_at: existing?.created_at || new Date().toISOString(),
      account_details: {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
      },
      assigned_vehicles: [],
      assigned_blocks: [],
      staff_information: {
        staff_name: fullName.trim(),
        staff_phone: phone.trim(),
        staff_department: department,
        staff_designation: designation,
        employment_type: employmentType,
      },
      attendance_details: {
        shift_name: shiftName,
        weekly_off: weeklyOff,
        attendance_mode: attendanceMode,
        joining_date: joiningDate,
      },
      payroll_details: {
        monthly_salary: Number(monthlySalary || 0),
        pay_cycle: payCycle,
        bank_name: bankName.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
        account_number: accountNumber.trim(),
      },
      credentials: existing?.credentials || null,
    };

    setIsSubmitting(true);
    setTimeout(() => {
      setStaffList((prev) => {
        if (!editingStaffId) return [nextStaff, ...prev];

        return prev.map((s) =>
          s.staff_id === editingStaffId
            ? {
                ...s,
                account_details: nextStaff.account_details,
                staff_information: nextStaff.staff_information,
                attendance_details: nextStaff.attendance_details,
                payroll_details: nextStaff.payroll_details,
              }
            : s
        );
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      resetForm();
      toast.success(editingStaffId ? "Employee updated in local HRMS data" : "New employee added in local HRMS data");
    }, 300);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleNextStep = () => {
    const form = document.getElementById("add-staff-form") as HTMLFormElement | null;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setFormStep((prev) => (prev === 1 ? 2 : 3));
  };

  const handleOpenModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const filteredStaff = staffList.filter((staff) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = staff.staff_information?.staff_name?.toLowerCase() ?? "";
    const id = staff.staff_id?.toLowerCase() ?? "";
    return name.includes(q) || id.includes(q);
  });

  const teamNameByStaffId = new Map<string, string>();
  teams.forEach((t) => {
    t.worker_ids.forEach((id) => teamNameByStaffId.set(id, t.team_name));
  });

  function toggleWorkerSelection(staffId: string) {
    setSelectedWorkerIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  }

  function createTeam() {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    if (!teamLeadId) {
      toast.error("Select a team lead");
      return;
    }
    if (selectedWorkerIds.length === 0) {
      toast.error("Select at least one worker");
      return;
    }

    const next: TeamItem = {
      team_id: createTeamId(),
      team_name: teamName.trim(),
      lead_staff_id: teamLeadId,
      worker_ids: selectedWorkerIds,
    };

    setTeams((prev) => [next, ...prev]);
    setTeamName("");
    setTeamLeadId("");
    setSelectedWorkerIds([]);
    toast.success("Team created in local data");
  }

  function handleViewStaff(staff: StaffApiItem) {
    toast.info(
      `${staff.staff_information.staff_name} | ${staff.staff_information.staff_designation} | ${staff.staff_information.staff_department}`
    );
  }

  function handleEditStaff(staff: StaffApiItem) {
    setEditingStaffId(staff.staff_id);
    setFormStep(1);
    setFullName(staff.staff_information.staff_name || "");
    setPhone(staff.staff_information.staff_phone || "");
    setEmail("");
    setJoiningDate(staff.attendance_details?.joining_date || "2026-01-02");
    setDepartment(staff.staff_information.staff_department || "");
    setDesignation(staff.staff_information.staff_designation || "");
    setEmploymentType((staff.staff_information.employment_type as "Permanent" | "Contract" | "Temporary") || "Permanent");
    setShiftName(staff.attendance_details?.shift_name || "General");
    setWeeklyOff(staff.attendance_details?.weekly_off || "Sunday");
    setAttendanceMode(staff.attendance_details?.attendance_mode || "Biometric");
    setMonthlySalary(String(staff.payroll_details?.monthly_salary ?? 18000));
    setPayCycle(staff.payroll_details?.pay_cycle || "Monthly");
    setBankName(staff.payroll_details?.bank_name || "");
    setAccountNumber(staff.payroll_details?.account_number || "");
    setIfscCode(staff.payroll_details?.ifsc_code || "");
    setIsAddModalOpen(true);
  }

  function handleDeleteStaff(staffId: string) {
    setStaffList((prev) => prev.filter((s) => s.staff_id !== staffId));
    setSelectedWorkerIds((prev) => prev.filter((id) => id !== staffId));
    setTeams((prev) =>
      prev
        .map((team) => ({
          ...team,
          worker_ids: team.worker_ids.filter((id) => id !== staffId),
          lead_staff_id: team.lead_staff_id === staffId ? "" : team.lead_staff_id,
        }))
        .filter((team) => team.worker_ids.length > 0)
    );

    if (teamLeadId === staffId) setTeamLeadId("");
    toast.success("Staff removed from local HRMS data");
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Onboarding</h1>
          <p className="text-muted-foreground mt-1">Manage employee profiles and onboarding.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkUpload}
            className="flex items-center gap-2 border border-border bg-white text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-card border border-border p-3 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Department</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Attendance</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Payroll</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Team</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Contact</th>
              <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Credentials</th>
              <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoadingStaff ? (
              <tr>
                <td className="px-6 py-8 text-center text-muted-foreground" colSpan={10}>
                  Loading staff...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-muted-foreground" colSpan={10}>
                  No staff found.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => {
                const staffName = staff.staff_information?.staff_name ?? "-";
                const staffDesignation = staff.staff_information?.staff_designation ?? "-";
                const staffDepartment = staff.staff_information?.staff_department ?? "-";
                const staffPhone = staff.staff_information?.staff_phone ?? "-";
                const attendance = staff.attendance_details;
                const payroll = staff.payroll_details;
                const teamLabel = teamNameByStaffId.get(staff.staff_id) || "-";

                return (
                  <tr key={staff.staff_id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {(staffName || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{staffName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{staffDesignation}</td>
                    <td className="px-6 py-4 text-muted-foreground">{staffDepartment}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700">
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                          <Clock3 className="h-3 w-3" />
                          {attendance.shift_name}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">{attendance.attendance_mode} | Off: {attendance.weekly_off}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700">
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          <IndianRupee className="h-3 w-3" />
                          {payroll.monthly_salary.toLocaleString("en-IN")}/mo
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">{payroll.pay_cycle}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        <UsersRound className="h-3 w-3" />
                        {teamLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{staffPhone}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CredentialsDialog
                        farmerId={staff.staff_id}
                        credentials={staff.credentials}
                        open={credentialsDialogStaffId === staff.staff_id}
                        onOpenChange={(nextOpen) => setCredentialsDialogStaffId(nextOpen ? staff.staff_id : null)}
                        onSaved={(next) =>
                          setStaffList((prev) =>
                            prev.map((s) => (s.staff_id === staff.staff_id ? { ...s, credentials: next } : s))
                          )
                        }
                        entity="staff"
                        role={staff.staff_information?.staff_designation ?? ""}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewStaff(staff)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditStaff(staff)}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff.staff_id)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWorkerSelection(staff.staff_id)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
                            selectedWorkerIds.includes(staff.staff_id)
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-slate-200 bg-slate-50 text-slate-700"
                          )}
                        >
                          <UsersRound className="h-3 w-3" />
                          {selectedWorkerIds.includes(staff.staff_id) ? "Selected" : "Select"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Create team of workers</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Selected workers from table: <span className="font-semibold">{selectedWorkerIds.length}</span>
            </div>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Team Name *</span>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Harvest Team A"
                className="w-full rounded-lg border border-input px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Team Lead *</span>
              <select
                value={teamLeadId}
                onChange={(e) => setTeamLeadId(e.target.value)}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm"
              >
                <option value="">Select lead</option>
                {staffList.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>
                    {s.staff_information.staff_name} ({s.staff_id})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Select workers</div>
            <div className="max-h-44 space-y-2 overflow-auto rounded-lg border border-input p-2">
              {staffList.map((s) => (
                <label key={s.staff_id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedWorkerIds.includes(s.staff_id)}
                    onChange={() => toggleWorkerSelection(s.staff_id)}
                  />
                  <span className="text-xs text-slate-700">{s.staff_information.staff_name}</span>
                  <span className="ml-auto text-[11px] text-slate-500">{s.staff_id}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={createTeam}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <UsersRound className="h-4 w-4" />
            Create Team
          </button>
        </section>

        <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Teams</h2>
          </div>

          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="rounded-lg border border-dashed border-input p-4 text-xs text-muted-foreground">
                No teams yet.
              </div>
            ) : (
              teams.map((team) => {
                const lead = staffList.find((s) => s.staff_id === team.lead_staff_id);
                return (
                  <div key={team.team_id} className="rounded-lg border border-input p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">{team.team_name}</div>
                      <div className="text-[11px] text-slate-500">{team.team_id}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Lead: {lead?.staff_information.staff_name || team.lead_staff_id}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">Workers: {team.worker_ids.length}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-2xl rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-xl text-foreground">{editingStaffId ? "Edit Employee" : "Add New Employee"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Step {formStep} of 3</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="add-staff-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formStep === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Profile Image</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
                        />
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Upload a clear face photo.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Aadhaar Card Photo</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
                        />
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Upload front side (preferred).</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name *</label>
                      <div className="relative">
                        <input
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="e.g. John Doe"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone *</label>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="+91 00000 00000"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="john@example.com"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Joining Date *</label>
                      <div className="relative">
                        <input
                          required
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Department *</label>
                      <div className="relative">
                        <select
                          required
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 appearance-none"
                        >
                          <option value="">Select department</option>
                          <option value="Admin">Admin</option>
                          <option value="Finance">Finance</option>
                          <option value="HR">HR</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Operations">Operations</option>
                        </select>
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Designation *</label>
                      <div className="relative">
                        <select
                          required
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 appearance-none"
                        >
                          <option value="">Select designation</option>
                          <option value="Driver">Driver</option>
                          <option value="Executive">Executive</option>
                          <option value="Field Manager">Field Manager</option>
                          <option value="Manager">Manager</option>
                          <option value="Operator">Operator</option>
                          <option value="Supervisor">Supervisor</option>
                        </select>
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {designation === "Driver" && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground">Driving Licence Photo</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Required for drivers.</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Employment Type</label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value as "Permanent" | "Contract" | "Temporary")}
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="Permanent">Permanent</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Link to User Account</label>
                      <div className="relative">
                        <select className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 appearance-none">
                          <option value="">Select user account (optional)</option>
                          <option value="user1">rajesh.kumar@sbr.com</option>
                          <option value="user2">amit.singh@sbr.com</option>
                        </select>
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Link this employee to a user account to enable self-service attendance.</p>
                    </div>
                  </>
                ) : formStep === 2 ? (
                  <>
                    <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Attendance Details (Row-wise)
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Joining Date *</label>
                      <div className="relative">
                        <input
                          required
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Shift *</label>
                      <div className="relative">
                        <select
                          required
                          value={shiftName}
                          onChange={(e) => setShiftName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10 appearance-none"
                        >
                          <option value="General">General</option>
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Night">Night</option>
                        </select>
                        <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Weekly Off *</label>
                      <input
                        required
                        value={weeklyOff}
                        onChange={(e) => setWeeklyOff(e.target.value)}
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Sunday"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Attendance Mode *</label>
                      <select
                        required
                        value={attendanceMode}
                        onChange={(e) => setAttendanceMode(e.target.value as "Biometric" | "Manual" | "App")}
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="Biometric">Biometric</option>
                        <option value="Manual">Manual</option>
                        <option value="App">App</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payroll Details (Row-wise)
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Monthly Salary (INR) *</label>
                      <div className="relative">
                        <input
                          required
                          inputMode="numeric"
                          value={monthlySalary}
                          onChange={(e) => setMonthlySalary(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="e.g. 25000"
                        />
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Pay Cycle *</label>
                      <select
                        required
                        value={payCycle}
                        onChange={(e) => setPayCycle(e.target.value as "Monthly" | "Bi-Weekly")}
                        className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Bank Name *</label>
                      <div className="relative">
                        <input
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="e.g. State Bank of India"
                        />
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Account Number *</label>
                      <div className="relative">
                        <input
                          required
                          inputMode="numeric"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                          placeholder="e.g. 1234567890"
                        />
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">IFSC Code *</label>
                      <div className="relative">
                        <input
                          required
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="e.g. SBIN0001234"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Used for bank transfers / salary payments.</p>
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-border bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>

              {formStep > 1 && (
                <button
                  type="button"
                  onClick={() => setFormStep((prev) => (prev === 3 ? 2 : 1))}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Back
                </button>
              )}

              {formStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  form="add-staff-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {isSubmitting ? "Saving..." : editingStaffId ? "Update Employee" : "Create Employee"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrmsPage;
