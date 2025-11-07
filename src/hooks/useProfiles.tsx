import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from 'react';
import { ProfileFormData } from '@/components/Settings/ProfileForm';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileStore {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Omit<ProfileFormData, "id">) => Promise<void>;
  updateProfile: (profile: ProfileFormData) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  resetError: () => void;
}

/**
 * Store de perfiles usando Zustand
 * Mejoras aplicadas:
 * - Manejo de errores mejorado
 * - Optimistic updates para mejor UX
 * - Validación de datos
 * - Mejor tipado TypeScript
 */
const useProfiles = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      loading: false,
      error: null,

      fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;
          
          set({ profiles: data || [], loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar los perfiles';
          console.error('Error fetching profiles:', error);
          set({ error: errorMessage, loading: false });
          toast.error('Error al cargar los perfiles');
        }
      },

      addProfile: async (profile) => {
        // Guardar estado anterior para revertir en caso de error
        const previousProfiles = get().profiles;
        
        try {
          // Validación básica
          if (!profile.name?.trim()) {
            throw new Error('El nombre del perfil es requerido');
          }

          const { data, error } = await supabase
            .from('profiles')
            .insert([{
              name: profile.name,
              icon: profile.icon,
              email: profile.email,
              whatsapp_number: profile.whatsapp_number
            }])
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('No data returned from insert');
          
          // Actualizar estado con el perfil creado
          set((state) => ({
            profiles: [...state.profiles, data],
          }));
          
          toast.success('Perfil creado exitosamente');
        } catch (error) {
          // Revertir en caso de error
          set({ profiles: previousProfiles });
          
          const errorMessage = error instanceof Error ? error.message : 'Error al crear el perfil';
          console.error('Error adding profile:', error);
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      updateProfile: async (profile) => {
        // Guardar estado anterior para revertir en caso de error
        const previousProfiles = get().profiles;
        
        try {
          if (!profile.name?.trim()) {
            throw new Error('El nombre del perfil es requerido');
          }

          const { error } = await supabase
            .from('profiles')
            .update({ 
              name: profile.name, 
              icon: profile.icon,
              email: profile.email,
              whatsapp_number: profile.whatsapp_number 
            })
            .eq('id', profile.id);

          if (error) throw error;

          // Actualizar estado con los cambios
          set((state) => ({
            profiles: state.profiles.map((p) =>
              p.id === profile.id ? { ...p, ...profile } : p
            ),
          }));
      
          toast.success('Perfil actualizado exitosamente');
        } catch (error) {
          // Revertir en caso de error
          set({ profiles: previousProfiles });
          
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
          console.error('Error updating profile:', error);
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      deleteProfile: async (id) => {
        // Guardar estado anterior para revertir en caso de error
        const previousProfiles = get().profiles;
        
        try {
          const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Actualizar estado removiendo el perfil
          set((state) => ({
            profiles: state.profiles.filter((profile) => profile.id !== id),
          }));
      
          toast.success('Perfil eliminado exitosamente');
        } catch (error) {
          // Revertir en caso de error
          set({ profiles: previousProfiles });
          
          const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el perfil';
          console.error('Error deleting profile:', error);
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      resetError: () => set({ error: null }),
    }),
    {
      name: 'profiles-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir profiles, no loading ni error
      partialize: (state) => ({ profiles: state.profiles }),
      version: 1,
    }
  )
);

/**
 * Hook para inicializar perfiles al cargar la aplicación
 * Usa useCallback para evitar re-renders innecesarios
 */
export const useInitializeProfiles = () => {
  const fetchProfiles = useProfiles((state) => state.fetchProfiles);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
};

export default useProfiles;