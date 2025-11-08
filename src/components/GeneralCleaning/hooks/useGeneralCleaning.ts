import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useSettings } from "@/hooks/useSettings";

const GENERAL_CLEANING_QUERY_KEY = ["general-cleaning-state"] as const;

type GeneralCleaningState = {
  tasks: Task[];
  assignee: string;
  completionPercentage: number;
  storedCompletionPercentage: number;
  hasProgressRecord: boolean;
};

const fetchGeneralCleaningState = async (
  validProfiles: string[]
): Promise<GeneralCleaningState> => {
  // 1. Cargar el responsable actual y su progreso
  const { data: progressData, error: progressError } = await supabase
    .from("general_cleaning_progress")
    .select("*")
    .order("last_updated", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (progressError) throw progressError;

  // 2. Cargar todas las tareas
  const { data: tasksData, error: tasksError } = await supabase
    .from("general_cleaning_tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (tasksError) throw tasksError;

  // 3. Cargar todos los estados de las tareas
  const { data: taskStates, error: statesError } = await supabase
    .from("cleaning_task_states")
    .select("*");

  if (statesError) throw statesError;

  const combinedTasks: Task[] = (tasksData || []).map((task: any) => ({
    id: task.id,
    description: task.description,
    comment: task.comment,
    completed:
      taskStates?.find((state: any) => state.task_id === task.id)?.completed ||
      false,
  }));

  const completedTasks = combinedTasks.filter((task) => task.completed).length;
  const computedPercentage =
    combinedTasks.length > 0
      ? Math.round((completedTasks / combinedTasks.length) * 100)
      : 0;

  const rawAssignee = progressData?.assignee ?? "Sin asignar";
  const assigneeExists =
    rawAssignee === "Sin asignar" || validProfiles.includes(rawAssignee);
  const assignee = assigneeExists ? rawAssignee : "Sin asignar";

  return {
    tasks: combinedTasks,
    assignee,
    completionPercentage: computedPercentage,
    storedCompletionPercentage: progressData?.completion_percentage ?? 0,
    hasProgressRecord: Boolean(progressData),
  };
};

const updateProgressRecord = async (assignee: string, percentage: number) => {
  const { error: updateError } = await supabase
    .from("general_cleaning_progress")
    .upsert(
      {
        assignee,
        completion_percentage: percentage,
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "assignee",
      }
    );

  if (updateError) throw updateError;
};

export const useGeneralCleaning = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentAssignee, setCurrentAssignee] = useState<string>("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { profiles } = useProfiles();
  const { maxCleaningTasks } = useSettings();
  const queryClient = useQueryClient();

  const profileNames = profiles
    .map((profile) => profile.name)
    .filter((name): name is string => Boolean(name));
  const profileKey = [...profileNames].sort().join("|");

  const generalCleaningQuery = useQuery({
    queryKey: [...GENERAL_CLEANING_QUERY_KEY, profileKey],
    queryFn: () => fetchGeneralCleaningState(profileNames),
    enabled: profiles.length > 0,
  });

  const refreshCleaningState = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: GENERAL_CLEANING_QUERY_KEY }),
    [queryClient]
  );

  useEffect(() => {
    if (!generalCleaningQuery.data) return;

    const {
      tasks: fetchedTasks,
      assignee,
      completionPercentage: computedPercentage,
      storedCompletionPercentage,
      hasProgressRecord,
    } = generalCleaningQuery.data;

    setTasks(fetchedTasks);
    setCurrentAssignee(assignee);
    setCompletionPercentage(computedPercentage);

    const syncProgress = async () => {
      try {
        if (!hasProgressRecord) {
          await updateProgressRecord("Sin asignar", 0);
        } else if (computedPercentage !== storedCompletionPercentage) {
          await updateProgressRecord(assignee, computedPercentage);
        }
      } catch (error) {
        console.error("Error al sincronizar el progreso:", error);
      }
    };

    void syncProgress();
  }, [generalCleaningQuery.data]);

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

      // 3. Calcular y actualizar el progreso solo si hay un responsable asignado
      if (currentAssignee !== "Sin asignar" && updatedTasks.length > 0) {
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const newPercentage = Math.round((completedTasks / updatedTasks.length) * 100);
        setCompletionPercentage(newPercentage);

        // 4. Actualizar el progreso en la base de datos
        await updateProgressRecord(currentAssignee, newPercentage);
      } else {
        // Si no hay responsable, solo actualizar el estado local
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const newPercentage = updatedTasks.length > 0 
          ? Math.round((completedTasks / updatedTasks.length) * 100)
          : 0;
        setCompletionPercentage(newPercentage);
      }

      void refreshCleaningState();
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
      await updateProgressRecord(newAssignee, 0);

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

      // 4. Enviar notificación por correo al nuevo responsable (opcional en desarrollo local)
      const newAssigneeProfile = profiles.find(p => p.name === newAssignee);
      if (newAssigneeProfile?.email) {
        try {
          // Detectar si estamos en desarrollo local
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const isLocal = supabaseUrl.includes('localhost') || 
                         supabaseUrl.includes('127.0.0.1') ||
                         supabaseUrl.includes('local');
          
          if (isLocal) {
            console.log('📧 [Desarrollo Local] Notificación de tarea omitida (normal en desarrollo)');
          } else {
            const { error } = await supabase.functions.invoke('send-task-notifications', {
              body: {
                assigneeEmail: newAssigneeProfile.email,
                assigneeName: newAssignee,
                taskType: "cleaning",
                message: "Es tu turno para el aseo general"
              }
            });

            if (error) {
              console.warn('⚠️ No se pudo enviar la notificación (esto es normal en desarrollo local):', error.message);
            }
          }
        } catch (emailError: any) {
          // En desarrollo local, estos errores son esperados y no deben interrumpir el flujo
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const isLocal = supabaseUrl.includes('localhost') || 
                         supabaseUrl.includes('127.0.0.1');
          
          if (isLocal) {
            console.log('📧 [Desarrollo Local] Función de notificación no disponible (normal en desarrollo)');
          } else {
            console.warn('⚠️ Error al enviar la notificación por correo:', emailError?.message || emailError);
          }
          // No interrumpimos el flujo si falla el envío del correo
        }
      }

      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
      void refreshCleaningState();
    } catch (error) {
      console.error('Error al cambiar el responsable:', error);
      toast.error("Error al cambiar el responsable");
      await refreshCleaningState();
    }
  };

  // Agregar una nueva tarea
  const addTask = async (description: string, comment: string) => {
    try {
      // Verificar el límite de tareas
      if (tasks.length >= maxCleaningTasks) {
        toast.error(`Has alcanzado el límite de ${maxCleaningTasks} tareas. Puedes cambiar este límite en la sección de ajustes.`);
        return false;
      }

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

      // 4. Recalcular el progreso solo si hay un responsable asignado
      if (currentAssignee !== "Sin asignar") {
        const completedTasks = tasks.filter(task => task.completed).length;
        const newPercentage = Math.round((completedTasks / (tasks.length + 1)) * 100);
        setCompletionPercentage(newPercentage);
        await updateProgressRecord(currentAssignee, newPercentage);
      } else {
        // Si no hay responsable, mantener el progreso en 0
        setCompletionPercentage(0);
      }

      // 5. Notificar al responsable actual si existe (opcional, no crítico)
      if (currentAssignee !== "Sin asignar") {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          // sendTaskAssignmentEmail ya maneja errores silenciosamente
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            `Se te ha asignado una nueva tarea: ${newTaskData.description}`,
            "cleaning"
          );
        }
      } else {
        // Mostrar mensaje informativo si no hay responsable
        toast.success("Tarea agregada exitosamente. Recuerda asignar un responsable para un mejor seguimiento.");
        void refreshCleaningState();
        return true;
      }

      toast.success("Tarea agregada exitosamente");
      void refreshCleaningState();
      return true;
    } catch (error) {
      console.error('Error al agregar la tarea:', error);
      toast.error("Error al crear la tarea");
      return false;
    }
  };

  // Actualizar una tarea
  const updateTask = async (taskId: number, description: string, comment: string) => {
    try {
      const { error: updateError } = await supabase
        .from('general_cleaning_tasks')
        .update({
          description,
          comment
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Actualizar el estado local
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, description, comment }
          : task
      ));

      toast.success("Tarea actualizada exitosamente");
      void refreshCleaningState();
      return true;
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      toast.error("Error al actualizar la tarea");
      return false;
    }
  };

  // Eliminar una tarea
  const deleteTask = async (taskId: number) => {
    try {
      // 1. Eliminar el estado de la tarea
      const { error: stateError } = await supabase
        .from('cleaning_task_states')
        .delete()
        .eq('task_id', taskId);

      if (stateError) throw stateError;

      // 2. Eliminar la tarea
      const { error: taskError } = await supabase
        .from('general_cleaning_tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      // 3. Actualizar el estado local
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // 4. Recalcular el progreso
      const completedTasks = updatedTasks.filter(task => task.completed).length;
      const newPercentage = updatedTasks.length > 0 
        ? Math.round((completedTasks / updatedTasks.length) * 100)
        : 0;
      setCompletionPercentage(newPercentage);
      await updateProgressRecord(currentAssignee, newPercentage);

      toast.success("Tarea eliminada exitosamente");
      void refreshCleaningState();
      return true;
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error("Error al eliminar la tarea");
      return false;
    }
  };

  // Suscribirse a cambios en las tareas y estados con mejor manejo
  useEffect(() => {
    // Crear canal con nombre único para evitar conflictos
    const channelName = `general_cleaning_changes_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Configurar listeners para cambios en tiempo real
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'general_cleaning_tasks',
        },
        (payload) => {
          console.log('Cambio en general_cleaning_tasks:', payload);
          void refreshCleaningState();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cleaning_task_states',
        },
        (payload) => {
          console.log('Cambio en cleaning_task_states:', payload);
          void refreshCleaningState();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'general_cleaning_progress',
        },
        (payload) => {
          console.log('Cambio en general_cleaning_progress:', payload);
          void refreshCleaningState();
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
  }, [refreshCleaningState]);

  const isLoading =
    generalCleaningQuery.isLoading ||
    (generalCleaningQuery.isFetching && !generalCleaningQuery.data) ||
    profiles.length === 0;

  return {
    tasks,
    currentAssignee,
    completionPercentage,
    isLoading,
    updateTaskState,
    changeAssignee,
    addTask,
    updateTask,
    deleteTask
  };
};
