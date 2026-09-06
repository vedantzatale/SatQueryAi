import { create } from "zustand";
import type { ExecutionResult } from "./types";

export interface PendingAttachment {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  sizeBytes?: number;
  type: "optical" | "sar" | "multispectral" | "unknown";
  role?: "before" | "after" | "optical" | "sar" | "single";
  sensor?: string;
  resolution?: string;
}

interface AppState {
  sessionId: string | null;
  activeSessionTitle: string;
  imageIds: string[];
  pendingAttachments: PendingAttachment[];
  lastResult: ExecutionResult | null;
  isTemporaryChat: boolean;
  shareModalOpen: boolean;
  mapModalOpen: boolean;
  activeEvidenceImage: { url: string; label?: string } | null;

  setSessionId: (id: string | null) => void;
  setActiveSessionTitle: (title: string) => void;
  addImageId: (id: string) => void;
  clearImages: () => void;
  addPendingAttachment: (attachment: PendingAttachment) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;
  setLastResult: (result: ExecutionResult | null) => void;
  setIsTemporaryChat: (isTemp: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setMapModalOpen: (open: boolean) => void;
  setActiveEvidenceImage: (img: { url: string; label?: string } | null) => void;
  resetConversationState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  activeSessionTitle: "New Analysis",
  imageIds: [],
  pendingAttachments: [],
  lastResult: null,
  isTemporaryChat: false,
  shareModalOpen: false,
  mapModalOpen: false,
  activeEvidenceImage: null,

  setSessionId: (id) => set({ sessionId: id }),
  setActiveSessionTitle: (title) => set({ activeSessionTitle: title }),
  addImageId: (id) => set((state) => ({ imageIds: [...state.imageIds, id] })),
  clearImages: () => set({ imageIds: [] }),
  addPendingAttachment: (attachment) =>
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, attachment],
    })),
  removePendingAttachment: (id) =>
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((a) => a.id !== id),
    })),
  clearPendingAttachments: () => set({ pendingAttachments: [] }),
  setLastResult: (result) => set({ lastResult: result }),
  setIsTemporaryChat: (isTemp) => set({ isTemporaryChat: isTemp }),
  setShareModalOpen: (open) => set({ shareModalOpen: open }),
  setMapModalOpen: (open) => set({ mapModalOpen: open }),
  setActiveEvidenceImage: (img) => set({ activeEvidenceImage: img }),
  resetConversationState: () =>
    set({
      sessionId: null,
      activeSessionTitle: "New Analysis",
      imageIds: [],
      pendingAttachments: [],
      lastResult: null,
      isTemporaryChat: false,
    }),
}));
