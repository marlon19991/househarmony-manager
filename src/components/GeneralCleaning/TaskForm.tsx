import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormProps {
  newTask: { title: string; comment: string };
  setNewTask: React.Dispatch<React.SetStateAction<{ title: string; comment: string }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isDisabled: boolean;
}

const TaskForm = ({ newTask, setNewTask, onSubmit, isDisabled }: TaskFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Descripción <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Descripción de la tarea"
          disabled={false}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Comentario (opcional)
        </label>
        <Textarea
          id="comment"
          value={newTask.comment}
          onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
          placeholder="Agregar un comentario"
          disabled={false}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full"
        disabled={!newTask.title.trim()}
      >
        Agregar Tarea
      </Button>
    </form>
  );
};

export default TaskForm;