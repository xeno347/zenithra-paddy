import React from "react";
import DashboardPortal from "../portals/DashboardPortal";

export default function DashboardPage({ company }) {
  return <DashboardPortal company={company} />;
}
