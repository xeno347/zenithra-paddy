import React, { useMemo, useState } from "react";
import DashboardPage from "../pages/DashboardPage";
import OnboardingPage from "../pages/OnboardingPage";
import { useCompanySession } from "./useCompanySession";

function getInitialRoute() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const raw = hash.replace(/^#/, "");
  if (raw.startsWith("/")) return raw;
  return "/";
}

export default function ErpShell() {
  const { company, ready, completeOnboarding, resetCompany } = useCompanySession();
  const [route, setRoute] = useState(getInitialRoute);

  const resolvedRoute = useMemo(() => {
    if (route === "/" || !route) return company ? "/dashboard" : "/onboarding";
    return route;
  }, [route, company]);

  if (!ready) return null;

  if (resolvedRoute === "/onboarding") {
    return (
      <OnboardingPage
        onComplete={(data) => {
          completeOnboarding(data);
          setRoute("/dashboard");
          if (typeof window !== "undefined") window.location.hash = "#/dashboard";
        }}
      />
    );
  }

  return (
    <DashboardPage
      company={company}
      onReset={() => {
        resetCompany();
        setRoute("/onboarding");
        if (typeof window !== "undefined") window.location.hash = "#/onboarding";
      }}
    />
  );
}
