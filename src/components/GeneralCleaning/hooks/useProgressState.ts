import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProgressState = () => {
  const [currentAssignee, setCurrentAssignee] = useState<string>("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading progress...');
      
      const { data, error: fetchError } = await supabase
        .from('general_cleaning_progress')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error loading progress:', fetchError);
        setError(fetchError.message);
        toast.error("Error al cargar el progreso");
        return;
      }

      if (data) {
        console.log('Progress loaded:', data);
        setCurrentAssignee(data.assignee);
        setCompletionPercentage(data.completion_percentage || 0);
      } else {
        console.log('No progress data found, setting default values');
        setCurrentAssignee("Sin asignar");
        setCompletionPercentage(0);
        
        // Create initial progress record if none exists
        const { error: insertError } = await supabase
          .from('general_cleaning_progress')
          .insert({
            assignee: "Sin asignar",
            completion_percentage: 0,
            last_updated: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating initial progress:', insertError);
          setError(insertError.message);
          toast.error("Error al crear el progreso inicial");
        }
      }
    } catch (error) {
      console.error('Error in loadProgress:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      toast.error("Error al cargar el progreso");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (assignee: string, percentage: number) => {
    try {
      setError(null);
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

      if (updateError) {
        console.error('Error updating progress:', updateError);
        setError(updateError.message);
        toast.error("Error al actualizar el progreso");
        return;
      }

      setCurrentAssignee(assignee);
      setCompletionPercentage(percentage);
      console.log('Progress updated successfully');
    } catch (error) {
      console.error('Error in updateProgress:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      toast.error("Error al actualizar el progreso");
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    currentAssignee,
    completionPercentage,
    isLoading,
    error,
    loadProgress,
    updateProgress
  };
};