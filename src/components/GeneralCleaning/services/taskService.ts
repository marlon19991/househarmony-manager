import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const taskService = {
  async createTask(task: Omit<Task, 'id'>) {
    try {
      // First create the task
      const { data: newTask, error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .insert({
          description: task.description,
          comment: task.comment
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Then create its state
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .insert({
          task_id: newTask.id,
          completed: false
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
        .update({
          description,
          comment
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async updateTaskState(taskId: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('cleaning_task_states')
        .upsert({
          task_id: taskId,
          completed,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task state:', error);
      throw error;
    }
  },

  async deleteTask(taskId: number) {
    try {
      // First delete task states
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) throw stateError;

      // Then delete the task
      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};