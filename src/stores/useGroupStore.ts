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
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: number) => void;
}

const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      selectedGroup: null,
      groups: [],
      loading: false,
      setSelectedGroup: (group) => set({ selectedGroup: group }),
      fetchGroups: async () => {
        set({ loading: true });
        try {
          const { data: groups } = await supabase
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
        } finally {
          set({ loading: false });
        }
      },
      addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (updatedGroup) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          ),
          selectedGroup:
            state.selectedGroup?.id === updatedGroup.id
              ? updatedGroup
              : state.selectedGroup,
        })),
      deleteGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== groupId),
          selectedGroup:
            state.selectedGroup?.id === groupId ? null : state.selectedGroup,
        })),
    }),
    {
      name: 'group-storage',
    }
  )
);

export default useGroupStore;