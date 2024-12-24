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

      // Delete existing states first to ensure a clean slate
      const { error: deleteError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .in('task_id', tasks.map(t => t.id));

      if (deleteError) throw deleteError;

      // Then create new uncompleted states for all tasks
      const { error: insertError } = await supabase
        .from('cleaning_task_states')
        .insert(
          tasks.map(task => ({
            task_id: task.id,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error resetting task states:', error);
      toast.error("Error al reiniciar el estado de las tareas");
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
      toast.error("Error al actualizar el estado de la tarea");
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
      toast.error("Error al obtener el estado de las tareas");
      throw error;
    }
  }
};