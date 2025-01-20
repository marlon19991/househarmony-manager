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

      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        description: task.description,
        completed: task.cleaning_task_states[0]?.completed ?? false,
        comment: task.comment
      }));

      setTasks(transformedTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      toast.error("Error al cargar las tareas");
      setIsLoading(false);
    }
  };

  // Call loadTasks on mount and set up real-time subscription
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
        (payload: RealtimePostgresChangesPayload<{ task_id: number; completed: boolean }>) => {
          console.log('Task state changed:', payload);
          
          const payloadData = payload.new as { task_id: number; completed: boolean };
          if (payload.new && 'task_id' in payload.new && 'completed' in payload.new) {
            setTasks(currentTasks => 
              currentTasks.map(task => 
                task.id === payloadData.task_id 
                  ? { ...task, completed: payloadData.completed }
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