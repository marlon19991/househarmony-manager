import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const getDayOfWeek = (date: Date): number => {
  return date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const currentTime = formatTime(now);
    const currentDay = getDayOfWeek(now);
    
    // Get all tasks that should be notified now
    const { data: tasks, error: tasksError } = await supabase
      .from('recurring_tasks')
      .select('*, assignees')
      .or(`
        and(recurrence_type.eq.specific,start_date.eq.${now.toISOString().split('T')[0]}),
        and(recurrence_type.eq.weekly,weekdays->>${currentDay}.eq.true),
        and(recurrence_type.eq.workdays,${currentDay}.gt.0,${currentDay}.lt.6)
      `)
      .eq('notification_time', currentTime);

    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send notifications for each task
    for (const task of tasks) {
      if (!task.assignees) continue;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('name, email')
        .in('name', task.assignees);

      if (profilesError) throw profilesError;

      for (const profile of profiles || []) {
        if (!profile.email) continue;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "LaJause <onboarding@resend.dev>",
            to: profile.email,
            subject: `Recordatorio: ${task.title}`,
            html: `
              <h1>Hola ${profile.name},</h1>
              <p>Tienes una tarea programada para hoy:</p>
              <h2>${task.title}</h2>
              <p>Hora: ${task.notification_time}</p>
              <p>Por favor, no olvides completarla.</p>
            `,
          }),
        });

        if (!res.ok) {
          console.error(`Error sending email to ${profile.email}:`, await res.text());
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Notifications sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-task-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);