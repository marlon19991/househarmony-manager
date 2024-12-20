import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormProps {
  newTask: { title: string; comment: string };
  setNewTask: (task: { title: string; comment: string }) => void;
  onAddTask: (e: React.FormEvent) => void;
}

const TaskForm = ({ newTask, setNewTask, onAddTask }: TaskFormProps) => {
  return (
    <form onSubmit={onAddTask} className="space-y-4">
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
        <Label htmlFor="taskComment">Comentario</Label>
        <Textarea
          id="taskComment"
          value={newTask.comment}
          onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
          placeholder="Comentario sobre la tarea"
        />
      </div>
      <Button type="submit" className="w-full">
        Agregar Tarea
      </Button>
    </form>
  );
};

export default TaskForm;