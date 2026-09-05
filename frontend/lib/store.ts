import { create } from "zustand";
import type { ExecutionResult } from "./types";

interface AppState {
  sessionId: string | null;
  imageIds: string[];
  lastResult: ExecutionResult | null;
  setSessionId: (id: string | null) => void;
  addImageId: (id: string) => void;
  clearImages: () => void;
  setLastResult: (result: ExecutionResult | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  imageIds: [],
  lastResult: null,
  setSessionId: (id) => set({ sessionId: id }),
  addImageId: (id) => set((state) => ({ imageIds: [...state.imageIds, id] })),
  clearImages: () => set({ imageIds: [] }),
  setLastResult: (result) => set({ lastResult: result }),
}));
