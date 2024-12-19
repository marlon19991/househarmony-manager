import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";
import { useTaskPersistence } from "./hooks/useTaskPersistence";
import { useTaskNotifications } from "./TaskNotifications";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import TaskListHeader from "./components/TaskListHeader";
import TaskListContent from "./components/TaskListContent";

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
  const { tasks, setTasks, updateTaskState } = useTaskPersistence(currentAssignee);

  // Use the notifications hook
  useTaskNotifications({ tasks, currentAssignee });
  
  // Update completion percentage whenever tasks change
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const currentPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    onTaskComplete(currentPercentage);
  }, [tasks, onTaskComplete]);

  // Reset tasks when assignee changes
  useEffect(() => {
    const resetTasks = async () => {
      const { data, error } = await supabase
        .from('cleaning_task_states')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (data) {
        setTasks(tasks.map(task => ({ ...task, completed: false })));
      }
    };

    resetTasks();
  }, [currentAssignee]);

  const handleTaskToggle = async (taskId: number) => {
    if (isDisabled) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const newCompleted = !taskToUpdate.completed;
    
    const success = await updateTaskState(taskId, newCompleted);
    
    if (success) {
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
          try {
            await sendTaskAssignmentEmail(
              assignee.email,
              currentAssignee,
              `La tarea "${taskToUpdate.description}" ha sido marcada como ${newCompleted ? 'completada' : 'pendiente'}`,
              "cleaning"
            );
            console.log("Email notification sent successfully");
          } catch (error) {
            console.error("Error sending email notification:", error);
            toast.error("Error al enviar la notificación por correo");
          }
        }
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      description: newTask.title,
      completed: false,
      comment: newTask.comment
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", comment: "" });

    // Notify assignee about new task
    if (currentAssignee !== "Sin asignar") {
      const assignee = profiles.find(p => p.name === currentAssignee);
      if (assignee?.email) {
        try {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${task.description}`,
            "cleaning"
          );
          console.log("Email notification sent successfully");
        } catch (error) {
          console.error("Error sending email notification:", error);
          toast.error("Error al enviar la notificación por correo");
        }
      }
    }

    toast.success("Tarea agregada exitosamente");
  };

  const handleUpdateTask = async (taskId: number, newDescription: string, newComment: string) => {
    if (!newDescription) {
      toast.error("La descripción de la tarea no puede estar vacía");
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
        try {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${newDescription}" ha sido actualizada`,
            "cleaning"
          );
          console.log("Email notification sent successfully");
        } catch (error) {
          console.error("Error sending email notification:", error);
          toast.error("Error al enviar la notificación por correo");
        }
      }
    }

    toast.success("Tarea actualizada exitosamente");
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(task => task.id !== taskId));

    // Notify assignee about task deletion
    if (currentAssignee !== "Sin asignar" && taskToDelete) {
      const assignee = profiles.find(p => p.name === currentAssignee);
      if (assignee?.email) {
        try {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `La tarea "${taskToDelete.description}" ha sido eliminada`,
            "cleaning"
          );
          console.log("Email notification sent successfully");
        } catch (error) {
          console.error("Error sending email notification:", error);
          toast.error("Error al enviar la notificación por correo");
        }
      }
    }

    toast.success("Tarea eliminada exitosamente");
  };

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
