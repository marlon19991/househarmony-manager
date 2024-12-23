import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProgressState = () => {
  const [currentAssignee, setCurrentAssignee] = useState<string>("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const loadProgress = async () => {
    try {
      console.log('Loading progress...');
      const { data, error } = await supabase
        .from('general_cleaning_progress')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log('Progress loaded:', data);
        setCurrentAssignee(data.assignee);
        setCompletionPercentage(data.completion_percentage || 0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error("Error al cargar el progreso");
    }
  };

  const updateProgress = async (assignee: string, percentage: number) => {
    try {
      console.log('Updating progress:', { assignee, percentage });
      const { error } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (error) throw error;

      setCurrentAssignee(assignee);
      setCompletionPercentage(percentage);
      console.log('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Error al actualizar el progreso");
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    currentAssignee,
    completionPercentage,
    loadProgress,
    updateProgress
  };
};