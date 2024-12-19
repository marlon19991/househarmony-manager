import { useEffect, useCallback } from "react";
import useGroupStore from "@/stores/useGroupStore";
import useProfiles from "./useProfiles";

export const useInitializeApp = () => {
  const fetchGroups = useGroupStore(state => state.fetchGroups);
  const fetchProfiles = useProfiles().fetchProfiles;

  // Memoize the initialization function
  const initialize = useCallback(async () => {
    await Promise.all([
      fetchGroups(),
      fetchProfiles()
    ]);
  }, [fetchGroups, fetchProfiles]);

  useEffect(() => {
    initialize();
  }, [initialize]); // Dependencies array includes the memoized initialize function
};

export default useInitializeApp;