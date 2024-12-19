import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
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
  useEffect(() => {
    const loadTaskState = async () => {
      try {
        const { data: taskState, error } = await supabase
          .from('cleaning_task_states')
          .select('completed')
          .eq('task_id', task.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading task state:', error);
          return;
        }

        if (taskState) {
          setTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === task.id ? { ...t, completed: taskState.completed } : t
            )
          );
        } else {
          // If no task state exists, create one with default values
          const { error: insertError } = await supabase
            .from('cleaning_task_states')
            .insert({
              task_id: task.id,
              completed: false
            });

          if (insertError) {
            console.error('Error creating task state:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in loadTaskState:', error);
      }
    };

    loadTaskState();
  }, [task.id]);

  const handleTaskToggle = async (taskId: number) => {
    try {
      onTaskToggle(taskId);
      
      const newCompleted = !task.completed;
      
      const { data: existingState, error: checkError } = await supabase
        .from('cleaning_task_states')
        .select()
        .eq('task_id', taskId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking task state:', checkError);
        return;
      }

      if (existingState) {
        const { error: updateError } = await supabase
          .from('cleaning_task_states')
          .update({ 
            completed: newCompleted, 
            updated_at: new Date().toISOString() 
          })
          .eq('task_id', taskId);

        if (updateError) {
          console.error('Error updating task state:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert({ 
            task_id: taskId, 
            completed: newCompleted 
          });

        if (insertError) {
          console.error('Error creating task state:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in handleTaskToggle:', error);
    }
  };

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
              onCheckedChange={() => handleTaskToggle(task.id)}
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