import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfDay, differenceInDays } from "date-fns";
import { toast } from "sonner";

export interface Bill {
  id: number;
  title: string;
  amount: number;
  payment_due_date: string;
  status: string;
  selected_profiles: string[];
  split_between?: number;
}

export type BillColorScheme = {
  text: string;
  border: string;
  hover: string;
  background: string;
};

export const getBillColorScheme = (dueDate: string, status: string): BillColorScheme => {
  try {
    const dueDateObj = startOfDay(new Date(dueDate));
    const now = startOfDay(new Date());
    const threeDaysFromNow = startOfDay(new Date(now));
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Si la factura está pagada, siempre mostrar verde
    if (status === 'paid') {
      return {
        text: 'text-green-600',
        border: 'border-l-green-500',
        hover: 'hover:text-green-700 hover:bg-green-50',
        background: 'bg-green-50'
      };
    }

    // Si la factura está pendiente, el color depende de la fecha
    if (status === 'pending') {
      // Si la fecha ya pasó (vencida)
      if (now > dueDateObj) {
        return {
          text: 'text-red-600',
          border: 'border-l-red-500',
          hover: 'hover:text-red-700 hover:bg-red-50',
          background: 'bg-red-50'
        };
      }

      // Si está próxima a vencer (3 días o menos)
      const daysUntilDue = differenceInDays(dueDateObj, now);
      if (daysUntilDue <= 3) {
        return {
          text: 'text-yellow-600',
          border: 'border-l-yellow-500',
          hover: 'hover:text-yellow-700 hover:bg-yellow-50',
          background: 'bg-yellow-50'
        };
      }

      // Si está a tiempo (más de 3 días)
      return {
        text: 'text-emerald-600',
        border: 'border-l-emerald-500',
        hover: 'hover:text-emerald-700 hover:bg-emerald-50',
        background: 'bg-emerald-50'
      };
    }

    // Por defecto (en caso de estado desconocido)
    return {
      text: 'text-gray-600',
      border: 'border-l-gray-500',
      hover: 'hover:text-gray-700 hover:bg-gray-50',
      background: 'bg-gray-50'
    };

  } catch (error) {
    console.error('Error al obtener el esquema de colores:', error);
    // Esquema de colores por defecto en caso de error
    return {
      text: 'text-gray-600',
      border: 'border-l-gray-500',
      hover: 'hover:text-gray-700 hover:bg-gray-50',
      background: 'bg-gray-50'
    };
  }
};

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
      payment_due_date: bill.payment_due_date,
      status: bill.status,
      selected_profiles: bill.selected_profiles || [],
      split_between: bill.split_between
    }));
  } catch (error) {
    console.error('Error fetching bills:', error);
    toast.error('Error al cargar las facturas');
    return [];
  }
};

export const createBill = async (newBill: any) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        title: newBill.title,
        amount: newBill.amount,
        payment_due_date: newBill.due_date,
        status: 'pending',
        selected_profiles: newBill.selectedProfiles,
        split_between: newBill.selectedProfiles.length
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return {
      id: data.id,
      title: data.title,
      amount: data.amount,
      payment_due_date: data.payment_due_date,
      status: data.status,
      selected_profiles: data.selected_profiles || [],
      split_between: data.split_between
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
        payment_due_date: updatedBill.payment_due_date,
        status: updatedBill.status,
        selected_profiles: updatedBill.selected_profiles,
        split_between: updatedBill.selected_profiles.length
      })
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
    // First, delete all associated notifications
    const { error: notificationsError } = await supabase
      .from('bill_notifications')
      .delete()
      .eq('bill_id', billId);

    if (notificationsError) throw notificationsError;

    // Then, delete the bill itself
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
  const nextMonthDate = addMonths(new Date(currentBill.payment_due_date), 1);
  
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        title: currentBill.title,
        amount: currentBill.amount,
        payment_due_date: nextMonthDate.toISOString(),
        status: 'pending',
        selected_profiles: currentBill.selected_profiles,
        split_between: currentBill.split_between
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return {
      id: data.id,
      title: data.title,
      amount: data.amount,
      payment_due_date: data.payment_due_date,
      status: data.status,
      selected_profiles: data.selected_profiles || [],
      split_between: data.split_between
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