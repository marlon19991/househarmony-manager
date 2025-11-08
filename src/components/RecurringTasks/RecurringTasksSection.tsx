import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { RecurringTaskForm } from "./RecurringTaskForm";
import { RecurringTaskItem } from "./RecurringTaskItem";
import { Card } from "@/components/ui/card";
import { useRecurringTasks } from "./hooks/useRecurringTasks";
import type { RecurringTaskPayload } from "./hooks/useRecurringTasks";

export const RecurringTasksSection = () => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const {
    tasksQuery,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  } = useRecurringTasks();

  const tasks = tasksQuery.data ?? [];

  const handleCreateTask = (taskData: RecurringTaskPayload) => {
    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        setIsAddingTask(false);
      },
    });
  };

  const handleUpdateTask = (taskId: number, updatedTask: RecurringTaskPayload) => {
    updateTaskMutation.mutate({ id: taskId, data: updatedTask });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Tareas Periódicas</h2>
        <Button onClick={() => setIsAddingTask(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {isAddingTask && (
        <Card className="mb-6 p-4">
          <RecurringTaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </Card>
      )}

      {tasksQuery.isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {tasksQuery.isError && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">
            No pudimos cargar las tareas periódicas.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => tasksQuery.refetch()}
            disabled={tasksQuery.isFetching}
          >
            Reintentar
          </Button>
        </div>
      )}

      {!tasksQuery.isLoading && !tasksQuery.isError && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay tareas periódicas configuradas
            </div>
          ) : (
            tasks.map((task) => (
              <RecurringTaskItem
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
