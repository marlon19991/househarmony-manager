import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

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
  onUpdate: (updatedBill: Bill) => void;
  onDelete: (billId: number) => void;
  onToggleStatus: (billId: number) => void;
}

export const BillItem = ({ bill, onUpdate, onDelete, onToggleStatus }: BillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBill, setEditedBill] = useState(bill);
  const { profiles } = useProfiles();

  const handleSave = () => {
    if (!editedBill.title || !editedBill.amount) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    onUpdate(editedBill);
    setIsEditing(false);
    toast.success("Factura actualizada exitosamente");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="w-full space-y-2">
            <Input
              value={editedBill.title}
              onChange={(e) => setEditedBill({ ...editedBill, title: e.target.value })}
              placeholder="Título de la factura"
            />
            <Input
              type="number"
              value={editedBill.amount}
              onChange={(e) => setEditedBill({ ...editedBill, amount: parseFloat(e.target.value) })}
              placeholder="Monto de la factura"
            />
            <Input
              type="number"
              min="1"
              value={editedBill.splitBetween}
              onChange={(e) => setEditedBill({ ...editedBill, splitBetween: parseInt(e.target.value) })}
              placeholder="Dividir entre"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Guardar</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-medium">{bill.title}</h3>
              <p className="text-sm text-gray-500">Vence {bill.dueDate}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onToggleStatus(bill.id)}
                  className={bill.status === "paid" ? "text-green-500" : "text-amber-500"}
                >
                  <p className="font-medium">${bill.amount}</p>
                  <p className="text-xs">
                    {bill.status === "paid" ? "Pagado" : "Pendiente"}
                  </p>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDelete(bill.id);
                    toast.success("Factura eliminada exitosamente");
                  }}
                  className="text-red-500"
                >
                  Eliminar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                ${(bill.amount / bill.splitBetween).toFixed(2)} por persona ({bill.splitBetween} personas)
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};