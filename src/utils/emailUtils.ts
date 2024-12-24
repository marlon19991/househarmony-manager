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

export const sendBillDueEmail = async (
  email: string,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number,
  isOverdue: boolean = false
) => {
  try {
    const projectUrl = window.location.origin;

    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        userName,
        billTitle,
        dueDate,
        amount,
        isOverdue,
        type: 'bill_due',
        projectUrl
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending bill due email:', error);
    throw error;
  }
};