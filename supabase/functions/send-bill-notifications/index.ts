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

Deno.serve(async (req) => {
  try {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    // Obtener facturas pendientes que vencen en los próximos 3 días o ya están vencidas
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*, profiles!bills_selected_profiles_fkey(name, email)')
      .eq('status', 'pending')
      .or(`payment_due_date.lte.${threeDaysFromNow.toISOString()},payment_due_date.lt.${now.toISOString()}`);

    if (billsError) throw billsError;
    if (!bills || bills.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hay facturas que requieran notificaciones" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Procesando ${bills.length} facturas...`);

    for (const bill of bills) {
      const dueDate = new Date(bill.payment_due_date);
      const isOverdue = dueDate < now;
      const notificationType = isOverdue ? 'overdue' : 'due_date';

      // Verificar si ya se envió una notificación para esta factura
      const { data: existingNotification } = await supabase
        .from('bill_notifications')
        .select()
        .eq('bill_id', bill.id)
        .eq('notification_type', notificationType)
        .maybeSingle();

      if (existingNotification) {
        console.log(`Ya existe una notificación ${notificationType} para la factura ${bill.id}`);
        continue;
      }

      // Formatear la fecha de vencimiento
      const formattedDueDate = format(dueDate, "PPP", { locale: es });

      // Enviar correo a cada perfil asociado
      for (const profile of bill.profiles) {
        if (!profile.email) {
          console.log(`El perfil ${profile.name} no tiene email configurado`);
          continue;
        }

        const emailData = {
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
        };

        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: emailData
        });

        if (emailError) {
          console.error(`Error al enviar email a ${profile.email}:`, emailError);
          continue;
        }

        console.log(`Email enviado a ${profile.email} para la factura ${bill.id}`);
      }

      // Registrar la notificación enviada
      await supabase
        .from('bill_notifications')
        .insert({
          bill_id: bill.id,
          notification_type: notificationType
        });

      console.log(`Notificación ${notificationType} registrada para la factura ${bill.id}`);
    }

    return new Response(
      JSON.stringify({ message: "Notificaciones de facturas enviadas exitosamente" }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error al procesar las notificaciones:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-bill-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
