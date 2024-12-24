import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RecurringTaskForm } from "./RecurringTaskForm";
import { RecurringTaskItem } from "./RecurringTaskItem";
import { supabase } from "@/integrations/supabase/client";

export const RecurringTasksSection = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('recurring-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
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
    fetchTasks(); // Refresh tasks after adding
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
      await fetchTasks(); // Refresh tasks after update
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
      await fetchTasks(); // Refresh tasks after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Error al eliminar la tarea");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tareas Periódicas</h2>
        <Button onClick={() => setIsAddingTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {isAddingTask && (
        <div className="bg-card p-4 rounded-lg border">
          <RecurringTaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <RecurringTaskItem
            key={task.id}
            task={task}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
          />
        ))}
      </div>
    </div>
  );
};