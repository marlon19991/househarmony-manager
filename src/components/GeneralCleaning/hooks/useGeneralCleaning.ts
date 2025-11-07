import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/Task";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useSettings } from "@/hooks/useSettings";

export const useGeneralCleaning = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentAssignee, setCurrentAssignee] = useState<string>("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { profiles } = useProfiles();
  const { maxCleaningTasks } = useSettings();

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

      // 3. Calcular y actualizar el progreso solo si hay un responsable asignado
      if (currentAssignee !== "Sin asignar" && updatedTasks.length > 0) {
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const newPercentage = Math.round((completedTasks / updatedTasks.length) * 100);
        setCompletionPercentage(newPercentage);

        // 4. Actualizar el progreso en la base de datos
        await updateProgress(currentAssignee, newPercentage);
      } else {
        // Si no hay responsable, solo actualizar el estado local
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const newPercentage = updatedTasks.length > 0 
          ? Math.round((completedTasks / updatedTasks.length) * 100)
          : 0;
        setCompletionPercentage(newPercentage);
      }

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
    } catch (error) {
      console.error('Error al cambiar el responsable:', error);
      toast.error("Error al cambiar el responsable");
      await loadInitialState();
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
        await updateProgress(currentAssignee, newPercentage);
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
        return true;
      }

      toast.success("Tarea agregada exitosamente");
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
      await updateProgress(currentAssignee, newPercentage);

      toast.success("Tarea eliminada exitosamente");
      return true;
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error("Error al eliminar la tarea");
      return false;
    }
  };

  // Cargar el estado inicial cuando el componente se monta o cuando cambian los perfiles
  useEffect(() => {
    if (profiles.length > 0) {
      loadInitialState();
    }
  }, [profiles]);

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
          loadInitialState();
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
          loadInitialState();
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
          loadInitialState();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadInitialState se mantiene estable y no necesita estar en deps

  return {
    tasks,
    currentAssignee,
    completionPercentage,
    isLoading,
    updateTaskState,
    changeAssignee,
    loadInitialState,
    addTask,
    updateTask,
    deleteTask
  };
}; 