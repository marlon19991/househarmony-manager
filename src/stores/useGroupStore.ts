import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
  addGroup: (group: Omit<Group, "id">) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
}

const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      selectedGroup: null,
      groups: [],
      loading: false,
      setSelectedGroup: (group) => set({ selectedGroup: group }),
      fetchGroups: async () => {
        set({ loading: true });
        try {
          const { data: groups, error } = await supabase
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
            `);

          if (error) throw error;

          if (groups) {
            const formattedGroups = groups.map(group => ({
              id: group.id,
              name: group.name,
              description: group.description || '',
              members: group.group_profiles?.map((gp: any) => gp.profiles.name) || []
            }));

            set({ groups: formattedGroups });
          }
        } catch (error) {
          console.error('Error fetching groups:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      addGroup: async (groupData) => {
        try {
          const { data: group, error } = await supabase
            .from('groups')
            .insert([{ 
              name: groupData.name, 
              description: groupData.description 
            }])
            .select()
            .single();

          if (error) throw error;

          if (group) {
            const newGroup = {
              id: group.id,
              name: group.name,
              description: group.description || '',
              members: []
            };
            set((state) => ({ groups: [...state.groups, newGroup] }));
          }
        } catch (error) {
          console.error('Error adding group:', error);
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

          set((state) => ({
            groups: state.groups.map((group) =>
              group.id === updatedGroup.id ? updatedGroup : group
            ),
            selectedGroup:
              state.selectedGroup?.id === updatedGroup.id
                ? updatedGroup
                : state.selectedGroup,
          }));
        } catch (error) {
          console.error('Error updating group:', error);
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

          set((state) => ({
            groups: state.groups.filter((group) => group.id !== groupId),
            selectedGroup:
              state.selectedGroup?.id === groupId ? null : state.selectedGroup,
          }));
        } catch (error) {
          console.error('Error deleting group:', error);
          throw error;
        }
      },
    }),
    {
      name: 'group-storage',
    }
  )
);

export default useGroupStore;