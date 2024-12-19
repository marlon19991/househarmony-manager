import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const resetTasksAndProgress = async (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  try {
    // Reset all tasks to uncompleted
    const updatedTasks = tasks.map(task => ({ ...task, completed: false }));
    setTasks(updatedTasks);

    // Update task states in database
    for (const task of tasks) {
      const { error } = await supabase
        .from('cleaning_task_states')
        .upsert({
          task_id: task.id,
          completed: false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error resetting task state:', error);
        toast.error("Error al reiniciar el estado de las tareas");
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in resetTasksAndProgress:', error);
    toast.error("Error al reiniciar las tareas");
    return false;
  }
};