import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BillForm } from "./BillForm";
import { BillStatus } from "./BillStatus";
import { BillDates } from "./BillDates";
import { BillAmount } from "./BillAmount";
import { BillActions } from "./BillActions";
import { sendBillDueEmail } from "@/utils/emailUtils";
import useProfiles from "@/hooks/useProfiles";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import type { Bill } from "./utils/billsLogic";

interface BillItemProps {
  bill: Bill;
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillItem = ({ bill, onUpdate, onDelete, onToggleStatus }: BillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { profiles } = useProfiles();

  useEffect(() => {
    const checkDueDate = async () => {
      const daysUntilDue = differenceInDays(bill.paymentDueDate, new Date());
      
      // Send email if bill is due in 5 days or less
      if (daysUntilDue <= 5 && daysUntilDue >= 0 && bill.status === "pending") {
        // Check if notification was already sent
        const { data: existingNotification } = await supabase
          .from('bill_notifications')
          .select()
          .eq('bill_id', bill.id)
          .eq('notification_type', 'due_date')
          .single();

        if (!existingNotification) {
          const formattedDate = format(bill.paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es });
          
          // Send email to each selected profile
          for (const profileName of bill.selectedProfiles) {
            const profile = profiles.find(p => p.name === profileName);
            if (profile?.email) {
              await sendBillDueEmail(
                profile.email,
                profile.name,
                bill.title,
                formattedDate,
                bill.amount
              );
            }
          }

          // Record the notification
          await supabase
            .from('bill_notifications')
            .insert({
              bill_id: bill.id,
              notification_type: 'due_date'
            });
        }
      }
    };

    checkDueDate();
  }, [bill, profiles]);

  const getBorderColor = () => {
    if (bill.status === "paid") return "border-green-500";
    
    const today = new Date();
    const daysUntilDue = Math.floor((bill.paymentDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return "border-red-500";
    if (daysUntilDue <= 5) return "border-yellow-500";
    return "border-green-500";
  };

  const handleUpdate = (formData: any) => {
    onUpdate({
      ...bill,
      title: formData.title,
      amount: parseFloat(formData.amount),
      paymentDueDate: new Date(formData.paymentDueDate),
      selectedProfiles: formData.selectedProfiles,
      splitBetween: formData.selectedProfiles.length || 1
    });
    setIsEditing(false);
  };

  return (
    <Card className={cn("p-4 border-l-4", getBorderColor())}>
      {isEditing ? (
        <BillForm 
          onSubmit={handleUpdate}
          initialData={{
            title: bill.title,
            amount: bill.amount,
            paymentDueDate: bill.paymentDueDate.toISOString().split('T')[0],
            selectedProfiles: bill.selectedProfiles
          }}
        />
      ) : (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{bill.title}</h3>
              <BillStatus 
                status={bill.status}
                paymentDueDate={bill.paymentDueDate}
              />
            </div>
            <BillAmount 
              amount={bill.amount}
              selectedProfiles={bill.selectedProfiles}
            />
            <BillDates 
              paymentDueDate={bill.paymentDueDate}
              status={bill.status}
            />
          </div>
          <BillActions 
            status={bill.status}
            onToggleStatus={() => onToggleStatus(bill.id)}
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDelete(bill.id)}
            title={bill.title}
          />
        </div>
      )}
    </Card>
  );
};