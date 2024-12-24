import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import { taskService } from "../services/taskService";

export const useTaskData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await taskService.fetchTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      toast.error("Error al cargar las tareas");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllTasks = async () => {
    try {
      console.log('Resetting all tasks...');
      
      // First get all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        // Delete all existing states
        const { error: deleteError } = await supabase
          .from('cleaning_task_states')
          .delete()
          .in('task_id', tasks.map(t => t.id));

        if (deleteError) throw deleteError;

        // Create new uncompleted states for all tasks
        const newTaskStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert(newTaskStates);

        if (insertError) throw insertError;

        // Reload tasks to update UI
        await loadTasks();
        console.log('Tasks reset successfully');
      }
    } catch (error) {
      console.error('Error resetting tasks:', error);
      toast.error("Error al reiniciar las tareas");
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cleaning_task_states'
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tasks, setTasks, isLoading, resetAllTasks, loadTasks };
};