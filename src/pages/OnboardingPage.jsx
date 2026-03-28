import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingPortal from "../portals/OnboardingPortal";

export default function OnboardingPage({ onComplete }) {
  const navigate = useNavigate();

  return (
    <OnboardingPortal
      onComplete={(data) => {
        onComplete?.(data);
        navigate("/dashboard", { replace: true });
      }}
    />
  );
}
