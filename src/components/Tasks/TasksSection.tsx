import { useState } from "react";
import { toast } from "sonner";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";

interface Task {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "completed";
  isEditing?: boolean;
}

export const TasksSection = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Limpiar cocina", assignee: "Juan", dueDate: "Hoy", status: "pending" },
    { id: 2, title: "Sacar la basura", assignee: "Sara", dueDate: "Hoy", status: "completed" },
    { id: 3, title: "Aspirar sala", assignee: "Miguel", dueDate: "Mañana", status: "pending" },
  ]);
  const [newTask, setNewTask] = useState({ title: "", assignee: "" });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignee) {
      toast.error("Por favor completa todos los campos de la tarea");
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      assignee: newTask.assignee,
      dueDate: "Hoy",
      status: "pending" as const
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", assignee: "" });
    toast.success("Tarea agregada exitosamente");
  };

  const startEditing = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isEditing: true } : task
    ));
  };

  const cancelEditing = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isEditing: false } : task
    ));
  };

  const saveTask = (taskId: number, newTitle: string, newAssignee: string) => {
    if (!newTitle || !newAssignee) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, title: newTitle, assignee: newAssignee, isEditing: false }
        : task
    ));
    toast.success("Tarea actualizada exitosamente");
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success("Tarea eliminada exitosamente");
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        toast.success(`Tarea marcada como ${newStatus === "completed" ? "completada" : "pendiente"}`);
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tareas de Hoy</h2>
      <TaskForm
        newTask={newTask}
        setNewTask={setNewTask}
        onSubmit={handleAddTask}
      />
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onSave={saveTask}
            onDelete={handleDeleteTask}
            onToggleStatus={toggleTaskStatus}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
          />
        ))}
      </div>
    </div>
  );
};