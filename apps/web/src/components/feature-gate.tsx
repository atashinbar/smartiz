import type { ReactNode } from "react";
import type { FeatureFlags } from "@smartiz/shared";
import { useFeature } from "../hooks/use-feature.js";

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  return useFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
