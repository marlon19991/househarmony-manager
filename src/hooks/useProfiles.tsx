import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
  id: number;
  name: string;
  icon: string;
}

interface ProfileStore {
  profiles: Profile[];
  addProfile: (profile: Omit<Profile, "id">) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (id: number) => void;
}

const useProfiles = create<ProfileStore>()(
  persist(
    (set) => ({
      profiles: [],
      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, { ...profile, id: state.profiles.length + 1 }],
        })),
      updateProfile: (updatedProfile) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        })),
      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== id),
        })),
    }),
    {
      name: 'profiles-storage',
    }
  )
);

export default useProfiles;