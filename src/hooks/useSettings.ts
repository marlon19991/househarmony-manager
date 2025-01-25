import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  maxCleaningTasks: number;
  setMaxCleaningTasks: (limit: number) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      maxCleaningTasks: 15, // valor por defecto
      setMaxCleaningTasks: (limit) => set({ maxCleaningTasks: limit }),
    }),
    {
      name: "settings-storage",
    }
  )
); 