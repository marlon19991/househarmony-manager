import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading tasks from database...');
        const { data: tasksData, error: tasksError } = await supabase
          .from('general_cleaning_tasks')
          .select('*')
          .order('created_at', { ascending: true });

        if (tasksError) {
          console.error('Error loading tasks:', tasksError);
          toast.error("Error al cargar las tareas");
          return;
        }

        console.log('Tasks loaded:', tasksData);

        // Then get their states
        const { data: taskStates, error: statesError } = await supabase
          .from('cleaning_task_states')
          .select('*');

        if (statesError) {
          console.error('Error loading task states:', statesError);
          toast.error("Error al cargar el estado de las tareas");
          return;
        }

        console.log('Task states loaded:', taskStates);

        // Combine tasks with their states
        const combinedTasks = tasksData.map(task => {
          const taskState = taskStates?.find(state => state.task_id === task.id);
          return {
            id: task.id,
            description: task.description,
            completed: taskState?.completed || false,
            comment: task.comment
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
  }, []);

  return { tasks, setTasks, isLoading };
};