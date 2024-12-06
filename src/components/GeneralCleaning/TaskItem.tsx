/**
 * Componente que representa una tarea individual.
 * Maneja la visualización, edición y eliminación de una tarea específica.
 */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  description: string;
  completed: boolean;
  comment?: string;
}

interface TaskItemProps {
  task: Task;
  editingTask: number | null;
  onTaskToggle: (taskId: number) => void;
  onUpdateTask: (taskId: number, newDescription: string, newComment: string) => void;
  onDeleteTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}

const TaskItem = ({
  task,
  editingTask,
  onTaskToggle,
  onUpdateTask,
  onDeleteTask,
  setEditingTask,
  setTasks,
  tasks,
}: TaskItemProps) => {
  return (
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
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onTaskToggle(task.id)}
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTask(task.id)}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTask(task.id)}
              className="text-red-500"
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskItem;