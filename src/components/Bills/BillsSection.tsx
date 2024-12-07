import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { BillItem } from "./BillItem";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Bill {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  paymentDueDate: Date;
  status: "pending" | "paid";
  splitBetween: number;
  selectedProfiles: number[];
}

export const BillsSection = () => {
  const { profiles } = useProfiles();
  const [bills, setBills] = useState<Bill[]>([
    { 
      id: 1, 
      title: "Electricidad", 
      amount: 120, 
      dueDate: "25 Marzo",
      paymentDueDate: new Date('2024-03-25'),
      status: "pending",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
    { 
      id: 2, 
      title: "Internet", 
      amount: 80, 
      dueDate: "28 Marzo",
      paymentDueDate: new Date('2024-03-28'),
      status: "paid",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
    { 
      id: 3, 
      title: "Agua", 
      amount: 60, 
      dueDate: "1 Abril",
      paymentDueDate: new Date('2024-04-01'),
      status: "pending",
      splitBetween: profiles.length || 1,
      selectedProfiles: profiles.map(p => p.id)
    },
  ]);
  const [newBill, setNewBill] = useState({ 
    title: "", 
    amount: "", 
    splitBetween: "1",
    paymentDueDate: new Date().toISOString().split('T')[0]
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) {
      toast.error("Por favor completa todos los campos de la factura");
      return;
    }

    const bill = {
      id: Date.now(),
      title: newBill.title,
      amount: parseFloat(newBill.amount),
      dueDate: "Próximo mes",
      paymentDueDate: new Date(newBill.paymentDueDate),
      status: "pending" as const,
      splitBetween: parseInt(newBill.splitBetween),
      selectedProfiles: profiles.map(p => p.id)
    };

    setBills([...bills, bill]);
    setNewBill({ title: "", amount: "", splitBetween: "1", paymentDueDate: new Date().toISOString().split('T')[0] });
    setIsOpen(false);
    toast.success("Factura agregada exitosamente");
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills(bills.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    ));
    toast.success("Factura actualizada exitosamente");
  };

  const handleDeleteBill = (billId: number) => {
    setBills(bills.filter(bill => bill.id !== billId));
    toast.success("Factura eliminada exitosamente");
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Facturas</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Factura
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nueva Factura</SheetTitle>
              <SheetDescription>
                Agrega una nueva factura para dividir entre los miembros.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAddBill} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="billTitle">Título</Label>
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
                <Label htmlFor="paymentDueDate">Fecha límite de pago</Label>
                <Input
                  id="paymentDueDate"
                  type="date"
                  value={newBill.paymentDueDate}
                  onChange={(e) => setNewBill({ ...newBill, paymentDueDate: e.target.value })}
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
                Agregar Factura
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {bills.map((bill) => (
          <BillItem
            key={bill.id}
            bill={bill}
            onUpdate={handleUpdateBill}
            onDelete={handleDeleteBill}
            onToggleStatus={toggleBillStatus}
          />
        ))}
      </div>
    </div>
  );
};