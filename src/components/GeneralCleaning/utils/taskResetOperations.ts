import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const resetTasksAndProgress = async (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  try {
    // Reset all tasks to uncompleted in the UI
    const updatedTasks = tasks.map(task => ({ ...task, completed: false }));
    setTasks(updatedTasks);

    // Update task states in database
    for (const task of tasks) {
      // First check if the task state exists
      const { data: existingState, error: checkError } = await supabase
        .from('cleaning_task_states')
        .select('*')
        .eq('task_id', task.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking task state:', checkError);
        toast.error("Error al verificar el estado de las tareas");
        return false;
      }

      // If the state exists, update it. Otherwise, insert a new one
      if (existingState) {
        const { error: updateError } = await supabase
          .from('cleaning_task_states')
          .update({
            completed: false,
            updated_at: new Date().toISOString()
          })
          .eq('task_id', task.id);

        if (updateError) {
          console.error('Error updating task state:', updateError);
          toast.error("Error al actualizar el estado de las tareas");
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert({
            task_id: task.id,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting task state:', insertError);
          toast.error("Error al crear el estado de las tareas");
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in resetTasksAndProgress:', error);
    toast.error("Error al reiniciar las tareas");
    return false;
  }
};