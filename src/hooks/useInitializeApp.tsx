import { useEffect } from "react";
import useGroupStore from "@/stores/useGroupStore";
import useProfiles from "./useProfiles";

export const useInitializeApp = () => {
  const fetchGroups = useGroupStore(state => state.fetchGroups);
  const { fetchProfiles } = useProfiles();

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          fetchGroups(),
          fetchProfiles()
        ]);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initialize();
  }, []); // Solo se ejecuta una vez al montar el componente
};

export default useInitializeApp;