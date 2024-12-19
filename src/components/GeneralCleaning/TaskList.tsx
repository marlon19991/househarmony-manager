import { useState, useEffect } from "react";
import { toast } from "sonner";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";
import { useTaskState } from "./hooks/useTaskState";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface TaskListProps {
  currentAssignee: string;
  onTaskComplete: (completionPercentage: number) => void;
  onAssigneeChange: (newAssignee: string) => void;
  isDisabled: boolean;
}

const TaskList = ({ currentAssignee, onTaskComplete, onAssigneeChange, isDisabled }: TaskListProps) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const { profiles } = useProfiles();
  const { tasks, setTasks, updateTaskState } = useTaskState(currentAssignee);
  const [previousPercentage, setPreviousPercentage] = useState(0);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const percentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Only show completion message when crossing 75% threshold upwards
    if (percentage >= 75 && previousPercentage < 75) {
      toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
    }
    
    setPreviousPercentage(percentage);
    onTaskComplete(percentage);
  }, [currentAssignee, profiles, tasks]);

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
      
      // Actualizar el progreso en la base de datos
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
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          Responsable actual: {currentAssignee}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Tarea
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Agregar Nueva Tarea</SheetTitle>
              <SheetDescription>
                Crea una nueva tarea de limpieza general.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <TaskForm
                newTask={newTask}
                setNewTask={setNewTask}
                onAddTask={handleAddTask}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            editingTask={editingTask}
            onTaskToggle={handleTaskToggle}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            setEditingTask={setEditingTask}
            setTasks={setTasks}
            tasks={tasks}
            isDisabled={isDisabled}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;