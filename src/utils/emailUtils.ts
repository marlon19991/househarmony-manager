import { supabase } from "@/integrations/supabase/client";

export const sendTaskAssignmentEmail = async (
  email: string,
  assignee: string,
  taskTitle: string,
  taskType: "cleaning" | "recurring",
  schedule?: string,
  notificationTime?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const projectUrl = window.location.origin;

    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        assignee,
        taskTitle,
        taskType,
        schedule,
        notificationTime,
        projectUrl
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};