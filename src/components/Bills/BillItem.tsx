import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays } from "date-fns";
import { AssigneeField } from "@/components/RecurringTasks/FormFields/AssigneeField";
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
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [editedBill, setEditedBill] = useState(bill);

  const handleSave = () => {
    onUpdate(editedBill);
    setIsEditing(false);
  };

  const amountPerPerson = editedBill.selectedProfiles.length > 0 
    ? editedBill.amount / editedBill.selectedProfiles.length 
    : editedBill.amount;

  const getDueDateColor = (dueDate: Date) => {
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);

    if (daysUntilDue < 0) {
      return "bg-red-100 border-red-200"; // Vencida
    } else if (daysUntilDue <= 5) {
      return "bg-orange-100 border-orange-200"; // Próxima a vencer
    } else {
      return "bg-green-100 border-green-200"; // Con tiempo
    }
  };

  return (
    <Card className={cn("p-4", getDueDateColor(bill.paymentDueDate))}>
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editedBill.title}
            onChange={(e) => setEditedBill({ ...editedBill, title: e.target.value })}
            placeholder="Título de la factura"
          />
          <Input
            type="number"
            value={editedBill.amount}
            onChange={(e) => setEditedBill({ ...editedBill, amount: parseFloat(e.target.value) })}
            placeholder="Monto"
          />
          <Input
            type="date"
            value={editedBill.paymentDueDate.toISOString().split('T')[0]}
            onChange={(e) => setEditedBill({ ...editedBill, paymentDueDate: new Date(e.target.value) })}
            placeholder="Fecha límite de pago"
          />
          <AssigneeField
            selectedAssignees={editedBill.selectedProfiles}
            onChange={(profiles) => setEditedBill({ ...editedBill, selectedProfiles: profiles })}
          />
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSave} size="sm">
              <Check className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{bill.title}</h3>
            <p className="text-sm text-muted-foreground">
              Total: ${bill.amount.toFixed(2)} - ${amountPerPerson.toFixed(2)} por persona
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha límite: {format(new Date(bill.paymentDueDate), 'dd/MM/yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              Dividido entre: {bill.selectedProfiles.length} persona(s)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => onToggleStatus(bill.id)}
              className={bill.status === "paid" ? "text-green-500" : "text-amber-500"}
            >
              {bill.status === "paid" ? "Pagada" : "Pendiente"}
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