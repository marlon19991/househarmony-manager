import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";

export const useTaskPersistence = (currentAssignee: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from database
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      // First get all tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
        toast.error("Error al cargar las tareas");
        return;
      }

      // Then get their states
      const { data: taskStates, error: statesError } = await supabase
        .from('cleaning_task_states')
        .select('*')
        .order('created_at', { ascending: true });

      if (statesError) {
        console.error('Error loading task states:', statesError);
        toast.error("Error al cargar el estado de las tareas");
        return;
      }

      // Combine tasks with their states
      const combinedTasks = tasksData.map(task => {
        const taskState = taskStates?.find(state => state.task_id === task.id);
        return {
          ...task,
          completed: taskState?.completed || false
        };
      });

      setTasks(combinedTasks);
    } catch (error) {
      console.error('Error in loadTasks:', error);
      toast.error("Error al cargar las tareas");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tareas cuando cambia el responsable
  useEffect(() => {
    loadTasks();
  }, [currentAssignee]);

  const updateTaskState = async (taskId: number, completed: boolean) => {
    try {
      // Primero actualizar la base de datos
      const { error: updateError } = await supabase
        .from('cleaning_task_states')
        .upsert({
          task_id: taskId,
          completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'task_id'
        });

      if (updateError) throw updateError;

      // Actualizar el estado local después de actualizar la base de datos
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      );

      return true;
    } catch (error) {
      console.error('Error en updateTaskState:', error);
      return false;
    }
  };

  const resetTaskStates = async () => {
    try {
      // Primero actualizar la base de datos
      const { data: tasks, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        // Eliminar estados existentes
        const { error: deleteError } = await supabase
          .from('cleaning_task_states')
          .delete()
          .in('task_id', tasks.map(task => task.id));

        if (deleteError) throw deleteError;

        // Crear nuevos estados desmarcados
        const newStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert(newStates);

        if (insertError) throw insertError;
      }

      // Luego actualizar el estado local
      setTasks(prevTasks => prevTasks.map(task => ({
        ...task,
        completed: false
      })));

      // Recargar las tareas para asegurar sincronización
      await loadTasks();
    } catch (error) {
      console.error('Error al reiniciar los estados de las tareas:', error);
      toast.error("Error al reiniciar las tareas");
    }
  };

  return {
    tasks,
    setTasks,
    updateTaskState,
    isLoading,
    resetTaskStates,
    loadTasks
  };
};