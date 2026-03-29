import React from "react";
import { Link } from "react-router-dom";
import { Building2, LogIn } from "lucide-react";

type AccessChoicePageProps = {
  hasCompany: boolean;
};

export default function AccessChoicePage({ hasCompany }: AccessChoicePageProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <main className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Zenithra Paddy ERP</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Select how you want to continue.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <LogIn className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Login to Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue to your ERP dashboard and open your modules.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {hasCompany
                ? "Saved company session found."
                : "No company session found. You can register first or continue to onboarding."}
            </p>
            <Link
              to={hasCompany ? "/login" : "/onboarding"}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {hasCompany ? "Go to Login" : "Continue to Onboarding"}
            </Link>
          </article>

          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Company Registration</h2>
            <p className="mt-2 text-sm text-slate-600">
              Register a new company or site to start using the ERP modules.
            </p>
            <Link
              to="/onboarding"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to Registration
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
}
