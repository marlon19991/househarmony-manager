import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { RecurringTaskForm } from "./RecurringTaskForm";
import { RecurringTaskItem } from "./RecurringTaskItem";
import { useRecurringTasks } from "./hooks/useRecurringTasks";
import type { RecurringTaskPayload } from "./hooks/useRecurringTasks";

export const RecurringTasksSection = () => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const {
    tasksQuery,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    completeTaskMutation,
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

  const handleCompleteTask = (taskId: number, evidenceUrl?: string) => {
    completeTaskMutation.mutate({ task_id: taskId, evidence_url: evidenceUrl });
  };


  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Tareas Periódicas</h2>
        <Button
          onClick={() => setIsAddingTask(true)}
          size="sm"
          className="glass-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {isAddingTask && (
        <div className="glass-card mb-6 p-6 rounded-xl border border-white/10">
          <RecurringTaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </div>
      )}

      {tasksQuery.isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      )}

      {tasksQuery.isError && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm backdrop-blur-sm">
          <p className="font-medium text-destructive">
            No pudimos cargar las tareas periódicas.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => tasksQuery.refetch()}
            disabled={tasksQuery.isFetching}
            className="border-destructive/30 hover:bg-destructive/20"
          >
            Reintentar
          </Button>
        </div>
      )}

      {!tasksQuery.isLoading && !tasksQuery.isError && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="glass-panel p-12 rounded-xl text-center text-muted-foreground">
              No hay tareas periódicas configuradas
            </div>
          ) : (
            tasks.map((task) => (
              <RecurringTaskItem
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                onComplete={handleCompleteTask}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
