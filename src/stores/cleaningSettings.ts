import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CleaningSettings {
  maxTasks: number;
  setMaxTasks: (maxTasks: number) => void;
}

export const useCleaningSettings = create<CleaningSettings>()(
  persist(
    (set) => ({
      maxTasks: 15,
      setMaxTasks: (maxTasks) => set({ maxTasks }),
    }),
    {
      name: "cleaning-settings",
    }
  )
); 