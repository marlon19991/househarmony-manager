import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { BillItem } from "./BillItem";
import { supabase } from "@/integrations/supabase/client";
import { AssigneeField } from "@/components/RecurringTasks/FormFields/AssigneeField";
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
  selectedProfiles: string[];
}

export const BillsSection = () => {
  const { profiles } = useProfiles();
  const [bills, setBills] = useState<Bill[]>([]);
  const [newBill, setNewBill] = useState({ 
    title: "", 
    amount: "", 
    splitBetween: "1",
    paymentDueDate: new Date().toISOString().split('T')[0],
    selectedProfiles: [] as string[]
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBills = data.map(bill => ({
        id: bill.id,
        title: bill.title,
        amount: bill.amount,
        dueDate: new Date(bill.payment_due_date).toLocaleDateString(),
        paymentDueDate: new Date(bill.payment_due_date),
        status: bill.status as "pending" | "paid",
        splitBetween: bill.split_between,
        selectedProfiles: bill.selected_profiles || []
      }));

      setBills(formattedBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Error al cargar las facturas');
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) {
      toast.error("Por favor completa todos los campos de la factura");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([{
          title: newBill.title,
          amount: parseFloat(newBill.amount),
          payment_due_date: new Date(newBill.paymentDueDate),
          status: 'pending',
          split_between: parseInt(newBill.splitBetween),
          selected_profiles: newBill.selectedProfiles
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedBill = {
        id: data.id,
        title: data.title,
        amount: data.amount,
        dueDate: new Date(data.payment_due_date).toLocaleDateString(),
        paymentDueDate: new Date(data.payment_due_date),
        status: data.status as "pending" | "paid",
        splitBetween: data.split_between,
        selectedProfiles: data.selected_profiles || []
      };

      setBills([formattedBill, ...bills]);
      setNewBill({ 
        title: "", 
        amount: "", 
        splitBetween: "1", 
        paymentDueDate: new Date().toISOString().split('T')[0],
        selectedProfiles: []
      });
      setIsOpen(false);
      toast.success("Factura agregada exitosamente");
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Error al agregar la factura');
    }
  };

  const handleUpdateBill = async (updatedBill: Bill) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          title: updatedBill.title,
          amount: updatedBill.amount,
          payment_due_date: updatedBill.paymentDueDate,
          split_between: updatedBill.splitBetween,
          selected_profiles: updatedBill.selectedProfiles
        })
        .eq('id', updatedBill.id);

      if (error) throw error;

      setBills(bills.map(bill => 
        bill.id === updatedBill.id ? updatedBill : bill
      ));
      toast.success("Factura actualizada exitosamente");
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Error al actualizar la factura');
    }
  };

  const handleDeleteBill = async (billId: number) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);

      if (error) throw error;

      setBills(bills.filter(bill => bill.id !== billId));
      toast.success("Factura eliminada exitosamente");
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Error al eliminar la factura');
    }
  };

  const toggleBillStatus = async (billId: number) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const newStatus = bill.status === "paid" ? "pending" : "paid";

    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: newStatus })
        .eq('id', billId);

      if (error) throw error;

      setBills(bills.map(b => {
        if (b.id === billId) {
          return { ...b, status: newStatus };
        }
        return b;
      }));
      
      toast.success(`Factura marcada como ${newStatus === "paid" ? "pagada" : "pendiente"}`);
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Error al actualizar el estado de la factura');
    }
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
              <AssigneeField
                selectedAssignees={newBill.selectedProfiles}
                onChange={(profiles) => setNewBill({ ...newBill, selectedProfiles: profiles })}
              />
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