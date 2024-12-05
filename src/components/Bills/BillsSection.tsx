import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";

export const BillsSection = () => {
  const { profiles } = useProfiles();
  const [bills, setBills] = useState([
    { id: 1, title: "Electricidad", amount: 120, dueDate: "25 Marzo", status: "pending" },
    { id: 2, title: "Internet", amount: 80, dueDate: "28 Marzo", status: "paid" },
    { id: 3, title: "Agua", amount: 60, dueDate: "1 Abril", status: "pending" },
  ]);
  const [newBill, setNewBill] = useState({ title: "", amount: "" });

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
      status: "pending"
    };

    setBills([...bills, bill]);
    setNewBill({ title: "", amount: "" });
    toast.success("Factura agregada exitosamente");
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
      <form onSubmit={handleAddBill} className="space-y-4">
        <div>
          <Label htmlFor="billTitle">Nueva Factura</Label>
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
        <Button type="submit" className="w-full">Agregar Factura</Button>
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
                <p className="text-xs text-gray-500">${(bill.amount / profiles.length).toFixed(2)} por persona</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};