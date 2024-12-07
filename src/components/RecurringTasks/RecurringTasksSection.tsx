import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RecurringTaskForm } from "./RecurringTaskForm";
import { RecurringTaskItem } from "./RecurringTaskItem";

export const RecurringTasksSection = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = (newTask: any) => {
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setIsAddingTask(false);
    toast.success("Tarea periódica creada exitosamente");
  };

  const handleUpdateTask = (taskId: number, updatedTask: any) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...updatedTask, id: taskId } : task
    ));
    toast.success("Tarea periódica actualizada exitosamente");
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success("Tarea periódica eliminada exitosamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tareas Periódicas</h2>
        <Button onClick={() => setIsAddingTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {isAddingTask && (
        <div className="bg-card p-4 rounded-lg border">
          <RecurringTaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <RecurringTaskItem
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
          />
        ))}
      </div>
    </div>
  );
};