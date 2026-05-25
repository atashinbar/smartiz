import { create } from "zustand";
import { getFeatureFlags, type FeatureFlags } from "@smartiz/shared";

interface FeaturesState {
  flags: FeatureFlags;
  init: () => void;
}

export const useFeaturesStore = create<FeaturesState>()((set) => ({
  flags: getFeatureFlags({ NODE_ENV: import.meta.env.MODE }),
  init: () => {
    set({ flags: getFeatureFlags({ NODE_ENV: import.meta.env.MODE }) });
  },
}));
