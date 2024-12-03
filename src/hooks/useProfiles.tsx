import { create } from 'zustand';

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

const useProfiles = create<ProfileStore>((set) => ({
  profiles: [
    { id: 1, name: "Juan", icon: "/placeholder.svg" },
    { id: 2, name: "María", icon: "/placeholder.svg" },
  ],
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
}));

export default useProfiles;