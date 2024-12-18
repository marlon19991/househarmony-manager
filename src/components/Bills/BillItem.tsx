import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BillForm } from "./BillForm";
import { BillStatus } from "./BillStatus";
import { BillDates } from "./BillDates";
import { BillAmount } from "./BillAmount";
import { BillActions } from "./BillActions";

interface Bill {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  paymentDueDate: Date;
  status: "pending" | "paid";
  splitBetween: number;
  selectedProfiles: string[];
}

interface BillItemProps {
  bill: Bill;
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillItem = ({ 
  bill, 
  onUpdate, 
  onDelete, 
  onToggleStatus,
}: BillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

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