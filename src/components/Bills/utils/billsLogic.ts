import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { toast } from "sonner";

export interface Bill {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  paymentDueDate: Date;
  status: "pending" | "paid";
  splitBetween: number;
  selectedProfiles: string[];
}

export const fetchBills = async () => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('payment_due_date', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(bill => ({
      id: bill.id,
      title: bill.title,
      amount: bill.amount,
      dueDate: new Date(bill.payment_due_date).toLocaleDateString(),
      paymentDueDate: new Date(bill.payment_due_date),
      status: bill.status as "pending" | "paid",
      splitBetween: bill.split_between,
      selectedProfiles: bill.selected_profiles || []
    }));
  } catch (error) {
    console.error('Error fetching bills:', error);
    toast.error('Error al cargar las facturas');
    return [];
  }
};

export const createBill = async (newBill: Omit<Bill, 'id' | 'dueDate' | 'paymentDueDate' | 'status'>) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        title: newBill.title,
        amount: newBill.amount,
        payment_due_date: new Date(newBill.paymentDueDate).toISOString(),
        status: 'pending',
        split_between: newBill.selectedProfiles.length || 1,
        selected_profiles: newBill.selectedProfiles
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return {
      id: data.id,
      title: data.title,
      amount: data.amount,
      dueDate: new Date(data.payment_due_date).toLocaleDateString(),
      paymentDueDate: new Date(data.payment_due_date),
      status: data.status as "pending" | "paid",
      splitBetween: data.split_between,
      selectedProfiles: data.selected_profiles || []
    };
  } catch (error) {
    console.error('Error adding bill:', error);
    toast.error('Error al agregar la factura');
    throw error;
  }
};

export const updateBill = async (updatedBill: Bill) => {
  try {
    const { error } = await supabase
      .from('bills')
      .update({
        title: updatedBill.title,
        amount: updatedBill.amount,
        payment_due_date: updatedBill.paymentDueDate.toISOString(),
        split_between: updatedBill.splitBetween,
        selected_profiles: updatedBill.selectedProfiles
      } as any)
      .eq('id', updatedBill.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating bill:', error);
    toast.error('Error al actualizar la factura');
    throw error;
  }
};

export const deleteBill = async (billId: number) => {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting bill:', error);
    toast.error('Error al eliminar la factura');
    throw error;
  }
};

export const createNextMonthBill = async (currentBill: Bill) => {
  const nextMonthDate = addMonths(currentBill.paymentDueDate, 1);
  
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        title: currentBill.title,
        amount: currentBill.amount,
        payment_due_date: nextMonthDate.toISOString(),
        status: 'pending',
        split_between: currentBill.splitBetween,
        selected_profiles: currentBill.selectedProfiles
      } as any)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return {
      id: data.id,
      title: data.title,
      amount: data.amount,
      dueDate: new Date(data.payment_due_date).toLocaleDateString(),
      paymentDueDate: new Date(data.payment_due_date),
      status: data.status as "pending" | "paid",
      splitBetween: data.split_between,
      selectedProfiles: data.selected_profiles || []
    };
  } catch (error) {
    console.error('Error creating next month bill:', error);
    toast.error('Error al crear la factura para el próximo mes');
    throw error;
  }
};

export const toggleBillStatus = async (bill: Bill) => {
  const newStatus = bill.status === "paid" ? "pending" : "paid";
  
  try {
    const { error } = await supabase
      .from('bills')
      .update({ status: newStatus } as any)
      .eq('id', bill.id);

    if (error) throw error;

    let nextMonthBill = null;
    if (newStatus === "paid") {
      nextMonthBill = await createNextMonthBill(bill);
    }

    return { newStatus, nextMonthBill };
  } catch (error) {
    console.error('Error updating bill status:', error);
    toast.error('Error al actualizar el estado de la factura');
    throw error;
  }
};