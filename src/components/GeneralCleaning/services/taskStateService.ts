import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const taskStateService = {
  async resetTaskStates() {
    try {
      // First get all task IDs
      const { data: tasks, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) return;

      // Then update all task states to uncompleted
      const { error: updateError } = await supabase
        .from('cleaning_task_states')
        .upsert(
          tasks.map(task => ({
            task_id: task.id,
            completed: false,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'task_id' }
        );

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error resetting task states:', error);
      throw error;
    }
  },

  async updateTaskState(taskId: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('cleaning_task_states')
        .upsert(
          {
            task_id: taskId,
            completed,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'task_id' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task state:', error);
      throw error;
    }
  },

  async getTaskStates() {
    try {
      const { data, error } = await supabase
        .from('cleaning_task_states')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting task states:', error);
      throw error;
    }
  }
};