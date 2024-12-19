import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TaskEditForm from "./TaskEditForm";
import { ensureTaskExists, loadTaskState, handleTaskToggle, Task } from "./utils/taskOperations";
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
  useEffect(() => {
    const initializeTask = async () => {
      const taskCreated = await ensureTaskExists(task);
      if (taskCreated) {
        await loadTaskState(task.id, setTasks);
      }
    };

    initializeTask();
  }, [task.id]);

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
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleTaskToggle(task.id, task, onTaskToggle)}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
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