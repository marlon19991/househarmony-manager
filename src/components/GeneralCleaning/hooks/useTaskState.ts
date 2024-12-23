import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks with states...');
      const { data, error } = await supabase
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

      if (error) throw error;

      const transformedTasks = data.map(task => ({
        id: task.id,
        description: task.description,
        completed: task.cleaning_task_states?.[0]?.completed ?? false,
        comment: task.comment
      }));

      console.log('Transformed tasks:', transformedTasks);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error("Error al cargar las tareas");
    } finally {
      setIsLoading(false);
    }
  };

  const resetTaskStates = async () => {
    try {
      console.log('Resetting all task states...');
      
      // Primero eliminamos todos los estados existentes
      const { error: deleteError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .neq('task_id', 0);

      if (deleteError) throw deleteError;

      // Luego creamos nuevos estados para todas las tareas
      const newStates = tasks.map(task => ({
        task_id: task.id,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('cleaning_task_states')
        .insert(newStates);

      if (insertError) throw insertError;

      // Actualizamos el estado local
      setTasks(tasks.map(task => ({ ...task, completed: false })));
      
      console.log('Task states reset successfully');
    } catch (error) {
      console.error('Error resetting task states:', error);
      toast.error("Error al reiniciar las tareas");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    setTasks,
    isLoading,
    loadTasks,
    resetTaskStates
  };
};