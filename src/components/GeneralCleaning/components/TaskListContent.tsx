import { Task } from "../types/Task";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface TaskListContentProps {
  tasks: Task[];
  isDisabled: boolean;
  onTaskToggle: (taskId: number) => void;
  onTaskEdit: (taskId: number, description: string, comment: string) => void;
  onTaskDelete: (taskId: number) => void;
}

export const TaskListContent = ({
  tasks,
  isDisabled,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete
}: TaskListContentProps) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onTaskToggle(task.id)}
                disabled={isDisabled}
              />
              <div>
                <p className="text-sm font-medium">{task.description}</p>
                {task.comment && (
                  <p className="text-xs text-gray-500">{task.comment}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDescription = prompt("Nueva descripción:", task.description);
                  const newComment = prompt("Nuevo comentario:", task.comment || "");
                  if (newDescription) {
                    onTaskEdit(task.id, newDescription, newComment || "");
                  }
                }}
                disabled={isDisabled}
              >
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    disabled={isDisabled}
                  >
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onTaskDelete(task.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};