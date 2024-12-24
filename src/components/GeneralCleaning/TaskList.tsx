import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";
import { useTaskNotifications } from "./TaskNotifications";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import TaskListHeader from "./components/TaskListHeader";
import TaskListContent from "./components/TaskListContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskData } from "./hooks/useTaskData";

interface TaskListProps {
  currentAssignee: string;
  onTaskComplete: (completionPercentage: number) => void;
  onAssigneeChange: (newAssignee: string) => void;
  isDisabled: boolean;
}

const TaskList = ({ 
  currentAssignee, 
  onTaskComplete, 
  onAssigneeChange, 
  isDisabled 
}: TaskListProps) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const { profiles } = useProfiles();
  const { tasks, setTasks, isLoading } = useTaskData();

  // Use the notifications hook
  useTaskNotifications({ tasks, currentAssignee });

  const updateProgress = async (updatedTasks: any[]) => {
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const percentage = Math.round((completedTasks / updatedTasks.length) * 100);
    
    try {
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: currentAssignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (progressError) throw progressError;
      
      onTaskComplete(percentage);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Error al actualizar el progreso");
    }
  };

  const handleTaskToggle = async (taskId: number) => {
    if (isDisabled) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    try {
      const newCompleted = !taskToUpdate.completed;
      
      // Update task state in database using upsert with onConflict
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .upsert({ 
          task_id: taskId,
          completed: newCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'task_id'
        });

      if (stateError) throw stateError;
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: newCompleted } : task
      );
      
      setTasks(updatedTasks);
      await updateProgress(updatedTasks);

      // Notify assignee about task status change
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${taskToUpdate.description}" ha sido marcada como ${newCompleted ? 'completada' : 'pendiente'}`,
            "cleaning"
          );
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error("Error al actualizar el estado de la tarea");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create task in database
      const { data: newTaskData, error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .insert({
          description: newTask.title,
          comment: newTask.comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        toast.error("Error al crear la tarea");
        return;
      }

      // Create initial task state
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .insert({
          task_id: newTaskData.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (stateError) {
        console.error('Error creating task state:', stateError);
        toast.error("Error al crear el estado de la tarea");
        return;
      }

      const newTaskWithState = {
        ...newTaskData,
        completed: false
      };

      setTasks([...tasks, newTaskWithState]);
      setNewTask({ title: "", comment: "" });
      await updateProgress([...tasks, newTaskWithState]);

      // Notify assignee about new task
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${newTaskWithState.description}`,
            "cleaning"
          );
        }
      }

      toast.success("Tarea agregada exitosamente");
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Error al crear la tarea");
    }
  };

  const handleUpdateTask = async (taskId: number, newDescription: string, newComment: string) => {
    if (!newDescription) {
      toast.error("La descripción de la tarea no puede estar vacía");
      return;
    }

    try {
      // Update task in database
      const { error: updateError } = await supabase
        .from('general_cleaning_tasks')
        .update({ 
          description: newDescription,
          comment: newComment
        })
        .eq('id', taskId);

      if (updateError) {
        console.error('Error updating task:', updateError);
        toast.error("Error al actualizar la tarea");
        return;
      }
      
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, description: newDescription, comment: newComment }
          : task
      ));
      setEditingTask(null);

      // Notify assignee about task update
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
      // Delete task state first due to foreign key constraint
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) {
        console.error('Error deleting task state:', stateError);
        toast.error("Error al eliminar el estado de la tarea");
        return;
      }

      // Then delete the task
      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) {
        console.error('Error deleting task:', taskError);
        toast.error("Error al eliminar la tarea");
        return;
      }

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await updateProgress(updatedTasks);

      // Notify assignee about task deletion
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TaskListHeader
        currentAssignee={currentAssignee}
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
      />
      <TaskListContent
        tasks={tasks}
        editingTask={editingTask}
        onTaskToggle={handleTaskToggle}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        setEditingTask={setEditingTask}
        setTasks={setTasks}
        isDisabled={isDisabled}
      />
    </div>
  );
};

export default TaskList;