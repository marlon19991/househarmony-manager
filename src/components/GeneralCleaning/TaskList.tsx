import { useState } from "react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { useTaskNotifications } from "./TaskNotifications";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import TaskListHeader from "./components/TaskListHeader";
import TaskListContent from "./components/TaskListContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskData } from "./hooks/useTaskData";
import { taskService } from "./services/taskService";
import { progressService } from "./services/progressService";

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
  const { tasks, setTasks, isLoading, loadTasks } = useTaskData();

  useTaskNotifications({ tasks, currentAssignee });

  const updateProgress = async (updatedTasks: any[]) => {
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const percentage = Math.round((completedTasks / updatedTasks.length) * 100);
    
    try {
      await progressService.updateProgress(currentAssignee, percentage);
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
      await taskService.toggleTaskCompletion(taskId, newCompleted);
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: newCompleted } : task
      );
      
      setTasks(updatedTasks);
      await updateProgress(updatedTasks);

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
      const newTaskData = await taskService.createTask(newTask.title, newTask.comment);
      setTasks([...tasks, newTaskData]);
      setNewTask({ title: "", comment: "" });
      await updateProgress([...tasks, newTaskData]);

      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${newTaskData.description}`,
            "cleaning"
          );
        }
      }

      toast.success("Tarea agregada exitosamente");
      await loadTasks(); // Reload tasks to ensure UI is in sync
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
      await loadTasks(); // Reload tasks to ensure UI is in sync
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);

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
      await loadTasks(); // Reload tasks to ensure UI is in sync
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