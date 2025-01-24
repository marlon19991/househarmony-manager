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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (!profiles || profiles.length === 0) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    // Enviar correo a cada perfil
    const emailPromises = profiles
      .filter(profile => profile.email) // Solo perfiles con email
      .map(async profile => {
        try {
          await sendBillDueEmail(
            profile.email!,
            profile.name,
            bill.title,
            dueDate,
            bill.amount,
            false // no está vencida
          );
          return { success: true, profile };
        } catch (error) {
          console.error(`Error al enviar correo a ${profile.email}:`, error);
          return { success: false, profile, error };
        }
      });

    // Esperar a que todos los correos se envíen
    const results = await Promise.all(emailPromises);
    
    // Contar éxitos y fallos
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Mostrar resumen
    if (successful > 0) {
      toast.success(`Se enviaron ${successful} notificaciones exitosamente`);
    }
    if (failed > 0) {
      toast.error(`Fallaron ${failed} notificaciones`);
    }

    // Registrar que se envió la notificación si al menos un correo fue exitoso
    if (successful > 0) {
      await supabase
        .from('bill_notifications')
        .insert({
          bill_id: bill.id,
          notification_type: 'due_date'
        });
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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('name, email')
      .in('name', bill.selected_profiles);

    if (!profiles || profiles.length === 0) {
      console.error('No se encontraron perfiles para enviar notificaciones');
      return;
    }

    // Enviar correo a cada perfil
    const emailPromises = profiles
      .filter(profile => profile.email) // Solo perfiles con email
      .map(async profile => {
        try {
          await sendBillDueEmail(
            profile.email!,
            profile.name,
            bill.title,
            dueDate,
            bill.amount,
            true // está vencida
          );
          return { success: true, profile };
        } catch (error) {
          console.error(`Error al enviar correo a ${profile.email}:`, error);
          return { success: false, profile, error };
        }
      });

    // Esperar a que todos los correos se envíen
    const results = await Promise.all(emailPromises);
    
    // Contar éxitos y fallos
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Mostrar resumen
    if (successful > 0) {
      toast.success(`Se enviaron ${successful} notificaciones exitosamente`);
    }
    if (failed > 0) {
      toast.error(`Fallaron ${failed} notificaciones`);
    }

    // Registrar que se envió la notificación si al menos un correo fue exitoso
    if (successful > 0) {
      await supabase
        .from('bill_notifications')
        .insert({
          bill_id: bill.id,
          notification_type: 'overdue'
        });
    }

  } catch (error) {
    console.error('Error al enviar notificación de vencimiento:', error);
    toast.error('Error al enviar notificaciones');
  }
};