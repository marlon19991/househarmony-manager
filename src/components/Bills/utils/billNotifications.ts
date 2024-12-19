import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendBillDueEmail } from "@/utils/emailUtils";

export const handleDueDateNotification = async (
  billId: number,
  title: string,
  amount: number,
  paymentDueDate: Date,
  selectedProfiles: string[],
  profiles: any[]
) => {
  try {
    const { data: existingNotification, error } = await supabase
      .from('bill_notifications')
      .select()
      .eq('bill_id', billId)
      .eq('notification_type', 'due_date')
      .maybeSingle();

    if (error) {
      console.error('Error checking due date notification:', error);
      return;
    }

    if (!existingNotification) {
      const formattedDate = format(paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es });
      
      // Send email to each selected profile
      for (const profileName of selectedProfiles) {
        const profile = profiles.find(p => p.name === profileName);
        if (profile?.email) {
          await sendBillDueEmail(
            profile.email,
            profile.name,
            title,
            formattedDate,
            amount
          );
        }
      }

      // Record the notification
      const { error: insertError } = await supabase
        .from('bill_notifications')
        .insert({
          bill_id: billId,
          notification_type: 'due_date'
        });

      if (insertError) {
        console.error('Error recording due date notification:', insertError);
      }
    }
  } catch (error) {
    console.error('Error handling due date notification:', error);
  }
};

export const handleOverdueNotification = async (
  billId: number,
  title: string,
  amount: number,
  paymentDueDate: Date,
  selectedProfiles: string[],
  profiles: any[]
) => {
  try {
    const { data: existingNotification, error } = await supabase
      .from('bill_notifications')
      .select()
      .eq('bill_id', billId)
      .eq('notification_type', 'overdue')
      .maybeSingle();

    if (error) {
      console.error('Error checking overdue notification:', error);
      return;
    }

    if (!existingNotification) {
      const formattedDate = format(paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es });
      
      // Send overdue notification to each selected profile
      for (const profileName of selectedProfiles) {
        const profile = profiles.find(p => p.name === profileName);
        if (profile?.email) {
          await sendBillDueEmail(
            profile.email,
            profile.name,
            title,
            formattedDate,
            amount,
            true // indicates this is an overdue notification
          );
        }
      }

      // Record the notification
      const { error: insertError } = await supabase
        .from('bill_notifications')
        .insert({
          bill_id: billId,
          notification_type: 'overdue'
        });

      if (insertError) {
        console.error('Error recording overdue notification:', insertError);
      }
    }
  } catch (error) {
    console.error('Error handling overdue notification:', error);
  }
};