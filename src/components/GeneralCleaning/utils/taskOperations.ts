import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: number;
  description: string;
  completed: boolean;
  comment?: string;
}

export const ensureTaskExists = async (task: Task) => {
  try {
    const { data: existingTask, error: checkError } = await supabase
      .from('general_cleaning_tasks')
      .select()
      .eq('id', task.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking task:', checkError);
      return false;
    }

    if (!existingTask) {
      const { error: insertError } = await supabase
        .from('general_cleaning_tasks')
        .insert({
          id: task.id,
          description: task.description,
          completed: task.completed,
          comment: task.comment
        });

      if (insertError) {
        console.error('Error creating task:', insertError);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error in ensureTaskExists:', error);
    return false;
  }
};

export const loadTaskState = async (taskId: number, setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  try {
    const { data: taskState, error } = await supabase
      .from('cleaning_task_states')
      .select('completed')
      .eq('task_id', taskId)
      .maybeSingle();

    if (error) {
      console.error('Error loading task state:', error);
      return;
    }

    if (taskState) {
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, completed: taskState.completed } : t
        )
      );
    } else {
      const { error: insertError } = await supabase
        .from('cleaning_task_states')
        .insert({
          task_id: taskId,
          completed: false
        });

      if (insertError) {
        console.error('Error creating task state:', insertError);
        toast.error("Error al crear el estado de la tarea");
      }
    }
  } catch (error) {
    console.error('Error in loadTaskState:', error);
    toast.error("Error al cargar el estado de la tarea");
  }
};

export const handleTaskToggle = async (
  taskId: number, 
  task: Task,
  onTaskToggle: (taskId: number) => void
) => {
  try {
    onTaskToggle(taskId);
    
    const newCompleted = !task.completed;
    
    const { data: existingState, error: checkError } = await supabase
      .from('cleaning_task_states')
      .select()
      .eq('task_id', taskId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking task state:', checkError);
      return;
    }

    if (existingState) {
      const { error: updateError } = await supabase
        .from('cleaning_task_states')
        .update({ 
          completed: newCompleted, 
          updated_at: new Date().toISOString() 
        })
        .eq('task_id', taskId);

      if (updateError) {
        console.error('Error updating task state:', updateError);
        toast.error("Error al actualizar el estado de la tarea");
      }
    } else {
      const { error: insertError } = await supabase
        .from('cleaning_task_states')
        .insert({ 
          task_id: taskId, 
          completed: newCompleted 
        });

      if (insertError) {
        console.error('Error creating task state:', insertError);
        toast.error("Error al crear el estado de la tarea");
      }
    }
  } catch (error) {
    console.error('Error in handleTaskToggle:', error);
    toast.error("Error al cambiar el estado de la tarea");
  }
};