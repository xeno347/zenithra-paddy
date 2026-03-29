import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, LogIn } from "lucide-react";

type LoginPageProps = {
  hasCompany: boolean;
  onLogin: (loginId: string, password: string) => boolean;
};

export default function LoginPage({ hasCompany, onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const ok = onLogin(loginId, password);
    if (!ok) {
      setError("Invalid login ID or password.");
      return;
    }

    setError("");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <main className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <LogIn className="h-5 w-5" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-slate-900">Dashboard Login</h1>
          <p className="mt-1 text-sm text-slate-600">
            Use the login ID and password generated after onboarding.
          </p>

          {!hasCompany ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              No registered company found. Please complete onboarding first.
              <div className="mt-3">
                <Link
                  to="/onboarding"
                  className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Go to onboarding
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Login ID</span>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter login ID"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-700">Password</span>
                <div className="relative mt-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-border px-3 py-2 pr-10 text-sm text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
                  />
                  <KeyRound className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </label>

              {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Login to dashboard
              </button>
            </form>
          )}

          <div className="mt-5 text-xs text-slate-600">
            <Link to="/" className="font-semibold text-slate-800 hover:underline">
              Back to selection
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
