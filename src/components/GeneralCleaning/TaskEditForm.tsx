import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "./types/Task";

interface TaskEditFormProps {
  task: Task;
  onSubmit: (description: string, comment: string) => void;
  onCancel: () => void;
}

const TaskEditForm = ({ task, onSubmit, onCancel }: TaskEditFormProps) => {
  const [description, setDescription] = useState(task.description);
  const [comment, setComment] = useState(task.comment || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la tarea"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Comentario (opcional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Agregar un comentario"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default TaskEditForm;