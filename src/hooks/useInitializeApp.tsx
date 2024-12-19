import { useEffect } from "react";
import useGroupStore from "@/stores/useGroupStore";
import useProfiles from "./useProfiles";

export const useInitializeApp = () => {
  const fetchGroups = useGroupStore(state => state.fetchGroups);
  const fetchProfiles = useProfiles().fetchProfiles;

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchGroups(),
        fetchProfiles()
      ]);
    };
    
    initialize();
  }, []); // Empty dependency array since we only want to run this once
};

export default useInitializeApp;