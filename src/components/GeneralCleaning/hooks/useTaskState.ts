import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks from database...');
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select(`
          id,
          description,
          comment,
          created_at,
          cleaning_task_states!inner (
            completed,
            updated_at
          )
        `)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        description: task.description,
        completed: task.cleaning_task_states[0]?.completed ?? false,
        comment: task.comment,
        lastUpdated: task.cleaning_task_states[0]?.updated_at
      }));

      setTasks(transformedTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error("Error al cargar las tareas");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('task-states-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cleaning_task_states'
        },
        (payload) => {
          console.log('Task state changed:', payload);
          loadTasks(); // Recargar todas las tareas cuando haya cambios
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tasks, setTasks, isLoading, loadTasks };
};