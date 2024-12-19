import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskState = (currentAssignee: string) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, description: "Barrer todas las habitaciones", completed: false },
    { id: 2, description: "Trapear los pisos", completed: false },
    { id: 3, description: "Limpiar los baños", completed: false },
    { id: 4, description: "Limpiar ventanas", completed: false },
    { id: 5, description: "Sacudir muebles", completed: false },
    { id: 6, description: "Aspirar alfombras", completed: false },
    { id: 7, description: "Limpiar cocina", completed: false },
    { id: 8, description: "Sacar basura", completed: false },
  ]);

  useEffect(() => {
    const loadTaskStates = async () => {
      try {
        const { data: taskStates, error } = await supabase
          .from('cleaning_task_states')
          .select('task_id, completed');

        if (error) {
          console.error('Error loading task states:', error);
          toast.error("Error al cargar el estado de las tareas");
          return;
        }

        if (taskStates) {
          setTasks(prevTasks => 
            prevTasks.map(task => {
              const taskState = taskStates.find(state => state.task_id === task.id);
              return taskState ? { ...task, completed: taskState.completed } : task;
            })
          );
        }
      } catch (error) {
        console.error('Error in loadTaskStates:', error);
        toast.error("Error al cargar el estado de las tareas");
      }
    };

    loadTaskStates();
  }, []);

  const updateTaskState = async (taskId: number, completed: boolean) => {
    try {
      // First check if the task state exists
      const { data: existingState, error: checkError } = await supabase
        .from('cleaning_task_states')
        .select('*')
        .eq('task_id', taskId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingState) {
        // Update existing state
        const { error: updateError } = await supabase
          .from('cleaning_task_states')
          .update({ 
            completed,
            updated_at: new Date().toISOString()
          })
          .eq('task_id', taskId);

        if (updateError) throw updateError;
      } else {
        // Insert new state
        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert({ 
            task_id: taskId,
            completed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error updating task state:', error);
      toast.error("Error al actualizar el estado de la tarea");
      return false;
    }
  };

  return { tasks, setTasks, updateTaskState };
};