import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js";

type SubscriptionConfig = {
  table: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  schema?: string;
  filter?: string;
  callback?: (payload: PostgresChangesPayload<Record<string, unknown>>) => void;
};

/**
 * Shared helper to subscribe to Supabase realtime events and clean up automatically.
 * Ensure that the configs array and the callbacks are memoized to avoid resubscribing unnecessarily.
 */
export const useRealtimeSubscription = (
  channelName: string,
  configs: SubscriptionConfig[],
  onStatusChange?: (status: RealtimeChannel["state"]) => void
) => {
  useEffect(() => {
    if (!configs.length) return;

    const channel = supabase.channel(channelName);

    configs.forEach(({ table, event = "*", schema = "public", filter, callback }) => {
      channel.on(
        "postgres_changes",
        { event, schema, table, filter },
        (payload) => callback?.(payload)
      );
    });

    channel.subscribe((status) => {
      onStatusChange?.(status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, configs, onStatusChange]);
};
