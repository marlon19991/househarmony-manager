import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

export const useCleaningProgress = () => {
  const [currentAssignee, setCurrentAssignee] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { profiles } = useProfiles();

  const calculateProgress = async (assignee: string) => {
    try {
      const { data: taskStates, error: taskStatesError } = await supabase
        .from('cleaning_task_states')
        .select('completed');

      if (taskStatesError) throw taskStatesError;

      const completedTasks = taskStates?.filter(state => state.completed)?.length || 0;
      const totalTasks = taskStates?.length || 0;
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } catch (error) {
      console.error('Error al calcular el progreso:', error);
      toast.error("Error al calcular el progreso");
      return 0;
    }
  };

  const updateProgress = async (assignee: string, percentage: number) => {
    try {
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
    } catch (error) {
      console.error('Error al actualizar el progreso:', error);
      toast.error("Error al actualizar el progreso");
    }
  };

  const loadProgress = async () => {
    try {
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

        const calculatedPercentage = await calculateProgress(progressData.assignee);
        
        setCurrentAssignee(progressData.assignee);
        setCompletionPercentage(calculatedPercentage);

        // Si el porcentaje calculado es diferente al almacenado, actualizarlo
        if (calculatedPercentage !== progressData.completion_percentage) {
          await updateProgress(progressData.assignee, calculatedPercentage);
        }
      } else {
        setCurrentAssignee("Sin asignar");
        setCompletionPercentage(0);
      }
    } catch (error) {
      console.error('Error al cargar el progreso:', error);
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
    calculateProgress,
    loadProgress
  };
};