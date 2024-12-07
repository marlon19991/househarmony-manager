import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Bill {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
  splitBetween: number;
  selectedProfiles: number[];
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

  return (
    <Card className="p-4">
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
            type="number"
            value={editedBill.splitBetween}
            onChange={(e) => setEditedBill({ ...editedBill, splitBetween: parseInt(e.target.value) })}
            placeholder="Dividir entre"
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
              ${bill.amount} - Dividido entre {bill.splitBetween}
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