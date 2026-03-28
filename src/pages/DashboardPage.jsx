import React from "react";
import DashboardPortal from "../portals/DashboardPortal";

export default function DashboardPage({ company, onReset }) {
  return <DashboardPortal company={company} onReset={onReset} />;
}
