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
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error("Error al cargar las tareas");
    }
  };

  const handleAddTask = async (newTask: any) => {
    setIsAddingTask(false);
  };

  const handleUpdateTask = async (taskId: number, updatedTask: any) => {
    // The update is handled in the form component
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast.success("Tarea periódica eliminada exitosamente");
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