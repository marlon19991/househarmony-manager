import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "./types/Task";

interface TaskEditFormProps {
  task: Task;
  onUpdateTask: (description: string, comment: string) => void;
  onCancelEditing: () => void;
}

const TaskEditForm = ({
  task,
  onUpdateTask,
  onCancelEditing
}: TaskEditFormProps) => {
  const [description, setDescription] = useState(task.description);
  const [comment, setComment] = useState(task.comment || "");

  const handleSubmit = () => {
    onUpdateTask(description, comment);
  };

  return (
    <div className="space-y-2">
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción de la tarea"
      />
      <Input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Agregar un comentario"
      />
      <div className="flex gap-2">
        <Button 
          onClick={handleSubmit}
          size="sm"
        >
          Guardar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancelEditing}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default TaskEditForm;