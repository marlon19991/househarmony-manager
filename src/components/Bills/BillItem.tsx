import { memo, useEffect, useState } from "react";
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
import type { Bill, BillFormInput } from "./utils/billsLogic";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface BillItemProps {
  bill: Bill;
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

const BillItemComponent = ({ bill, onUpdate, onDelete, onToggleStatus }: BillItemProps) => {
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
        logger.error('Fecha de vencimiento inválida', { dueDate: bill.payment_due_date, billId: bill.id });
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
      logger.error('Error al verificar notificaciones de factura', { error, billId: bill.id });
    }
  };

  const handleUpdate = async (updatedData: BillFormInput) => {
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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <BillStatus dueDate={bill.payment_due_date} status={bill.status} />
              <h3 className="font-medium text-lg line-clamp-1">{bill.title}</h3>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <BillDates dueDate={bill.payment_due_date} status={bill.status} />
              <span className="font-medium text-base text-primary">
                ${new Intl.NumberFormat('es-CO', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  useGrouping: true
                }).format(Math.round(bill.amount))}
              </span>
              {bill.selected_profiles && bill.selected_profiles.length > 0 && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  Asignado a: {bill.selected_profiles.join(", ")}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-row sm:flex-row items-center justify-end gap-2">
            {bill.status === 'pending' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-primary hover:text-primary-foreground hover:bg-primary"
                  >
                    Pagar Factura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar pago de factura?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Al confirmar, la fecha de vencimiento se moverá automáticamente al próximo mes en este mismo registro.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onToggleStatus(bill.id)}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Confirmar Pago
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
                aria-label="Editar factura"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    aria-label="Eliminar factura"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la factura permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(bill.id)}
                      className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const BillItem = memo(BillItemComponent);
BillItem.displayName = "BillItem";
