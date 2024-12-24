import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const useTaskData = () => {
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
            completed
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
        completed: task.cleaning_task_states[0]?.completed ?? false,
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

  useEffect(() => {
    loadTasks();

    const channel = supabase
      .channel('task-states-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cleaning_task_states'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Task state changed:', payload);
          
          if (payload.new && typeof payload.new.task_id === 'number' && typeof payload.new.completed === 'boolean') {
            setTasks(currentTasks => 
              currentTasks.map(task => 
                task.id === payload.new.task_id 
                  ? { ...task, completed: payload.new.completed }
                  : task
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tasks, setTasks, isLoading };
};