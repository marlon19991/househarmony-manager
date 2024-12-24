import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "./utils/taskOperations";

interface TaskEditFormProps {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
  onUpdateTask: (taskId: number, newDescription: string, newComment: string) => void;
  setEditingTask: (taskId: number | null) => void;
}

const TaskEditForm = ({
  task,
  setTasks,
  tasks,
  onUpdateTask,
  setEditingTask,
}: TaskEditFormProps) => {
  return (
    <div className="space-y-2">
      <Input
        value={task.description}
        onChange={(e) => {
          const newDescription = e.target.value;
          setTasks(tasks.map(t => 
            t.id === task.id ? { ...t, description: newDescription } : t
          ));
        }}
        placeholder="Descripción de la tarea"
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
          onClick={() => onUpdateTask(task.id, task.description, task.comment || "")}
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
  );
};

export default TaskEditForm;