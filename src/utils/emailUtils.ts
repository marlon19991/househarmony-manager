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
  to: string,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number,
  isOverdue: boolean
) => {
  try {
    console.log('Enviando correo de notificación de factura:', {
      to,
      billTitle,
      dueDate,
      isOverdue
    });

    const emailData = {
      to,
      subject: isOverdue 
        ? `Factura vencida: ${billTitle}`
        : `Recordatorio de factura próxima a vencer: ${billTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hola ${userName},</h2>
          <p style="color: #666; font-size: 16px;">
            ${isOverdue 
              ? `La factura <strong>${billTitle}</strong> está vencida desde el ${dueDate}.` 
              : `La factura <strong>${billTitle}</strong> vence el ${dueDate}.`}
          </p>
          <p style="color: #666; font-size: 16px;">
            Monto a pagar: <strong>$${amount.toLocaleString('es-CO')}</strong>
          </p>
          <p style="color: #666; font-size: 16px;">
            ${isOverdue
              ? 'Por favor, realiza el pago lo antes posible para evitar recargos adicionales.'
              : 'Por favor, asegúrate de realizar el pago antes de la fecha de vencimiento.'}
          </p>
          <div style="margin-top: 24px; padding: 16px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Este es un mensaje automático. Por favor, no respondas a este correo.
            </p>
          </div>
        </div>
      `
    };

    const { error, data } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('Error al enviar el correo de notificación:', error);
      throw error;
    }

    console.log('Correo enviado exitosamente:', {
      to,
      billTitle,
      response: data
    });

  } catch (error) {
    console.error('Error al enviar el correo de notificación de factura:', error);
    throw error;
  }
};