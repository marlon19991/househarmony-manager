import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendBillDueEmail } from "@/utils/emailUtils";
import type { Bill } from "./billsLogic";
import { toast } from "sonner";

export const handleDueDateNotification = async (bill: Bill) => {
  try {
    // Verificar si ya se envió una notificación de vencimiento próximo
    const { data: existingNotification } = await supabase
      .from('bill_notifications')
      .select()
      .eq('bill_id', bill.id)
      .eq('notification_type', 'due_date')
      .maybeSingle();

    if (existingNotification) {
      console.log('Ya se envió una notificación de vencimiento próximo para esta factura');
      return;
    }

    // Formatear la fecha de vencimiento
    const dueDate = format(new Date(bill.payment_due_date), "PPP", { locale: es });

    // Obtener los perfiles asociados a la factura
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (profilesError) {
      console.error('Error al obtener perfiles:', profilesError);
      toast.error('Error al obtener información de los responsables');
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    // Enviar correo a cada perfil
    for (const profile of profiles) {
      if (!profile.email) {
        console.log(`El perfil ${profile.name} no tiene correo configurado`);
        continue;
      }

      try {
        await sendBillDueEmail(
          profile.email,
          profile.name,
          bill.title,
          dueDate,
          bill.amount,
          false // no está vencida
        );
        successCount++;
      } catch (error) {
        console.error(`Error al enviar correo a ${profile.email}:`, error);
        failedCount++;
        failedEmails.push(profile.name);
      }
    }

    // Registrar que se envió la notificación solo si al menos un correo fue exitoso
    if (successCount > 0) {
      await supabase
        .from('bill_notifications')
        .insert({
          bill_id: bill.id,
          notification_type: 'due_date'
        });

      // Mostrar mensaje de éxito con detalles
      if (failedCount === 0) {
        toast.success('Notificaciones enviadas exitosamente');
      } else {
        toast.success(
          `Notificaciones enviadas parcialmente: ${successCount} exitosas, ${failedCount} fallidas`,
          {
            description: `No se pudo enviar a: ${failedEmails.join(', ')}`
          }
        );
      }
    } else if (failedCount > 0) {
      toast.error('No se pudo enviar ninguna notificación');
    }

  } catch (error) {
    console.error('Error al enviar notificación de vencimiento próximo:', error);
    toast.error('Error al enviar notificaciones');
  }
};

export const handleOverdueNotification = async (bill: Bill) => {
  try {
    // Verificar si ya se envió una notificación de vencimiento
    const { data: existingNotification } = await supabase
      .from('bill_notifications')
      .select()
      .eq('bill_id', bill.id)
      .eq('notification_type', 'overdue')
      .maybeSingle();

    if (existingNotification) {
      console.log('Ya se envió una notificación de vencimiento para esta factura');
      return;
    }

    // Formatear la fecha de vencimiento
    const dueDate = format(new Date(bill.payment_due_date), "PPP", { locale: es });

    // Obtener los perfiles asociados a la factura
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (profilesError) {
      console.error('Error al obtener perfiles:', profilesError);
      toast.error('Error al obtener información de los responsables');
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    // Enviar correo a cada perfil
    for (const profile of profiles) {
      if (!profile.email) {
        console.log(`El perfil ${profile.name} no tiene correo configurado`);
        continue;
      }

      try {
        await sendBillDueEmail(
          profile.email,
          profile.name,
          bill.title,
          dueDate,
          bill.amount,
          true // está vencida
        );
        successCount++;
      } catch (error) {
        console.error(`Error al enviar correo a ${profile.email}:`, error);
        failedCount++;
        failedEmails.push(profile.name);
      }
    }

    // Registrar que se envió la notificación solo si al menos un correo fue exitoso
    if (successCount > 0) {
      await supabase
        .from('bill_notifications')
        .insert({
          bill_id: bill.id,
          notification_type: 'overdue'
        });

      // Mostrar mensaje de éxito con detalles
      if (failedCount === 0) {
        toast.success('Notificaciones de vencimiento enviadas exitosamente');
      } else {
        toast.success(
          `Notificaciones de vencimiento enviadas parcialmente: ${successCount} exitosas, ${failedCount} fallidas`,
          {
            description: `No se pudo enviar a: ${failedEmails.join(', ')}`
          }
        );
      }
    } else if (failedCount > 0) {
      toast.error('No se pudo enviar ninguna notificación de vencimiento');
    }

  } catch (error) {
    console.error('Error al enviar notificación de vencimiento:', error);
    toast.error('Error al enviar notificaciones de vencimiento');
  }
};