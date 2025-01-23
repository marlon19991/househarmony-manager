import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendBillDueEmail } from "@/utils/emailUtils";
import type { Bill } from "./billsLogic";

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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (!profiles) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    // Enviar correo a cada perfil
    for (const profile of profiles) {
      if (!profile.email) continue;

      await sendBillDueEmail(
        profile.email,
        profile.name,
        bill.title,
        dueDate,
        bill.amount,
        false // no está vencida
      );
    }

    // Registrar que se envió la notificación
    await supabase
      .from('bill_notifications')
      .insert({
        bill_id: bill.id,
        notification_type: 'due_date'
      });

  } catch (error) {
    console.error('Error al enviar notificación de vencimiento próximo:', error);
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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (!profiles) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    // Enviar correo a cada perfil
    for (const profile of profiles) {
      if (!profile.email) continue;

      await sendBillDueEmail(
        profile.email,
        profile.name,
        bill.title,
        dueDate,
        bill.amount,
        true // está vencida
      );
    }

    // Registrar que se envió la notificación
    await supabase
      .from('bill_notifications')
      .insert({
        bill_id: bill.id,
        notification_type: 'overdue'
      });

  } catch (error) {
    console.error('Error al enviar notificación de vencimiento:', error);
  }
};