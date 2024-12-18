import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillForm } from "./BillForm";
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

  const getBillStatus = () => {
    if (bill.status === "paid") return "paid";
    
    const today = new Date();
    const daysUntilDue = differenceInDays(bill.paymentDueDate, today);
    
    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 5) return "pending";
    return "upcoming";
  };

  const getBorderColor = () => {
    const status = getBillStatus();
    switch (status) {
      case "paid":
        return "border-green-500";
      case "overdue":
        return "border-red-500";
      case "pending":
        return "border-orange-500";
      default:
        return "border-green-500";
    }
  };

  const getStatusText = () => {
    const status = getBillStatus();
    switch (status) {
      case "paid":
        return "Pagada";
      case "overdue":
        return "Vencida";
      case "pending":
        return "Pendiente";
      default:
        return "Próxima";
    }
  };

  const getStatusColor = () => {
    const status = getBillStatus();
    switch (status) {
      case "paid":
        return "text-green-500";
      case "overdue":
        return "text-red-500";
      case "pending":
        return "text-amber-500";
      default:
        return "text-green-500";
    }
  };

  const amountPerPerson = bill.selectedProfiles.length > 0 
    ? bill.amount / bill.selectedProfiles.length 
    : bill.amount;

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
          <div>
            <h3 className="font-medium">{bill.title}</h3>
            <p className="text-sm text-muted-foreground">
              Total: ${bill.amount.toFixed(2)} - ${amountPerPerson.toFixed(2)} por persona
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha límite: {format(bill.paymentDueDate, 'dd/MM/yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              Dividido entre: {bill.selectedProfiles.length} persona(s)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => onToggleStatus(bill.id)}
              className={getStatusColor()}
            >
              {getStatusText()}
            </Button>
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
      )}
    </Card>
  );
};