import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import { BillForm } from "./BillForm";
import { BillStatus } from "./BillStatus";
import { BillDates } from "./BillDates";
import { handleDueDateNotification, handleOverdueNotification } from "./utils/billNotifications";
import { getBillColorScheme } from "./utils/billsLogic";
import type { Bill } from "./utils/billsLogic";
import { cn } from "@/lib/utils";

interface BillItemProps {
  bill: Bill;
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillItem = ({ bill, onUpdate, onDelete, onToggleStatus }: BillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Verificar notificaciones cuando cambia la factura
  useEffect(() => {
    // Solo verificar notificaciones si la factura está pendiente
    if (bill.status === 'pending') {
      checkNotifications();
    }
  }, [bill]);

  const checkNotifications = async () => {
    try {
      const dueDate = new Date(bill.payment_due_date);
      if (isNaN(dueDate.getTime())) {
        console.error('Fecha de vencimiento inválida:', bill.payment_due_date);
        return;
      }

      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);

      // Si la fecha de vencimiento está dentro de los próximos 3 días
      if (dueDate <= threeDaysFromNow && dueDate > now) {
        await handleDueDateNotification(bill);
      }
      // Si la fecha de vencimiento ya pasó
      else if (dueDate < now) {
        await handleOverdueNotification(bill);
      }
    } catch (error) {
      console.error('Error al verificar notificaciones:', error);
    }
  };

  const handleUpdate = async (updatedData: any) => {
    const updatedBill: Bill = {
      ...bill,
      title: updatedData.title,
      amount: updatedData.amount,
      payment_due_date: updatedData.due_date,
      selected_profiles: updatedData.selectedProfiles
    };
    await onUpdate(updatedBill);
    setIsEditing(false);
    // Verificar notificaciones después de actualizar
    await checkNotifications();
  };

  const colorScheme = getBillColorScheme(bill.payment_due_date, bill.status);

  if (isEditing) {
    return (
      <Card className="p-4">
        <BillForm
          initialData={{
            title: bill.title,
            amount: bill.amount,
            payment_due_date: bill.payment_due_date,
            status: bill.status,
            selected_profiles: bill.selected_profiles
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow", 
      colorScheme.border
    )}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BillStatus dueDate={bill.payment_due_date} status={bill.status} />
              <h3 className="font-medium text-lg">{bill.title}</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              <BillDates dueDate={bill.payment_due_date} status={bill.status} />
              <span className="font-medium text-base">
                ${new Intl.NumberFormat('es-CO', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  useGrouping: true
                }).format(Math.round(bill.amount))}
              </span>
            </div>
            {bill.selected_profiles && bill.selected_profiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Asignado a: {bill.selected_profiles.join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {bill.status === 'pending' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary-foreground hover:bg-primary"
                  >
                    Pagar Factura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar pago de factura?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Al marcar esta factura como pagada, se creará automáticamente la factura del próximo mes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onToggleStatus(bill.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Confirmar Pago
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary-foreground hover:bg-primary"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
                >
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
                  <AlertDialogAction 
                    onClick={() => onDelete(bill.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
};