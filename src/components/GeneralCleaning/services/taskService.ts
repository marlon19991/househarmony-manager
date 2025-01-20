import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const taskService = {
  async fetchTasks() {
    try {
      console.log('Fetching tasks from database...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select(`
          *,
          cleaning_task_states (
            completed
          )
        `)
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      console.log('Raw tasks data:', tasksData);

      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        description: task.description,
        completed: task.cleaning_task_states?.[0]?.completed ?? false,
        comment: task.comment ?? null
      }));

      console.log('Transformed tasks:', transformedTasks);
      return transformedTasks;
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      toast.error("Error al cargar las tareas");
      throw error;
    }
  },

  async createTask(description: string, comment: string) {
    try {
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

      return { ...newTask, completed: false };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(taskId: number, description: string, comment: string) {
    try {
      const { error } = await supabase
        .from('general_cleaning_tasks')
        .update({ description, comment })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: number) {
    try {
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) throw stateError;

      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async toggleTaskCompletion(taskId: number, completed: boolean) {
    try {
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
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }
};
