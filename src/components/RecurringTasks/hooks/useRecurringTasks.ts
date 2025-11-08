import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export type RecurrenceType = "weekly" | "workdays" | "specific" | string;

export interface RecurringTask {
  id: number;
  title: string;
  description?: string | null;
  weekdays: boolean[] | null;
  start_date: string | null;
  end_date: string | null;
  assignees: string[];
  icon?: string | null;
  recurrence_type: RecurrenceType;
  notification_time?: string | null;
  created_at?: string;
}

export type RecurringTaskPayload = {
  title: string;
  description?: string;
  notification_time: string;
  recurrence_type: RecurrenceType;
  start_date: string | null;
  end_date?: string | null;
  weekdays: boolean[] | null;
  assignees: string[];
  icon?: string;
};

const mapTaskRecord = (task: any): RecurringTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  weekdays: task.weekdays,
  start_date: task.start_date,
  end_date: task.end_date,
  assignees: task.assignees || [],
  icon: task.icon,
  recurrence_type: task.recurrence_type,
  notification_time: task.notification_time,
  created_at: task.created_at,
});

const fetchRecurringTasks = async (): Promise<RecurringTask[]> => {
  const { data, error } = await supabase
    .from("recurring_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTaskRecord);
};

export const RECURRING_TASKS_QUERY_KEY = ["recurring_tasks"];

export const useRecurringTasks = () => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: RECURRING_TASKS_QUERY_KEY,
    queryFn: fetchRecurringTasks,
  });

  const handleRealtimeInvalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: RECURRING_TASKS_QUERY_KEY });
  }, [queryClient]);

  const realtimeConfigs = useMemo(
    () => [
      {
        table: "recurring_tasks",
        callback: handleRealtimeInvalidate,
      },
    ],
    [handleRealtimeInvalidate]
  );

  useRealtimeSubscription("recurring_tasks_changes", realtimeConfigs);

  const {
    createMutation: createTaskMutation,
    updateMutation: updateTaskMutation,
    deleteMutation: deleteTaskMutation,
  } = useSupabaseCrud<
    RecurringTaskPayload,
    { id: number; data: RecurringTaskPayload },
    number
  >({
    table: "recurring_tasks",
    queryKey: RECURRING_TASKS_QUERY_KEY,
    mapUpdatePayload: ({ data }) => data,
    mapUpdateFilter: ({ id }) => ({ value: id }),
    toastMessages: {
      createSuccess: "Tarea creada exitosamente",
      updateSuccess: "Tarea actualizada exitosamente",
      deleteSuccess: "Tarea periódica eliminada exitosamente",
    },
  });

  return {
    tasksQuery,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
};
