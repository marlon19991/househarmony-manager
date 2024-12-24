import { supabase } from "@/integrations/supabase/client";

export const taskService = {
  async toggleTaskState(taskId: number, completed: boolean) {
    const { error } = await supabase
      .from('cleaning_task_states')
      .update({ 
        completed,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId);

    if (error) throw error;
  },

  async resetTaskStates() {
    const { data: taskStates, error: fetchError } = await supabase
      .from('cleaning_task_states')
      .select('task_id');

    if (fetchError) throw fetchError;

    if (taskStates && taskStates.length > 0) {
      const { error: updateError } = await supabase
        .from('cleaning_task_states')
        .update({ 
          completed: false,
          updated_at: new Date().toISOString()
        })
        .in('task_id', taskStates.map(state => state.task_id));

      if (updateError) throw updateError;
    }
  },

  async addTask(description: string, comment: string) {
    const { data, error: taskError } = await supabase
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
        task_id: data.id,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (stateError) throw stateError;

    return data;
  }
};