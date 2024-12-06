/**
 * Componente que maneja el formulario para agregar nuevas tareas de limpieza.
 * Permite ingresar una descripción y un comentario opcional para cada tarea.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TaskFormProps {
  newTask: { description: string; comment: string };
  setNewTask: (task: { description: string; comment: string }) => void;
  onAddTask: (e: React.FormEvent) => void;
}

const TaskForm = ({ newTask, setNewTask, onAddTask }: TaskFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.description) {
      toast.error("Por favor ingresa una descripción para la tarea");
      return;
    }
    onAddTask(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
  );
};

export default TaskForm;