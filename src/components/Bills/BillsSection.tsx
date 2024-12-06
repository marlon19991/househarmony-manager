import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

export const BillsSection = () => {
  const { profiles } = useProfiles();
  const [bills, setBills] = useState([
    { 
      id: 1, 
      title: "Electricidad", 
      amount: 120, 
      dueDate: "25 Marzo", 
      status: "pending",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
    { 
      id: 2, 
      title: "Internet", 
      amount: 80, 
      dueDate: "28 Marzo", 
      status: "paid",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
    { 
      id: 3, 
      title: "Agua", 
      amount: 60, 
      dueDate: "1 Abril", 
      status: "pending",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
  ]);
  const [newBill, setNewBill] = useState({ title: "", amount: "", splitBetween: "1" });
  const [editingBill, setEditingBill] = useState<number | null>(null);

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) {
      toast.error("Por favor completa todos los campos de la factura");
      return;
    }

    const bill = {
      id: bills.length + 1,
      title: newBill.title,
      amount: parseFloat(newBill.amount),
      dueDate: "Próximo mes",
      status: "pending",
      splitBetween: parseInt(newBill.splitBetween),
      selectedProfiles: profiles.map(p => p.id)
    };

    setBills([...bills, bill]);
    setNewBill({ title: "", amount: "", splitBetween: "1" });
    toast.success("Factura agregada exitosamente");
  };

  const handleEditBill = (billId: number) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setEditingBill(billId);
      setNewBill({ 
        title: bill.title, 
        amount: bill.amount.toString(),
        splitBetween: bill.splitBetween.toString()
      });
    }
  };

  const handleUpdateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    setBills(bills.map(bill => {
      if (bill.id === editingBill) {
        return {
          ...bill,
          title: newBill.title,
          amount: parseFloat(newBill.amount),
          splitBetween: parseInt(newBill.splitBetween)
        };
      }
      return bill;
    }));

    setEditingBill(null);
    setNewBill({ title: "", amount: "", splitBetween: "1" });
    toast.success("Factura actualizada exitosamente");
  };

  const toggleBillStatus = (billId: number) => {
    setBills(bills.map(bill => {
      if (bill.id === billId) {
        const newStatus = bill.status === "paid" ? "pending" : "paid";
        toast.success(`Factura marcada como ${newStatus === "paid" ? "pagada" : "pendiente"}`);
        return { ...bill, status: newStatus };
      }
      return bill;
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Facturas</h2>
      <form onSubmit={editingBill ? handleUpdateBill : handleAddBill} className="space-y-4">
        <div>
          <Label htmlFor="billTitle">
            {editingBill ? "Editar Factura" : "Nueva Factura"}
          </Label>
          <Input
            id="billTitle"
            value={newBill.title}
            onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
            placeholder="Título de la factura"
          />
        </div>
        <div>
          <Label htmlFor="billAmount">Monto</Label>
          <Input
            id="billAmount"
            type="number"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            placeholder="Monto de la factura"
          />
        </div>
        <div>
          <Label htmlFor="splitBetween">Dividir entre</Label>
          <Input
            id="splitBetween"
            type="number"
            min="1"
            value={newBill.splitBetween}
            onChange={(e) => setNewBill({ ...newBill, splitBetween: e.target.value })}
            placeholder="Número de personas"
          />
        </div>
        <Button type="submit" className="w-full">
          {editingBill ? "Actualizar Factura" : "Agregar Factura"}
        </Button>
        {editingBill && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setEditingBill(null);
              setNewBill({ title: "", amount: "", splitBetween: "1" });
            }}
          >
            Cancelar Edición
          </Button>
        )}
      </form>
      <div className="space-y-3">
        {bills.map((bill) => (
          <Card key={bill.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{bill.title}</h3>
                <p className="text-sm text-gray-500">Vence {bill.dueDate}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => toggleBillStatus(bill.id)}
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
                    onClick={() => handleEditBill(bill.id)}
                  >
                    Editar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  ${(bill.amount / bill.splitBetween).toFixed(2)} por persona ({bill.splitBetween} personas)
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};