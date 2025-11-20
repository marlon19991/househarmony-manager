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
  last_completion?: {
    id: number;
    completed_at: string;
    evidence_url?: string | null;
  };
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

const mapTaskRecord = (task: any): RecurringTask => {
  // Find the latest completion (assuming the query returns them, or we sort them here)
  // We filter for completions from "today" to determine current status, 
  // or just take the absolute latest if that's the logic.
  // For now, let's attach the latest completion.
  const completions = task.recurring_task_completions || [];
  const lastCompletion = completions.length > 0
    ? completions.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]
    : null;

  return {
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
    last_completion: lastCompletion ? {
      id: lastCompletion.id,
      completed_at: lastCompletion.completed_at,
      evidence_url: lastCompletion.evidence_url
    } : undefined
  };
};

const fetchRecurringTasks = async (): Promise<RecurringTask[]> => {
  const { data, error } = await supabase
    .from("recurring_tasks")
    .select(`
      *,
      recurring_task_completions (
        id,
        completed_at,
        evidence_url
      )
    `)
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

  const completeTaskMutation = useSupabaseCrud<
    { task_id: number; evidence_url?: string },
    any,
    any
  >({
    table: "recurring_task_completions",
    queryKey: RECURRING_TASKS_QUERY_KEY,
    toastMessages: {
      createSuccess: "Tarea marcada como completada",
    },
  }).createMutation;

  return {
    tasksQuery,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    completeTaskMutation,
  };
};
