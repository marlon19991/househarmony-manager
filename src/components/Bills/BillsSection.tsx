import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BillsHeader } from "./BillsHeader";
import { BillsList } from "./BillsList";

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
  const [bills, setBills] = useState<Bill[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('payment_due_date', { ascending: true });

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

  const handleAddBill = async (newBill: any) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert({
          title: newBill.title,
          amount: parseFloat(newBill.amount),
          payment_due_date: new Date(newBill.paymentDueDate).toISOString(),
          status: 'pending',
          split_between: newBill.selectedProfiles.length || 1,
          selected_profiles: newBill.selectedProfiles
        })
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
          payment_due_date: updatedBill.paymentDueDate.toISOString(),
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
      <BillsHeader 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onAddBill={handleAddBill}
      />
      <BillsList
        bills={bills}
        onUpdate={handleUpdateBill}
        onDelete={handleDeleteBill}
        onToggleStatus={toggleBillStatus}
      />
    </div>
  );
};