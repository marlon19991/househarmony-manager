import { useState, useEffect } from "react";
import { toast } from "sonner";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";
import { useTaskState } from "./hooks/useTaskState";
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
}

const TaskList = ({ currentAssignee, onTaskComplete, onAssigneeChange }: TaskListProps) => {
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const { profiles } = useProfiles();
  const { tasks, setTasks, updateTaskState } = useTaskState(currentAssignee);

  useEffect(() => {
    // Verificar si el asignado actual existe en los perfiles
    const assigneeExists = currentAssignee === "Sin asignar" || 
                         profiles.some(profile => profile.name === currentAssignee);

    if (!assigneeExists) {
      // Si el asignado no existe, resetear a "Sin asignar"
      onAssigneeChange("Sin asignar");
      setTasks(tasks.map(task => ({ ...task, completed: false })));
      onTaskComplete(0);
    }

    // Actualizar el progreso basado en las tareas completadas
    const completedTasks = tasks.filter(task => task.completed).length;
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    onTaskComplete(percentage);
  }, [currentAssignee, profiles, tasks]);

  const handleTaskToggle = async (taskId: number) => {
    if (currentAssignee === "Sin asignar") {
      toast.error("Debe asignar un responsable antes de marcar tareas");
      return;
    }

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
      
      if (percentage >= 75) {
        toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      description: newTask.title,
      completed: false,
      comment: newTask.comment
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", comment: "" });
    toast.success("Tarea agregada exitosamente");
  };

  const handleUpdateTask = (taskId: number, newDescription: string, newComment: string) => {
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
    toast.success("Tarea actualizada exitosamente");
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
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
            <Button size="sm" disabled={currentAssignee === "Sin asignar"}>
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
            disabled={currentAssignee === "Sin asignar"}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;