import { useState } from "react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { useTaskNotifications } from "./TaskNotifications";
import TaskListHeader from "./components/TaskListHeader";
import TaskListContent from "./components/TaskListContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskState } from "./hooks/useTaskState";
import { useProgress } from "./hooks/useProgress";
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
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const { profiles } = useProfiles();
  const { tasks, setTasks, isLoading, loadTasks } = useTaskState();
  const { completionPercentage, updateProgress } = useProgress(currentAssignee);

  useTaskNotifications({ tasks, currentAssignee });

  const handleTaskToggle = async (taskId: number) => {
    if (isDisabled) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    try {
      const newCompleted = !taskToUpdate.completed;
      
      // Actualizar estado visual inmediatamente
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      );
      setTasks(updatedTasks);

      // Actualizar en la base de datos
      await taskService.toggleTaskState(taskId, newCompleted);
      
      // Actualizar progreso
      await updateProgress(updatedTasks);
      onTaskComplete(completionPercentage);
    } catch (error) {
      console.error('Error toggling task:', error);
      await loadTasks(); // Recargar estado real si hay error
      toast.error("Error al actualizar el estado de la tarea");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTaskData = await taskService.addTask(newTask.title, newTask.comment);
      
      setTasks(currentTasks => [...currentTasks, {
        id: newTaskData.id,
        description: newTask.title,
        comment: newTask.comment,
        completed: false
      }]);

      setNewTask({ title: "", comment: "" });
      toast.success("Tarea agregada exitosamente");
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Error al crear la tarea");
    }
  };

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

      setTasks(currentTasks => 
        currentTasks.map(task =>
          task.id === taskId
            ? { ...task, description: newDescription, comment: newComment }
            : task
        )
      );
      setEditingTask(null);
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
      toast.success("Tarea eliminada exitosamente");
    } catch (error) {
      console.error('Error deleting task:', error);
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