import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

export type FarmerCredentials = {
  loginId: string;
  password: string;
};

type CredentialsDialogProps = {
  farmerId: string;
  credentials?: FarmerCredentials | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: FarmerCredentials) => void;
  entity?: string;
  role?: string;
};

export default function CredentialsDialog({
  farmerId,
  credentials,
  open,
  onOpenChange,
  onSaved,
  entity = "staff",
  role = "",
}: CredentialsDialogProps) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoginId(credentials?.loginId || "");
    setPassword(credentials?.password || "");
  }, [credentials, open]);

  function save() {
    if (!loginId.trim() || !password.trim()) return;
    onSaved({ loginId: loginId.trim(), password: password.trim() });
    onOpenChange(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        <KeyRound className="h-3.5 w-3.5" />
        {credentials ? "View" : "Set"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-8 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">{entity} Credentials</h3>
            <p className="mt-1 text-xs text-slate-600">ID: {farmerId} {role ? `| Role: ${role}` : ""}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-2">Login ID</span>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. staff@paddy"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-2">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter password"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-primary hover:opacity-90 px-4 py-2.5 text-sm font-medium text-white transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
