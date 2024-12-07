import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
}

interface GroupStore {
  selectedGroup: Group | null;
  groups: Group[];
  setSelectedGroup: (group: Group | null) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: number) => void;
}

const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      selectedGroup: null,
      groups: [],
      setSelectedGroup: (group) => set({ selectedGroup: group }),
      setGroups: (groups) => set({ groups }),
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