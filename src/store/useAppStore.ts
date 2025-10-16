"use client";

import { create } from "zustand";
import { NotionSyncState } from "@/lib/types";

interface AppState {
  selectedClusterId: string | null;
  notionStatus: NotionSyncState;
  showOnboarding: boolean;
  setSelectedClusterId: (id: string | null) => void;
  setNotionStatus: (status: NotionSyncState) => void;
  dismissOnboarding: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedClusterId: null,
  notionStatus: "DISCONNECTED",
  showOnboarding: true,
  setSelectedClusterId: (id) => set({ selectedClusterId: id }),
  setNotionStatus: (status) => set({ notionStatus: status }),
  dismissOnboarding: () => set({ showOnboarding: false }),
  reset: () =>
    set({
      selectedClusterId: null,
      notionStatus: "DISCONNECTED",
      showOnboarding: true,
    }),
}));
