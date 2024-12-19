import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
}

interface GroupStore {
  selectedGroup: Group | null;
  groups: Group[];
  loading: boolean;
  setSelectedGroup: (group: Group | null) => void;
  fetchGroups: () => Promise<void>;
  addGroup: (groupData: { name: string; description: string }) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
}

const useGroupStore = create<GroupStore>((set, get) => ({
  selectedGroup: null,
  groups: [],
  loading: false,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  fetchGroups: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          group_profiles (
            profiles (
              name
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) {
        set({ groups: [], loading: false });
        return;
      }

      const formattedGroups = data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        members: (group.group_profiles || []).map((gp: any) => gp.profiles?.name).filter(Boolean)
      }));

      set({ groups: formattedGroups });
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Error al cargar los grupos');
    } finally {
      set({ loading: false });
    }
  },

  addGroup: async (groupData) => {
    try {
      const { data: newGroup, error } = await supabase
        .from('groups')
        .insert([{ 
          name: groupData.name, 
          description: groupData.description 
        }])
        .select('id, name, description')
        .single();

      if (error) throw error;

      if (newGroup) {
        const formattedGroup = {
          id: newGroup.id,
          name: newGroup.name,
          description: newGroup.description || '',
          members: []
        };
        
        set({ groups: [...get().groups, formattedGroup] });
        toast.success('Grupo creado exitosamente');
      }
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Error al crear el grupo');
      throw error;
    }
  },

  updateGroup: async (updatedGroup) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ 
          name: updatedGroup.name,
          description: updatedGroup.description
        })
        .eq('id', updatedGroup.id);

      if (error) throw error;

      const currentGroups = get().groups;
      set({
        groups: currentGroups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        ),
      });
      
      toast.success('Grupo actualizado exitosamente');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Error al actualizar el grupo');
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      const currentGroups = get().groups;
      set({
        groups: currentGroups.filter((group) => group.id !== groupId),
        selectedGroup: get().selectedGroup?.id === groupId ? null : get().selectedGroup
      });
      
      toast.success('Grupo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Error al eliminar el grupo');
      throw error;
    }
  },
}));

export default useGroupStore;