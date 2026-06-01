import { useFeaturesStore } from "../stores/features.js";
import type { FeatureFlags } from "@smartiz/shared";

export function useFeature(key: keyof FeatureFlags): boolean {
  return useFeaturesStore((s) => s.flags[key]);
}
