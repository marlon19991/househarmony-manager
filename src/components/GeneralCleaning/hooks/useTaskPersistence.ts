import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskPersistence = (currentAssignee: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // First get all tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('general_cleaning_tasks')
          .select('*')
          .order('created_at', { ascending: true });

        if (tasksError) {
          console.error('Error loading tasks:', tasksError);
          toast.error("Error al cargar las tareas");
          return;
        }

        // Then get their states
        const { data: taskStates, error: statesError } = await supabase
          .from('cleaning_task_states')
          .select('*')
          .order('created_at', { ascending: true });

        if (statesError) {
          console.error('Error loading task states:', statesError);
          toast.error("Error al cargar el estado de las tareas");
          return;
        }

        // Combine tasks with their states
        const combinedTasks = tasksData.map(task => {
          const taskState = taskStates?.find(state => state.task_id === task.id);
          return {
            ...task,
            completed: taskState?.completed || false
          };
        });

        setTasks(combinedTasks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in loadTasks:', error);
        toast.error("Error al cargar las tareas");
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentAssignee]);

  const updateTaskState = async (taskId: number, completed: boolean) => {
    try {
      // First ensure task exists in general_cleaning_tasks
      const { data: existingTask, error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .select('*')
        .eq('id', taskId)
        .maybeSingle();

      if (taskError) {
        console.error('Error checking task:', taskError);
        return false;
      }

      if (!existingTask) {
        console.error('Task not found:', taskId);
        return false;
      }

      // Then update or create task state
      const { data: existingState, error: checkError } = await supabase
        .from('cleaning_task_states')
        .select('*')
        .eq('task_id', taskId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking task state:', checkError);
        return false;
      }

      if (existingState) {
        const { error: updateError } = await supabase
          .from('cleaning_task_states')
          .update({ 
            completed,
            updated_at: new Date().toISOString()
          })
          .eq('task_id', taskId);

        if (updateError) {
          console.error('Error updating task state:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert({ 
            task_id: taskId,
            completed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating task state:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateTaskState:', error);
      return false;
    }
  };

  return { tasks, setTasks, updateTaskState, isLoading };
};