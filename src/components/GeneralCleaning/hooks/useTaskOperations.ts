import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import { Profile } from "@/types/profile";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";

export const useTaskOperations = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  currentAssignee: string,
  profiles: Profile[],
  updateProgress: (updatedTasks: Task[]) => Promise<void>
) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);

  const handleUpdateTask = async (taskId: number, newDescription: string, newComment: string) => {
    try {
      const { error } = await supabase
        .from('general_cleaning_tasks')
        .update({
          description: newDescription,
          comment: newComment
        })
        .eq('id', taskId);

      if (error) throw error;

      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, description: newDescription, comment: newComment }
          : task
      );

      setTasks(updatedTasks);
      setEditingTask(null);
      toast.success("Tarea actualizada exitosamente");

      // Notify assignee
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${newDescription}" ha sido actualizada`,
            "cleaning"
          );
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // First delete task states
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) throw stateError;

      // Then delete the task
      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await updateProgress(updatedTasks);
      toast.success("Tarea eliminada exitosamente");
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Error al eliminar la tarea");
    }
  };

  return {
    editingTask,
    setEditingTask,
    handleUpdateTask,
    handleDeleteTask
  };
};