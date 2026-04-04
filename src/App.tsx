import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ErpLayout from "./layout/ErpLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CreateProjectPage from "./pages/create-project/CreateProjectPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import SettingsPage from "./pages/settings/SettingsPage";
import HrmsPage from "./pages/hrms/HrmsPage";
import CollectionPlanningPage from "./pages/operations/CollectionPlanningPage";
import FarmerPipelinePage from "./pages/operations/FarmerPipelinePage";
import LiveTrackingPage from "./pages/operations/LiveTrackingPage";
import LandClusterPage from "./pages/operations/LandClusterPage";
import LogisticsManagement from "./pages/logistics/LogisticsManagement";
import FleetChart from "./pages/logistics/FleetChart";
import VehicleManagement from "./pages/logistics/VehicleManagement";
import { useCompanySession } from "./hooks/useCompanySession";
import RequirePermission from "./context/auth/RequirePermission";
import { usePermissions } from "./context/auth/usePermissions";
import { PERMISSIONS } from "./context/auth/permissions";

function RequireCompany({ company, children }) {
  if (!company) return <Navigate to="/create-project" replace />;
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
    activateProjectSession,
    loginToDashboard,
    logoutFromDashboard,
    resetCompany,
  } = useCompanySession();
  const perms = usePermissions({ company });

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/create-project" replace />} />

        <Route
          path="/create-project"
          element={
            <CreateProjectPage
              company={company}
              onSelectProject={activateProjectSession}
            />
          }
        />

        <Route
          path="/onboarding"
          element={<OnboardingPage onCompleteOnboarding={completeOnboarding} />}
        />

        <Route path="/login" element={<Navigate to="/create-project" replace />} />

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
            path="/operations/land-cluster"
            element={<LandClusterPage />}
          />

          <Route
            path="/operations/live-tracking"
            element={<LiveTrackingPage />}
          />

          <Route
            path="/logistics"
            element={<Navigate to="/logistics/management" replace />}
          />

          <Route
            path="/logistics/management"
            element={<LogisticsManagement />}
          />

          <Route
            path="/logistics/fleet-chart"
            element={<FleetChart />}
          />

          <Route
            path="/logistics/vehicle-management"
            element={<VehicleManagement />}
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
