import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import useGroupStore from "@/stores/useGroupStore";

export const useInitializeProfiles = () => {
  const { fetchGroups } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);
};

export default useInitializeProfiles;