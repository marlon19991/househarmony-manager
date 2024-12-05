import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

export const TasksSection = () => {
  const { profiles } = useProfiles();
  const [tasks, setTasks] = useState([
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
      id: tasks.length + 1,
      title: newTask.title,
      assignee: newTask.assignee,
      dueDate: "Hoy",
      status: "pending"
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", assignee: "" });
    toast.success("Tarea agregada exitosamente");
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
      <form onSubmit={handleAddTask} className="space-y-4">
        <div>
          <Label htmlFor="taskTitle">Nueva Tarea</Label>
          <Input
            id="taskTitle"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Título de la tarea"
          />
        </div>
        <div>
          <Label htmlFor="taskAssignee">Asignar a</Label>
          <Select onValueChange={(value) => setNewTask({ ...newTask, assignee: value })} value={newTask.assignee}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar responsable" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.name}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile.icon} alt={profile.name} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    {profile.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">Agregar Tarea</Button>
      </form>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">Asignado a {task.assignee}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => toggleTaskStatus(task.id)}
                className={task.status === "completed" ? "text-green-500" : "text-amber-500"}
              >
                {task.status === "completed" ? "Completada" : "Pendiente"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};