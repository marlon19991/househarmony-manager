import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillForm } from "./BillForm";
import { BillStatus } from "./BillStatus";
import { BillDates } from "./BillDates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

export const BillItem = ({ bill, onUpdate, onDelete, onToggleStatus }: BillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const getBorderColor = () => {
    if (bill.status === "paid") return "border-green-500";
    
    const today = new Date();
    const daysUntilDue = Math.floor((bill.paymentDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return "border-red-500";
    if (daysUntilDue <= 5) return "border-orange-500";
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

  const amountPerPerson = bill.selectedProfiles.length > 0 
    ? bill.amount / bill.selectedProfiles.length 
    : bill.amount;

  return (
    <Card className={cn("p-4 border-2", getBorderColor())}>
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
            <p className="text-sm text-muted-foreground">
              Total: ${bill.amount.toFixed(2)} - ${amountPerPerson.toFixed(2)} por persona
            </p>
            <BillDates 
              paymentDueDate={bill.paymentDueDate}
              status={bill.status}
            />
            <p className="text-sm text-muted-foreground">
              Dividido entre: {bill.selectedProfiles.length} persona(s)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(bill.id)}
            >
              {bill.status === "paid" ? "Marcar como pendiente" : "Marcar como pagada"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la factura permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(bill.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};