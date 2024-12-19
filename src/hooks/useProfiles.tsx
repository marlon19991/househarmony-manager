import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: number;
  name: string;
  icon: string;
  email?: string;
  whatsapp_number?: string;
}

const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProfile = async (profile: Omit<Profile, "id">) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfiles(prev => [...prev, data]);
      toast.success('Perfil creado exitosamente');
    } catch (error) {
      console.error('Error adding profile:', error);
      toast.error('Error al crear el perfil');
      throw error;
    }
  };

  const updateProfile = async (profile: Profile) => {
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

      if (error) {
        throw error;
      }

      setProfiles(prev =>
        prev.map(p => (p.id === profile.id ? profile : p))
      );
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
      throw error;
    }
  };

  const deleteProfile = async (id: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProfiles(prev => prev.filter(p => p.id !== id));
      toast.success('Perfil eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Error al eliminar el perfil');
      throw error;
    }
  };

  return {
    profiles,
    loading,
    fetchProfiles,
    addProfile,
    updateProfile,
    deleteProfile
  };
};

export default useProfiles;