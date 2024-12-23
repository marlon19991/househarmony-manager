import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTaskState } from "./hooks/useTaskState";
import { useProgressState } from "./hooks/useProgressState";
import { TaskListContent } from "./components/TaskListContent";
import TaskForm from "./TaskForm";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  currentAssignee: string;
  onTaskComplete: (completionPercentage: number) => void;
  isDisabled: boolean;
}

const TaskList = ({ 
  currentAssignee, 
  onTaskComplete,
  isDisabled 
}: TaskListProps) => {
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const { tasks, setTasks, isLoading, loadTasks } = useTaskState();
  const { updateProgress } = useProgressState();

  const calculateProgress = (updatedTasks: any[]) => {
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / updatedTasks.length) * 100);
  };

  const handleTaskToggle = async (taskId: number) => {
    if (isDisabled) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    try {
      const newCompleted = !taskToUpdate.completed;
      
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
      const progress = calculateProgress(updatedTasks);
      onTaskComplete(progress);
      await updateProgress(currentAssignee, progress);

    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error("Error al actualizar el estado de la tarea");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: newTaskData, error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .insert({
          description: newTask.title,
          comment: newTask.comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (taskError) throw taskError;

      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .insert({
          task_id: newTaskData.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (stateError) throw stateError;

      const newTaskWithState = {
        ...newTaskData,
        completed: false
      };

      setTasks([...tasks, newTaskWithState]);
      setNewTask({ title: "", comment: "" });
      
      const updatedTasks = [...tasks, newTaskWithState];
      const progress = calculateProgress(updatedTasks);
      onTaskComplete(progress);
      await updateProgress(currentAssignee, progress);

      toast.success("Tarea agregada exitosamente");
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Error al crear la tarea");
    }
  };

  const handleTaskEdit = async (taskId: number, newDescription: string, newComment: string) => {
    try {
      const { error } = await supabase
        .from('general_cleaning_tasks')
        .update({ 
          description: newDescription,
          comment: newComment
        })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, description: newDescription, comment: newComment }
          : task
      ));

      toast.success("Tarea actualizada exitosamente");
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleTaskDelete = async (taskId: number) => {
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
      
      const progress = calculateProgress(updatedTasks);
      onTaskComplete(progress);
      await updateProgress(currentAssignee, progress);

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
      <TaskForm
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
      />
      <TaskListContent
        tasks={tasks}
        isDisabled={isDisabled}
        onTaskToggle={handleTaskToggle}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  );
};

export default TaskList;