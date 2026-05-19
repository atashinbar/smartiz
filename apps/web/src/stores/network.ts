import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
}

export const useNetworkStore = create<NetworkState>()(() => {
  if (typeof window === "undefined") return { isOnline: true };

  window.addEventListener("online", () => useNetworkStore.setState({ isOnline: true }));
  window.addEventListener("offline", () => useNetworkStore.setState({ isOnline: false }));

  return { isOnline: navigator.onLine };
});
