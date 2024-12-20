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
import { taskService } from "./services/taskService";

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

  const handleTaskToggle = async (taskId: number) => {
    if (isDisabled) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    try {
      const newCompleted = !taskToUpdate.completed;
      await taskService.updateTaskState(taskId, newCompleted);
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: newCompleted } : task
      );
      
      setTasks(updatedTasks);
      
      const completedTasks = updatedTasks.filter(task => task.completed).length;
      const percentage = Math.round((completedTasks / updatedTasks.length) * 100);
      
      // Update progress in database
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: currentAssignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
        toast.error("Error al actualizar el progreso");
        return;
      }
      
      onTaskComplete(percentage);

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
          console.log("Email notification sent successfully");
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
      const task = await taskService.createTask({
        description: newTask.title,
        completed: false,
        comment: newTask.comment
      });

      setTasks([...tasks, task]);
      setNewTask({ title: "", comment: "" });

      // Notify assignee about new task
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${task.description}`,
            "cleaning"
          );
          console.log("Email notification sent successfully");
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
      await taskService.updateTask(taskId, newDescription, newComment);
      
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
          console.log("Email notification sent successfully");
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
      const taskToDelete = tasks.find(t => t.id === taskId);
      await taskService.deleteTask(taskId);
      
      setTasks(tasks.filter(task => task.id !== taskId));

      // Notify assignee about task deletion
      if (currentAssignee !== "Sin asignar" && taskToDelete) {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${taskToDelete.description}" ha sido eliminada`,
            "cleaning"
          );
          console.log("Email notification sent successfully");
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