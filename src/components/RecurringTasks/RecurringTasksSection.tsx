import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RecurringTaskForm } from "./RecurringTaskForm";
import { RecurringTaskItem } from "./RecurringTaskItem";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const RecurringTasksSection = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    fetchTasks();

    // Crear canal con nombre único para evitar conflictos
    const channelName = `recurring-tasks-changes_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_tasks'
        },
        (payload) => {
          console.log('Cambio en recurring_tasks:', payload);
          fetchTasks();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Suscripción activa:', channelName);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error en la suscripción:', channelName);
        }
      });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      console.log('Desuscribiéndose del canal:', channelName);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched tasks:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error("Error al cargar las tareas");
    }
  };

  const handleAddTask = () => {
    setIsAddingTask(false);
    fetchTasks();
  };

  const handleUpdateTask = async (taskId: number, updatedTask: any) => {
    try {
      console.log('Updating task:', taskId, updatedTask);
      const { error } = await supabase
        .from('recurring_tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          assignees: updatedTask.assignees,
          weekdays: updatedTask.weekdays,
          start_date: updatedTask.start_date,
          end_date: updatedTask.end_date,
          icon: updatedTask.icon,
          recurrence_type: updatedTask.recurrence_type,
          notification_time: updatedTask.notification_time
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Tarea actualizada exitosamente");
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      console.log('Deleting task:', taskId);
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Tarea periódica eliminada exitosamente");
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Error al eliminar la tarea");
    }
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
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </Card>
      )}

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
    </div>
  );
};