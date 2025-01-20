import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";

export const useGeneralCleaning = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentAssignee, setCurrentAssignee] = useState<string>("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { profiles } = useProfiles();

  // Cargar todo el estado inicial
  const loadInitialState = async () => {
    try {
      setIsLoading(true);

      // 1. Cargar el responsable actual y su progreso
      const { data: progressData, error: progressError } = await supabase
        .from('general_cleaning_progress')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (progressError) throw progressError;

      // 2. Cargar todas las tareas
      const { data: tasksData, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // 3. Cargar todos los estados de las tareas
      const { data: taskStates, error: statesError } = await supabase
        .from('cleaning_task_states')
        .select('*');

      if (statesError) throw statesError;

      // Combinar tareas con sus estados
      const combinedTasks = tasksData.map(task => ({
        ...task,
        completed: taskStates?.find(state => state.task_id === task.id)?.completed || false
      }));

      setTasks(combinedTasks);

      // Establecer el estado inicial
      if (progressData) {
        const assigneeExists = progressData.assignee === "Sin asignar" || 
                             profiles.some(profile => profile.name === progressData.assignee);
        
        const finalAssignee = assigneeExists ? progressData.assignee : "Sin asignar";
        setCurrentAssignee(finalAssignee);
        
        // Calcular el porcentaje real basado en las tareas completadas
        const completedTasks = combinedTasks.filter(task => task.completed).length;
        const percentage = combinedTasks.length > 0 ? Math.round((completedTasks / combinedTasks.length) * 100) : 0;
        setCompletionPercentage(percentage);
        
        // Si el porcentaje calculado es diferente al almacenado, actualizarlo
        if (percentage !== progressData.completion_percentage) {
          await updateProgress(finalAssignee, percentage);
        }
      } else {
        // Si no hay datos de progreso, crear un registro inicial
        await updateProgress("Sin asignar", 0);
        setCurrentAssignee("Sin asignar");
        setCompletionPercentage(0);
      }
    } catch (error) {
      console.error('Error al cargar el estado inicial:', error);
      toast.error("Error al cargar el estado inicial");
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar el progreso en la base de datos
  const updateProgress = async (assignee: string, percentage: number) => {
    try {
      const { error: updateError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee,
          completion_percentage: percentage,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error al actualizar el progreso:', error);
      throw error;
    }
  };

  // Actualizar el estado de una tarea
  const updateTaskState = async (taskId: number, completed: boolean) => {
    try {
      // 1. Actualizar el estado en la base de datos
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .upsert({
          task_id: taskId,
          completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'task_id'
        });

      if (stateError) throw stateError;

      // 2. Actualizar el estado local
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      );
      setTasks(updatedTasks);

      // 3. Calcular y actualizar el progreso
      const completedTasks = updatedTasks.filter(task => task.completed).length;
      const newPercentage = Math.round((completedTasks / updatedTasks.length) * 100);
      setCompletionPercentage(newPercentage);

      // 4. Actualizar el progreso en la base de datos
      await updateProgress(currentAssignee, newPercentage);

      return true;
    } catch (error) {
      console.error('Error al actualizar el estado de la tarea:', error);
      toast.error("Error al actualizar el estado de la tarea");
      return false;
    }
  };

  // Cambiar el responsable
  const changeAssignee = async (newAssignee: string) => {
    try {
      if (newAssignee === currentAssignee) return;

      if (completionPercentage < 75) {
        toast.error("Debes completar al menos el 75% de las tareas antes de cambiar el responsable");
        return;
      }

      // 1. Actualizar el responsable y reiniciar el progreso en la base de datos
      await updateProgress(newAssignee, 0);

      // 2. Actualizar todos los estados de las tareas a no completados
      const { error: updateError } = await supabase
        .from('cleaning_task_states')
        .update({
          completed: false,
          updated_at: new Date().toISOString()
        })
        .in('task_id', tasks.map(task => task.id));

      if (updateError) throw updateError;

      // 3. Actualizar el estado local
      setCurrentAssignee(newAssignee);
      setCompletionPercentage(0);
      setTasks(tasks.map(task => ({ ...task, completed: false })));

      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
    } catch (error) {
      console.error('Error al cambiar el responsable:', error);
      toast.error("Error al cambiar el responsable");
      await loadInitialState();
    }
  };

  // Agregar una nueva tarea
  const addTask = async (description: string, comment: string) => {
    try {
      // 1. Crear la tarea
      const { data: newTaskData, error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .insert({
          description,
          comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. Crear el estado inicial de la tarea
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .insert({
          task_id: newTaskData.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (stateError) throw stateError;

      // 3. Actualizar el estado local
      const newTask = {
        ...newTaskData,
        completed: false
      };
      setTasks([...tasks, newTask]);

      // 4. Recalcular el progreso
      const completedTasks = tasks.filter(task => task.completed).length;
      const newPercentage = Math.round((completedTasks / (tasks.length + 1)) * 100);
      setCompletionPercentage(newPercentage);
      await updateProgress(currentAssignee, newPercentage);

      // 5. Notificar al responsable actual si existe
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${newTaskData.description}`,
            "cleaning"
          );
        }
      }

      toast.success("Tarea agregada exitosamente");
      return true;
    } catch (error) {
      console.error('Error al agregar la tarea:', error);
      toast.error("Error al crear la tarea");
      return false;
    }
  };

  // Cargar el estado inicial cuando el componente se monta o cuando cambian los perfiles
  useEffect(() => {
    if (profiles.length > 0) {
      loadInitialState();
    }
  }, [profiles]);

  // Suscribirse a cambios en las tareas y estados
  useEffect(() => {
    const tasksSubscription = supabase
      .channel('general_cleaning_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'general_cleaning_tasks' }, () => {
        loadInitialState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_task_states' }, () => {
        loadInitialState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'general_cleaning_progress' }, () => {
        loadInitialState();
      })
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
    };
  }, []);

  return {
    tasks,
    currentAssignee,
    completionPercentage,
    isLoading,
    updateTaskState,
    changeAssignee,
    loadInitialState,
    addTask
  };
}; 