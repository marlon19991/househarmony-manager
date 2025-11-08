import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Detectar si estamos en desarrollo local
const isLocalDevelopment = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  return url.includes('localhost') || url.includes('127.0.0.1') || url.includes('local');
};

/**
 * Envía un correo electrónico de asignación de tarea
 * En desarrollo local, esta función es opcional y no lanzará errores
 */
export const sendTaskAssignmentEmail = async (
  email: string,
  assignee: string,
  taskTitle: string,
  taskType: "cleaning" | "recurring",
  scheduleText?: string,
  notificationTime?: string
) => {
  // En desarrollo local, las Edge Functions pueden no estar disponibles
  if (isLocalDevelopment()) {
    logger.info('📧 [Desarrollo Local] Notificación de email omitida', {
      to: email,
      assignee,
      taskTitle,
      taskType
    });
    return; // Salir silenciosamente en desarrollo local
  }

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
      // En desarrollo, solo loguear sin lanzar error
      logger.warn('⚠️ No se pudo enviar el correo electrónico (esto es normal en desarrollo local)', { error });
      return;
    }
  } catch (error: any) {
    // En desarrollo local, los errores de funciones son esperados
    if (isLocalDevelopment()) {
      logger.info('📧 [Desarrollo Local] Función de email no disponible (normal en desarrollo)');
      return;
    }
    // En producción, loguear pero no interrumpir el flujo
    logger.warn('⚠️ Error al enviar el correo electrónico', { error });
  }
};

/**
 * Envía un correo electrónico de notificación de factura
 * En desarrollo local, esta función es opcional y no lanzará errores
 */
export const sendBillDueEmail = async (
  to: string,
  userName: string,
  billTitle: string,
  dueDate: string,
  amount: number,
  isOverdue: boolean
) => {
  // En desarrollo local, las Edge Functions pueden no estar disponibles
  if (isLocalDevelopment()) {
    logger.info('📧 [Desarrollo Local] Notificación de factura omitida', {
      to,
      billTitle,
      dueDate,
      isOverdue
    });
    return; // Salir silenciosamente en desarrollo local
  }

  try {
    // Validar el correo electrónico
    if (!to || !to.includes('@') || !to.includes('.')) {
      logger.warn('⚠️ Correo electrónico inválido', { to });
      return;
    }

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

    const { error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      logger.warn('⚠️ No se pudo enviar el correo de notificación (esto es normal en desarrollo local)', { error });
      return; // No lanzar error, solo loguear
    }

    logger.info('✅ Correo enviado exitosamente', {
      to,
      billTitle
    });

  } catch (error: any) {
    // En desarrollo local, los errores de funciones son esperados
    if (isLocalDevelopment()) {
      logger.info('📧 [Desarrollo Local] Función de email no disponible (normal en desarrollo)');
      return;
    }
    // En producción, loguear pero no interrumpir el flujo
    logger.warn('⚠️ Error al enviar el correo de notificación de factura', { error });
  }
};
