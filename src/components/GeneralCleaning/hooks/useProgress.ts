import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useProgress = (currentAssignee: string) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const updateProgress = async (tasks: Task[]) => {
    const percentage = calculateProgress(tasks);
    try {
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: currentAssignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (progressError) throw progressError;
      setCompletionPercentage(percentage);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Error al actualizar el progreso");
    }
  };

  return { completionPercentage, updateProgress };
};