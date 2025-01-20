import { supabase } from "@/integrations/supabase/client";

export const sendTaskAssignmentEmail = async (
  email: string,
  assignee: string,
  taskTitle: string,
  taskType: "cleaning" | "recurring",
  scheduleText?: string,
  notificationTime?: string
) => {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: taskType === "cleaning" 
          ? "Nueva tarea de limpieza asignada"
          : "Nueva tarea periódica asignada",
        content: taskType === "cleaning"
          ? `Hola ${assignee},\n\nSe te ha asignado una nueva tarea de limpieza general:\n\n${taskTitle}\n\nPor favor, revisa la aplicación para ver los detalles.`
          : `Hola ${assignee},\n\nSe te ha asignado una nueva tarea periódica:\n\n${taskTitle}\n\nProgramación: ${scheduleText}\nHora de notificación: ${notificationTime}\n\nPor favor, revisa la aplicación para ver los detalles.`
      }
    });

    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
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