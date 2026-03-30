import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ErpLayout from "./layout/ErpLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import AccessChoicePage from "./pages/entry/AccessChoicePage";
import LoginPage from "./pages/login/LoginPage";
import SettingsPage from "./pages/settings/SettingsPage";
import HrmsPage from "./pages/hrms/HrmsPage";
import CollectionPlanningPage from "./pages/operations/CollectionPlanningPage";
import FarmerPipelinePage from "./pages/operations/FarmerPipelinePage";
import LiveTrackingPage from "./pages/operations/LiveTrackingPage";
import { useCompanySession } from "./hooks/useCompanySession";
import RequirePermission from "./context/auth/RequirePermission";
import { usePermissions } from "./context/auth/usePermissions";
import { PERMISSIONS } from "./context/auth/permissions";

function RequireCompany({ company, children }) {
  if (!company) return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireAuth({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const {
    company,
    isAuthenticated,
    ready,
    completeOnboarding,
    loginToDashboard,
    logoutFromDashboard,
    resetCompany,
  } = useCompanySession();
  const perms = usePermissions({ company });

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccessChoicePage hasCompany={Boolean(company)} />} />

        <Route
          path="/onboarding"
          element={<OnboardingPage onComplete={completeOnboarding} />}
        />

        <Route
          path="/login"
          element={<LoginPage hasCompany={Boolean(company)} onLogin={loginToDashboard} />}
        />

        <Route
          element={
            <RequireCompany company={company}>
              <RequireAuth isAuthenticated={isAuthenticated}>
                <ErpLayout company={company} onReset={resetCompany} onLogout={logoutFromDashboard} />
              </RequireAuth>
            </RequireCompany>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage company={company} onReset={resetCompany} />}
          />

          <Route
            path="/hrms"
            element={
              <RequirePermission allow={perms.can(PERMISSIONS.MANAGE_SETTINGS)}>
                <HrmsPage />
              </RequirePermission>
            }
          />

          <Route
            path="/operations/collection-planning"
            element={<CollectionPlanningPage />}
          />

          <Route
            path="/operations/farmer-pipeline"
            element={<FarmerPipelinePage />}
          />

          <Route
            path="/operations/live-tracking"
            element={<LiveTrackingPage />}
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
