import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStore {
  maxCleaningTasks: number;
  setMaxCleaningTasks: (limit: number) => void;
}

/**
 * Store de configuración usando Zustand con persistencia
 * Mejoras aplicadas según mejores prácticas:
 * - Uso de createJSONStorage para mejor control
 * - Tipado TypeScript explícito
 * - Separación clara de estado y acciones
 */
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      maxCleaningTasks: 15, // valor por defecto
      setMaxCleaningTasks: (limit: number) => {
        if (limit < 1) {
          console.warn('El límite de tareas debe ser mayor a 0');
          return;
        }
        set({ maxCleaningTasks: limit });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir maxCleaningTasks
      partialize: (state) => ({ maxCleaningTasks: state.maxCleaningTasks }),
      version: 1,
    }
  )
); 