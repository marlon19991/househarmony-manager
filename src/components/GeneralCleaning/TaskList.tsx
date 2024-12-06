/**
 * Componente principal que gestiona la lista de tareas de limpieza.
 * Coordina la adición, edición, eliminación y actualización de tareas,
 * así como el cálculo del progreso general.
 */
import { useState } from "react";
import { toast } from "sonner";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";

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
  const [newTask, setNewTask] = useState({ description: "", comment: "" });

  const calculateCompletionPercentage = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  };

  const handleTaskToggle = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    const completionPercentage = calculateCompletionPercentage();
    onTaskComplete(completionPercentage);
    
    if (completionPercentage >= 75) {
      toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      description: newTask.description,
      completed: false,
      comment: newTask.comment
    };

    setTasks([...tasks, task]);
    setNewTask({ description: "", comment: "" });
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
      <div className="text-lg font-semibold mb-4">
        Responsable actual: {currentAssignee}
      </div>

      <TaskForm
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
      />

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
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;