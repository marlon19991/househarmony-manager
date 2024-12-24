import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/Task";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";

export const useTaskOperations = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  currentAssignee: string,
  profiles: any[],
  updateProgress: (tasks: Task[]) => Promise<void>
) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);

  const handleUpdateTask = async (taskId: number, newDescription: string, newComment: string) => {
    if (!newDescription) {
      toast.error("La descripción de la tarea no puede estar vacía");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('general_cleaning_tasks')
        .update({ 
          description: newDescription,
          comment: newComment
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, description: newDescription, comment: newComment }
          : task
      );
      
      setTasks(updatedTasks);
      setEditingTask(null);

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

      toast.success("Tarea actualizada exitosamente");
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) throw stateError;

      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await updateProgress(updatedTasks);

      if (currentAssignee !== "Sin asignar") {
        const taskToDelete = tasks.find(t => t.id === taskId);
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email && taskToDelete) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${taskToDelete.description}" ha sido eliminada`,
            "cleaning"
          );
        }
      }

      toast.success("Tarea eliminada exitosamente");
    } catch (error) {
      console.error('Error in handleDeleteTask:', error);
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