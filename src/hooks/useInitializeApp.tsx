import { useEffect } from "react";
import useGroupStore from "@/stores/useGroupStore";
import useProfiles from "./useProfiles";

export const useInitializeApp = () => {
  const { fetchGroups } = useGroupStore();
  const { fetchProfiles } = useProfiles();

  useEffect(() => {
    fetchGroups();
    fetchProfiles();
  }, [fetchGroups, fetchProfiles]);
};

export default useInitializeApp;