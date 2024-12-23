import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

export const useCleaningProgress = () => {
  const [currentAssignee, setCurrentAssignee] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { profiles } = useProfiles();

  const updateProgress = async (assignee: string, percentage: number) => {
    try {
      console.log('Updating progress:', { assignee, percentage });
      
      const { error: updateError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (updateError) throw updateError;
      
      console.log('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Error al actualizar el progreso");
      throw error;
    }
  };

  const loadProgress = async () => {
    try {
      console.log('Loading progress...');
      
      const { data: progressData, error: progressError } = await supabase
        .from('general_cleaning_progress')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (progressError) throw progressError;

      if (progressData) {
        const assigneeExists = progressData.assignee === "Sin asignar" || 
                             profiles.some(profile => profile.name === progressData.assignee);
        
        if (!assigneeExists) {
          setCurrentAssignee("Sin asignar");
          setCompletionPercentage(0);
          return;
        }

        console.log('Progress loaded:', progressData);
        setCurrentAssignee(progressData.assignee);
        setCompletionPercentage(progressData.completion_percentage || 0);
      } else {
        console.log('No progress data found, setting default values');
        setCurrentAssignee("Sin asignar");
        setCompletionPercentage(0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error("Error al cargar el progreso");
    }
  };

  useEffect(() => {
    if (profiles.length > 0 && currentAssignee === null) {
      loadProgress();
    }
  }, [profiles, currentAssignee]);

  return {
    currentAssignee,
    completionPercentage,
    setCurrentAssignee,
    setCompletionPercentage,
    updateProgress,
    loadProgress
  };
};