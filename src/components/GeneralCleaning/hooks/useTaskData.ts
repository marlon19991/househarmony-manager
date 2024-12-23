import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks and their states...');
      
      // Get all tasks with their latest state
      const { data: tasksData, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select(`
          id,
          description,
          comment,
          cleaning_task_states (
            completed,
            updated_at
          )
        `)
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
        toast.error("Error al cargar las tareas");
        return;
      }

      console.log('Raw tasks data:', tasksData);

      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        description: task.description,
        completed: task.cleaning_task_states?.[0]?.completed ?? false,
        comment: task.comment
      }));

      console.log('Transformed tasks:', transformedTasks);
      setTasks(transformedTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      toast.error("Error al cargar las tareas");
      setIsLoading(false);
    }
  };

  const resetAllTasks = async () => {
    try {
      console.log('Resetting all tasks...');
      
      // Delete all existing task states
      const { error: deleteError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .neq('task_id', 0); // Delete all records

      if (deleteError) {
        console.error('Error deleting task states:', deleteError);
        throw deleteError;
      }

      // Get all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksError) {
        console.error('Error getting tasks:', tasksError);
        throw tasksError;
      }

      // Create new uncompleted states for all tasks
      const newStates = tasks.map(task => ({
        task_id: task.id,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('cleaning_task_states')
        .insert(newStates);

      if (insertError) {
        console.error('Error creating new task states:', insertError);
        throw insertError;
      }

      // Reload tasks to update the UI
      await loadTasks();
      console.log('Tasks reset successfully');
    } catch (error) {
      console.error('Error in resetAllTasks:', error);
      toast.error("Error al reiniciar las tareas");
      throw error;
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return { tasks, setTasks, isLoading, resetAllTasks, loadTasks };
};