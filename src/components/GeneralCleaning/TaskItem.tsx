import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface TaskItemProps {
  task: Task;
  editingTask: number | null;
  onTaskToggle: (taskId: number) => void;
  onUpdateTask: (taskId: number, newDescription: string, newComment: string) => void;
  onDeleteTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
  isDisabled: boolean;
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
  isDisabled,
}: TaskItemProps) => {
  if (task.completed) {
    return null; // No renderizar tareas completadas
  }

  return (
    <Card key={task.id} className="p-4">
      {editingTask === task.id ? (
        <TaskEditForm
          task={task}
          setTasks={setTasks}
          tasks={tasks}
          onUpdateTask={onUpdateTask}
          setEditingTask={setEditingTask}
        />
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium leading-none">
              {task.description}
            </h3>
            {task.comment && (
              <p className="text-xs text-gray-500 mt-1">{task.comment}</p>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600"
                  disabled={isDisabled}
                >
                  Completar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Completar esta tarea?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción marcará la tarea como completada y desaparecerá de la lista.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onTaskToggle(task.id)}>
                    Completar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTask(task.id)}
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
                    Esta acción no se puede deshacer. Se eliminará permanentemente esta tarea.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteTask(task.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskItem;