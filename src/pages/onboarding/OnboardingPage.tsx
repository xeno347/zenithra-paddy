import React from "react";
import OnboardingPortal from "../../modules/onboarding/OnboardingPortal";

export default function OnboardingPage({ onComplete }) {
  return <OnboardingPortal onComplete={onComplete} />;
}
