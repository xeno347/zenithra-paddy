import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import OnboardingPage from "../pages/OnboardingPage";
import AssetsPage from "../pages/Assets/AssetsPage";
import OpexPage from "../pages/Opex/OpexPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import SettingsPage from "../pages/Settings/SettingsPage";
import { useCompanySession } from "./useCompanySession";
import ErpLayout from "../layouts/ErpLayout";
import RequirePermission from "./auth/RequirePermission";
import { usePermissions } from "./auth/usePermissions";
import { PERMISSIONS } from "./auth/permissions";

function RequireCompany({ company, children }) {
  if (!company) return <Navigate to="/onboarding" replace />;
  return children;
}

function RedirectHome({ company }) {
  return <Navigate to={company ? "/dashboard" : "/onboarding"} replace />;
}

export default function ErpShell() {
  const { company, ready, completeOnboarding, resetCompany } = useCompanySession();
  const perms = usePermissions({ company });

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectHome company={company} />} />

        <Route
          path="/onboarding"
          element={<OnboardingPage onComplete={completeOnboarding} />}
        />

        <Route
          element={
            <RequireCompany company={company}>
              <ErpLayout company={company} onReset={resetCompany} />
            </RequireCompany>
          }
        >
          <Route path="/dashboard" element={<DashboardPage company={company} />} />

          <Route
            path="/assets"
            element={
              <RequirePermission allow={perms.can(PERMISSIONS.VIEW_ASSETS)}>
                <AssetsPage />
              </RequirePermission>
            }
          />

          <Route
            path="/opex"
            element={
              <RequirePermission allow={perms.can(PERMISSIONS.VIEW_OPEX)}>
                <OpexPage />
              </RequirePermission>
            }
          />

          <Route
            path="/reports"
            element={
              <RequirePermission allow={perms.can(PERMISSIONS.VIEW_REPORTS)}>
                <ReportsPage />
              </RequirePermission>
            }
          />

          <Route
            path="/settings"
            element={
              <RequirePermission allow={perms.can(PERMISSIONS.MANAGE_SETTINGS)}>
                <SettingsPage />
              </RequirePermission>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
