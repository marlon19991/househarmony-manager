import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from 'react';

interface Profile {
  id: number;
  name: string;
  icon: string;
}

interface ProfileStore {
  profiles: Profile[];
  loading: boolean;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Omit<Profile, "id">) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

const useProfiles = create<ProfileStore>()((set) => ({
  profiles: [],
  loading: false,

  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ profiles: data || [] });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error al cargar los perfiles');
    } finally {
      set({ loading: false });
    }
  },

  addProfile: async (profile) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        profiles: [...state.profiles, data],
      }));
      
      toast.success('Perfil creado exitosamente');
    } catch (error) {
      console.error('Error adding profile:', error);
      toast.error('Error al crear el perfil');
    }
  },

  updateProfile: async (profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: profile.name, icon: profile.icon })
        .eq('id', profile.id);

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) =>
          p.id === profile.id ? profile : p
        ),
      }));
      
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  },

  deleteProfile: async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.filter((profile) => profile.id !== id),
      }));
      
      toast.success('Perfil eliminado exitosamente');
    }
    catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Error al eliminar el perfil');
    }
  },
}));

// Custom hook to initialize profiles
export const useInitializeProfiles = () => {
  const fetchProfiles = useProfiles((state) => state.fetchProfiles);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
};

export default useProfiles;