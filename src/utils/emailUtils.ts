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
    const emailData = {
      to: email,
      subject: taskType === "cleaning" 
        ? "Nueva tarea de limpieza asignada"
        : "Nueva tarea periódica asignada",
      template: "task_assignment",
      data: {
        assignee,
        taskTitle,
        taskType,
        scheduleText: scheduleText || "",
        notificationTime: notificationTime || "",
        isRecurring: taskType === "recurring"
      }
    };

    const { error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    // No volvemos a lanzar el error para evitar que se detenga el flujo de la aplicación
    // La tarea se guardará aunque falle el envío del correo
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
    const emailData = {
      to: email,
      subject: isOverdue 
        ? "Recordatorio de pago vencido"
        : "Recordatorio de pago próximo",
      template: "bill_due",
      data: {
        userName,
        billTitle,
        dueDate,
        amount,
        isOverdue
      }
    };

    const { error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error al enviar recordatorio de pago:', error);
    // No volvemos a lanzar el error para evitar que se detenga el flujo de la aplicación
  }
};