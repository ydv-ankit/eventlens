import type { Project } from "@/types/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectStore {
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      selectedProject: null,
      setSelectedProject: (p) => set({ selectedProject: p }),
    }),
    { name: "eventlens-project" },
  ),
);
