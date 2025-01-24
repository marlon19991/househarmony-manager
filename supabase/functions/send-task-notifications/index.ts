// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

const RESEND_API_KEY = window.Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = window.Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = window.Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
  // Ajustar a zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime.getDay();
};

const formatTime = (date: Date): string => {
  // Ajustar a zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
  const hours = colombiaTime.getHours().toString().padStart(2, '0');
  const minutes = colombiaTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const currentTime = formatTime(now);
    const currentDay = getDayOfWeek(now);
    const todayDate = new Date(now.getTime() - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    console.log('Current time in Colombia:', {
      utc: now.toISOString(),
      colombiaTime: currentTime,
      colombiaDay: currentDay,
      todayDate: todayDate,
      rawDate: now.toString()
    });

    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    // Manejar notificación directa de cambio de responsable
    if (requestData.assigneeEmail && requestData.assigneeName) {
      console.log('Sending direct notification to:', requestData.assigneeEmail);
      
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "LaJause <onboarding@resend.dev>",
          to: requestData.assigneeEmail,
          subject: "Asignación de Aseo General",
          html: `
            <h1>Hola ${requestData.assigneeName},</h1>
            <p>Se te ha asignado el turno de aseo general.</p>
            <p>Por favor, completa las tareas asignadas.</p>
          `,
        }),
      });

      const responseData = await res.text();
      console.log(`Email sending response:`, {
        status: res.status,
        response: responseData
      });

      if (!res.ok) {
        throw new Error(responseData || "Failed to send email");
      }

      return new Response(
        JSON.stringify({ message: "Notification sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Manejar notificación de tarea recurrente específica
    if (requestData.taskId && requestData.assignees) {
      console.log('Processing recurring task notification with data:', {
        taskId: requestData.taskId,
        assignees: requestData.assignees,
        title: requestData.title,
        notification_time: requestData.notification_time,
        recurrence_type: requestData.recurrence_type
      });

      if (!Array.isArray(requestData.assignees) || requestData.assignees.length === 0) {
        console.log('No assignees provided or invalid assignees format');
        return new Response(
          JSON.stringify({ message: "No valid assignees provided" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Obtener todos los perfiles de una sola vez
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('name, email')
        .in('name', requestData.assignees);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Found profiles for notification:', profiles);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for the provided assignees');
        return new Response(
          JSON.stringify({ message: "No profiles found for the provided assignees" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const successfulNotifications = [];
      const failedNotifications = [];

      // Enviar notificaciones a los asignados que tengan correo
      for (const profile of profiles) {
        if (!profile?.email) {
          console.log('Profile has no email:', profile.name);
          failedNotifications.push({ name: profile.name, reason: 'No email address' });
          continue;
        }

        try {
          console.log(`Attempting to send email to ${profile.name} (${profile.email})`);
          
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "LaJause <onboarding@resend.dev>",
              to: profile.email,
              subject: `Recordatorio de tarea: ${requestData.title}`,
              html: `
                <h1>Hola ${profile.name},</h1>
                <p>Tienes una tarea programada:</p>
                <h2>${requestData.title}</h2>
                <p>Hora: ${requestData.notification_time}</p>
                <p>Tipo de recurrencia: ${requestData.recurrence_type}</p>
                <p>Por favor, no olvides completarla.</p>
              `,
            }),
          });

          const responseData = await res.text();
          console.log(`Email sending response for ${profile.email}:`, {
            status: res.status,
            response: responseData
          });

          if (!res.ok) {
            throw new Error(responseData || "Failed to send email");
          }

          successfulNotifications.push(profile.name);
        } catch (error) {
          console.error(`Error sending email to ${profile.email}:`, error);
          failedNotifications.push({ name: profile.name, reason: error.message });
        }
      }

      return new Response(
        JSON.stringify({ 
          message: "Recurring task notifications processed",
          successful: successfulNotifications,
          failed: failedNotifications
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Si se proporciona una tarea específica, enviar notificación inmediata
    if (requestData.taskId) {
      console.log('Processing immediate notification for task:', requestData.taskId);
      
      const { data: task, error: taskError } = await supabase
        .from('recurring_tasks')
        .select('*, assignees')
        .eq('id', requestData.taskId)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        throw taskError;
      }

      if (!task) {
        return new Response(
          JSON.stringify({ message: "Task not found" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404 
          }
        );
      }

      console.log('Task found:', task);

      if (!task.assignees || task.assignees.length === 0) {
        return new Response(
          JSON.stringify({ message: "Task has no assignees" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('name, email')
        .in('name', task.assignees);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Found profiles:', profiles);

      for (const profile of profiles || []) {
        if (!profile.email) {
          console.log('Profile has no email:', profile.name);
          continue;
        }

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "LaJause <onboarding@resend.dev>",
              to: profile.email,
              subject: `Nueva tarea asignada: ${task.title}`,
              html: `
                <h1>Hola ${profile.name},</h1>
                <p>Se te ha asignado una nueva tarea:</p>
                <h2>${task.title}</h2>
                ${task.notification_time ? `<p>Hora programada: ${task.notification_time}</p>` : ''}
                <p>Por favor, no olvides completarla.</p>
              `,
            }),
          });

          const responseData = await res.text();
          console.log(`Email sending response for ${profile.email}:`, {
            status: res.status,
            response: responseData
          });

          if (!res.ok) {
            console.error(`Error sending email to ${profile.email}:`, responseData);
          }
        } catch (error) {
          console.error(`Exception sending email to ${profile.email}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ message: "Immediate notification sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener tareas que deben ser notificadas ahora
    console.log('Checking for tasks to notify at:', currentTime);
    
    // Specific date tasks
    const { data: specificTasks, error: specificError } = await supabase
      .from('recurring_tasks')
      .select('*, assignees')
      .eq('recurrence_type', 'specific')
      .eq('start_date', todayDate)
      .eq('notification_time', currentTime);

    console.log('Specific tasks found:', specificTasks);
    if (specificError) {
      console.error('Error fetching specific tasks:', specificError);
      throw specificError;
    }

    // Weekly tasks
    const { data: weeklyTasks, error: weeklyError } = await supabase
      .from('recurring_tasks')
      .select('*, assignees')
      .eq('recurrence_type', 'weekly')
      .eq('notification_time', currentTime);

    console.log('Weekly tasks found:', weeklyTasks);
    if (weeklyError) {
      console.error('Error fetching weekly tasks:', weeklyError);
      throw weeklyError;
    }

    // Filtrar tareas semanales que coincidan con el día actual
    const filteredWeeklyTasks = (weeklyTasks || []).filter(task => {
      if (!task.weekdays || !Array.isArray(task.weekdays)) {
        console.log('Invalid weekdays for task:', task.title);
        return false;
      }
      const matches = task.weekdays[currentDay];
      console.log(`Task ${task.title} weekday check:`, {
        weekdays: task.weekdays,
        currentDay,
        matches
      });
      return matches;
    });

    console.log('Filtered weekly tasks for current day:', filteredWeeklyTasks);

    // Workday tasks (Monday to Friday)
    const { data: workdayTasks, error: workdayError } = await supabase
      .from('recurring_tasks')
      .select('*, assignees')
      .eq('recurrence_type', 'workdays')
      .eq('notification_time', currentTime);

    console.log('Workday tasks found:', workdayTasks);
    if (workdayError) {
      console.error('Error fetching workday tasks:', workdayError);
      throw workdayError;
    }

    // Solo incluir tareas de días laborables si es un día laboral (lunes a viernes)
    const workdayTasksFiltered = currentDay >= 1 && currentDay <= 5 ? workdayTasks : [];
    console.log('Filtered workday tasks:', {
      isWorkday: currentDay >= 1 && currentDay <= 5,
      tasks: workdayTasksFiltered
    });

    // Combine all tasks
    const tasks = [
      ...(specificTasks || []),
      ...filteredWeeklyTasks,
      ...(workdayTasksFiltered || [])
    ];

    console.log('Total tasks to process:', {
      count: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        notification_time: t.notification_time,
        assignees: t.assignees
      }))
    });

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const successfulNotifications = [];
    const failedNotifications = [];

    // Send notifications for each task
    for (const task of tasks) {
      if (!task.assignees || !Array.isArray(task.assignees) || task.assignees.length === 0) {
        console.log('Task has no assignees:', task.title);
        continue;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('name, email')
        .in('name', task.assignees);

      if (profilesError) {
        console.error('Error fetching profiles for task:', task.title, profilesError);
        continue;
      }

      console.log(`Found ${profiles?.length || 0} profiles for task:`, task.title);

      for (const profile of profiles || []) {
        if (!profile?.email) {
          console.log('Profile has no email:', profile.name);
          failedNotifications.push({ name: profile.name, reason: 'No email address' });
          continue;
        }

        try {
          console.log(`Sending notification to ${profile.name} (${profile.email}) for task:`, task.title);

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

          const responseData = await res.text();
          console.log(`Email sending response for ${profile.email}:`, {
            status: res.status,
            response: responseData
          });

        if (!res.ok) {
            throw new Error(responseData || "Failed to send email");
          }

          successfulNotifications.push(profile.name);
        } catch (error) {
          console.error(`Error sending email to ${profile.email}:`, error);
          failedNotifications.push({ name: profile.name, reason: error.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Task notifications processed",
        successful: successfulNotifications,
        failed: failedNotifications
      }),
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