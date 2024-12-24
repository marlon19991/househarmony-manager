import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/Task";

export const taskService = {
  async toggleTaskState(taskId: number, completed: boolean) {
    const { error } = await supabase
      .from('cleaning_task_states')
      .upsert({ 
        task_id: taskId,
        completed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'task_id'
      });

    if (error) throw error;
  },

  async resetTaskStates() {
    const { error } = await supabase
      .from('cleaning_task_states')
      .update({ 
        completed: false,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async addTask(description: string, comment: string) {
    const { data: newTask, error: taskError } = await supabase
      .from('general_cleaning_tasks')
      .insert({
        description,
        comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) throw taskError;

    const { error: stateError } = await supabase
      .from('cleaning_task_states')
      .insert({
        task_id: newTask.id,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (stateError) throw stateError;

    return newTask;
  }
};