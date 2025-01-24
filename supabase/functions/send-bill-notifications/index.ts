// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from '@supabase/supabase-js';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Hello from Functions!")

console.log("Iniciando verificación de facturas...");

Deno.serve(async (req) => {
  try {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);
    
    console.log('Verificando facturas:', {
      now: now.toISOString(),
      threeDaysFromNow: threeDaysFromNow.toISOString()
    });

    // Obtener facturas pendientes que vencen en los próximos 3 días o ya están vencidas
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*, profiles!bills_selected_profiles_fkey(name, email)')
      .eq('status', 'pending')
      .or(`due_date.lte.${threeDaysFromNow.toISOString()},due_date.lte.${now.toISOString()}`);

    if (billsError) {
      console.error('Error al obtener facturas:', billsError);
      throw billsError;
    }

    if (!bills || bills.length === 0) {
      console.log('No se encontraron facturas que requieran notificaciones');
      return new Response(
        JSON.stringify({ message: "No hay facturas que requieran notificaciones" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Se encontraron ${bills.length} facturas para procesar`);

    let notificationsSent = 0;
    for (const bill of bills) {
      const dueDate = new Date(bill.due_date);
      const isOverdue = dueDate <= now;
      const isDueSoon = !isOverdue && dueDate <= threeDaysFromNow;
      
      console.log(`Analizando factura "${bill.title}":`, {
        dueDate: dueDate.toISOString(),
        isOverdue,
        isDueSoon,
        profiles: bill.profiles?.length || 0
      });

      if (!isOverdue && !isDueSoon) {
        console.log(`La factura ${bill.title} no requiere notificación aún`);
        continue;
      }

      const notificationType = isOverdue ? 'overdue' : 'due_date';

      // Verificar si ya se envió una notificación para esta factura
      const { data: existingNotification } = await supabase
        .from('bill_notifications')
        .select()
        .eq('bill_id', bill.id)
        .eq('notification_type', notificationType)
        .maybeSingle();

      if (existingNotification) {
        console.log(`Ya existe una notificación ${notificationType} para la factura "${bill.title}"`);
        continue;
      }

      // Formatear la fecha de vencimiento
      const formattedDueDate = format(dueDate, "PPP", { locale: es });

      // Enviar correo a cada perfil asociado
      if (!bill.profiles || bill.profiles.length === 0) {
        console.log(`La factura "${bill.title}" no tiene perfiles asociados`);
        continue;
      }

      for (const profile of bill.profiles) {
        if (!profile.email) {
          console.log(`El perfil ${profile.name} no tiene email configurado`);
          continue;
        }

        try {
          console.log(`Intentando enviar correo a ${profile.email} para la factura "${bill.title}"`);
          
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: profile.email,
              subject: isOverdue 
                ? `Factura vencida: ${bill.title}`
                : `Recordatorio de factura próxima a vencer: ${bill.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Hola ${profile.name},</h2>
                  <p style="color: #666; font-size: 16px;">
                    ${isOverdue 
                      ? `La factura <strong>${bill.title}</strong> está vencida desde el ${formattedDueDate}.` 
                      : `La factura <strong>${bill.title}</strong> vence el ${formattedDueDate}.`}
                  </p>
                  <p style="color: #666; font-size: 16px;">
                    Monto a pagar: <strong>$${bill.amount.toLocaleString('es-CO')}</strong>
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
            }
          });

          if (emailError) {
            console.error(`Error al enviar correo a ${profile.email}:`, emailError);
            continue;
          }

          // Registrar la notificación enviada
          const { error: notificationError } = await supabase
            .from('bill_notifications')
            .insert({
              bill_id: bill.id,
              notification_type: notificationType,
              profile_id: profile.id
            });

          if (notificationError) {
            console.error(`Error al registrar la notificación:`, notificationError);
            continue;
          }

          console.log(`✓ Notificación enviada exitosamente a ${profile.email} para la factura "${bill.title}"`);
          notificationsSent++;
        } catch (error) {
          console.error(`Error al procesar notificación para ${profile.email}:`, error);
        }
      }
    }

    const message = notificationsSent > 0 
      ? `Se enviaron ${notificationsSent} notificaciones exitosamente`
      : "No se requirió enviar notificaciones";

    return new Response(
      JSON.stringify({ message }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error al procesar notificaciones:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-bill-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
