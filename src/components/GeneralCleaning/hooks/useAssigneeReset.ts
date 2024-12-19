import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useAssigneeReset = () => {
  const resetTaskStates = async (tasks: Task[]) => {
    try {
      // Actualizar todos los estados de las tareas a no completadas
      const { error } = await supabase
        .from('cleaning_task_states')
        .upsert(
          tasks.map(task => ({
            task_id: task.id,
            completed: false,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'task_id' }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting task states:', error);
      return false;
    }
  };

  const resetProgress = async (newAssignee: string) => {
    try {
      const { error } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  };

  return {
    resetTaskStates,
    resetProgress
  };
};