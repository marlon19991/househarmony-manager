import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const taskStateService = {
  async resetTaskStates() {
    try {
      const { error } = await supabase
        .from('cleaning_task_states')
        .update({ completed: false, updated_at: new Date().toISOString() });
      
      if (error) throw error;
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