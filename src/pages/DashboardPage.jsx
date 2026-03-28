import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardPortal from "../portals/DashboardPortal";

export default function DashboardPage({ company, onReset }) {
  const navigate = useNavigate();

  return (
    <DashboardPortal
      company={company}
      onReset={() => {
        onReset?.();
        navigate("/onboarding", { replace: true });
      }}
    />
  );
}
