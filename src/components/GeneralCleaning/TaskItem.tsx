import { memo, useRef, useState } from "react";
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
import { Edit2, Trash2, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  onToggle: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onDelete: () => void;
  onUpdate: (description: string, comment: string) => void;
  onUploadEvidence?: (taskId: number, file: File) => Promise<boolean>;
  isDisabled: boolean;
}

const TaskItemComponent = ({
  task,
  isEditing,
  onToggle,
  onStartEditing,
  onCancelEditing,
  onDelete,
  onUpdate,
  onUploadEvidence,
  isDisabled
}: TaskItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadEvidence) {
      setIsUploading(true);
      await onUploadEvidence(task.id, file);
      setIsUploading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4">
        <TaskEditForm
          task={task}
          onSubmit={onUpdate}
          onCancel={onCancelEditing}
        />
      </Card>
    );
  }

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
            {task.evidence_url && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="h-auto p-0 text-xs text-blue-500 flex items-center gap-1 mt-1">
                    <ImageIcon className="w-3 h-3" />
                    Ver evidencia
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel max-w-md">
                  <img
                    src={task.evidence_url}
                    alt="Evidencia de tarea"
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {task.completed && onUploadEvidence && (
            <>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled || isUploading}
                className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                aria-label="Subir evidencia"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onStartEditing}
            disabled={isDisabled}
            className="text-muted-foreground hover:text-primary-foreground hover:bg-primary"
            aria-label="Editar tarea"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
                disabled={isDisabled}
                aria-label="Eliminar tarea"
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
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

const MemoTaskItem = memo(TaskItemComponent);
MemoTaskItem.displayName = "TaskItem";

export default MemoTaskItem;
