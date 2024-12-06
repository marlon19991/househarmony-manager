import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    if (!newTask.description) {
      toast.error("Por favor ingresa una descripción para la tarea");
      return;
    }

    const task = {
      id: tasks.length + 1,
      description: newTask.description,
      completed: false,
      comment: newTask.comment
    };

    setTasks([...tasks, task]);
    setNewTask({ description: "", comment: "" });
    toast.success("Tarea agregada exitosamente");
  };

  const handleUpdateTask = (taskId: number, newDescription: string, newComment: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, description: newDescription, comment: newComment }
        : task
    ));
    setEditingTask(null);
    toast.success("Tarea actualizada exitosamente");
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold mb-4">
        Responsable actual: {currentAssignee}
      </div>

      <form onSubmit={handleAddTask} className="space-y-4 mb-6">
        <div>
          <Label htmlFor="taskDescription">Nueva Tarea</Label>
          <Input
            id="taskDescription"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Descripción de la tarea"
          />
        </div>
        <div>
          <Label htmlFor="taskComment">Comentario (opcional)</Label>
          <Input
            id="taskComment"
            value={newTask.comment}
            onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
            placeholder="Agregar un comentario"
          />
        </div>
        <Button type="submit" className="w-full">
          Agregar Tarea
        </Button>
      </form>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            {editingTask === task.id ? (
              <div className="space-y-2">
                <Input
                  value={task.description}
                  onChange={(e) => {
                    const newDescription = e.target.value;
                    setTasks(tasks.map(t => 
                      t.id === task.id ? { ...t, description: newDescription } : t
                    ));
                  }}
                />
                <Input
                  value={task.comment || ""}
                  onChange={(e) => {
                    const newComment = e.target.value;
                    setTasks(tasks.map(t => 
                      t.id === task.id ? { ...t, comment: newComment } : t
                    ));
                  }}
                  placeholder="Agregar un comentario"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpdateTask(task.id, task.description, task.comment || "")}
                    size="sm"
                  >
                    Guardar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    id={`task-${task.id}`}
                  />
                  <div>
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {task.description}
                    </label>
                    {task.comment && (
                      <p className="text-xs text-gray-500 mt-1">{task.comment}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTask(task.id)}
                >
                  Editar
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskList;