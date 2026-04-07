import React from "react";
import FinancialsPortal from "../../modules/core/FinancialsPortal";

export default function FinancialsPage({ company }: { company?: unknown }) {
  return <FinancialsPortal company={company as any} />;
}
