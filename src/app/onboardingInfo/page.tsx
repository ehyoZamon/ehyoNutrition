import { Suspense } from "react";
import OnboardingInfoClient from "./onboardingInfoClient";

export default function OnboardingInfoPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingInfoClient />
    </Suspense>
  );
}
