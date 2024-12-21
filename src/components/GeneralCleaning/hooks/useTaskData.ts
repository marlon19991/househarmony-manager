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
        
        // Get all tasks with their states using a join
        const { data: tasksData, error: tasksError } = await supabase
          .from('general_cleaning_tasks')
          .select(`
            id,
            description,
            comment,
            cleaning_task_states!left (
              completed
            )
          `)
          .order('created_at', { ascending: true });

        if (tasksError) {
          console.error('Error loading tasks:', tasksError);
          toast.error("Error al cargar las tareas");
          return;
        }

        // Transform the data to match our Task type
        const transformedTasks = tasksData.map(task => ({
          id: task.id,
          description: task.description,
          // If there's a task state, use its completed value, otherwise default to false
          completed: task.cleaning_task_states?.[0]?.completed ?? false,
          comment: task.comment
        }));

        console.log('Tasks loaded:', transformedTasks);
        setTasks(transformedTasks);
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