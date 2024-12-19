import { useState, useEffect } from "react";
import { toast } from "sonner";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Task {
  id: number;
  description: string;
  completed: boolean;
  comment?: string;
}

interface TaskListProps {
  currentAssignee: string;
  onTaskComplete: (completionPercentage: number) => void;
  onAssigneeChange: (newAssignee: string) => void;
}

const TaskList = ({ currentAssignee, onTaskComplete, onAssigneeChange }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, description: "Barrer todas las habitaciones", completed: false },
    { id: 2, description: "Trapear los pisos", completed: false },
    { id: 3, description: "Limpiar los baños", completed: false },
    { id: 4, description: "Limpiar ventanas", completed: false },
    { id: 5, description: "Sacudir muebles", completed: false },
    { id: 6, description: "Aspirar alfombras", completed: false },
    { id: 7, description: "Limpiar cocina", completed: false },
    { id: 8, description: "Sacar basura", completed: false },
  ]);

  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", comment: "" });

  useEffect(() => {
    if (currentAssignee === "Sin asignar") {
      setTasks(tasks.map(task => ({ ...task, completed: false })));
      onTaskComplete(0);
    }
  }, [currentAssignee]);

  const calculateCompletionPercentage = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  };

  const handleTaskToggle = async (taskId: number) => {
    if (currentAssignee === "Sin asignar") {
      toast.error("Debe asignar un responsable antes de marcar tareas");
      return;
    }

    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    const completionPercentage = calculateCompletionPercentage();
    onTaskComplete(completionPercentage);
    
    // Update progress in database
    await supabase
      .from('general_cleaning_progress')
      .upsert({
        assignee: currentAssignee,
        completion_percentage: completionPercentage,
        last_updated: new Date().toISOString()
      });
    
    if (completionPercentage >= 75) {
      toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
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
                setNewTask={(task: { title: string; comment: string }) => setNewTask(task)}
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