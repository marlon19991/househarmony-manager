import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TaskEditForm from "./TaskEditForm";
import { Task } from "./types/Task";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  onToggle: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  isDisabled: boolean;
}

const TaskItem = ({
  task,
  isEditing,
  onToggle,
  onStartEditing,
  onCancelEditing,
  isDisabled
}: TaskItemProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={task.completed}
            onCheckedChange={onToggle}
            disabled={isDisabled}
          />
          <div>
            <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.description}
            </p>
            {task.comment && (
              <p className="text-sm text-gray-500">{task.comment}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onStartEditing}
                disabled={isDisabled}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={isDisabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la tarea permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskItem;