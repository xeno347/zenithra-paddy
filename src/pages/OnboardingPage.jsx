import React from "react";
import OnboardingPortal from "../portals/OnboardingPortal";

export default function OnboardingPage({ onComplete }) {
  return <OnboardingPortal onComplete={onComplete} />;
}
