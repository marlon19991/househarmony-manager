import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from 'react';
import { ProfileFormData } from '@/components/Settings/ProfileForm';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileStore {
  profiles: Profile[];
  loading: boolean;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Omit<ProfileFormData, "id">) => Promise<void>;
  updateProfile: (profile: ProfileFormData) => Promise<void>;
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
        .update({ 
          name: profile.name, 
          icon: profile.icon,
          email: profile.email,
          whatsapp_number: profile.whatsapp_number 
        })
        .eq('id', profile.id);

      if (error) throw error;

      set((state) => ({
        profiles: state.profiles.map((p) =>
          p.id === profile.id ? { ...p, ...profile } : p
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

export const useInitializeProfiles = () => {
  const fetchProfiles = useProfiles((state) => state.fetchProfiles);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
};

export default useProfiles;