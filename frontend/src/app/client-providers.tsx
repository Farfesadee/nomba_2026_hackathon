"use client";

import { AIAssistant } from "@/components/shared/ai-assistant";
import { OnboardingGuide } from "@/components/shared/onboarding-guide";

export function ClientProviders() {
  return (
    <>
      <OnboardingGuide />
      <AIAssistant />
    </>
  );
}
