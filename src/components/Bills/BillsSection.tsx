import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BillsHeader } from "./BillsHeader";
import { BillsList } from "./BillsList";
import { 
  fetchBills, 
  createBill, 
  updateBill, 
  deleteBill, 
  toggleBillStatus,
  type Bill 
} from "./utils/billsLogic";

export const BillsSection = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const fetchedBills = await fetchBills();
    setBills(fetchedBills);
  };

  const handleAddBill = async (newBill: any) => {
    try {
      const createdBill = await createBill(newBill);
      setBills(prevBills => [createdBill, ...prevBills]);
      setIsOpen(false);
      toast.success("Factura agregada exitosamente");
    } catch (error) {
      // Error already handled in createBill
    }
  };

  const handleUpdateBill = async (updatedBill: Bill) => {
    try {
      await updateBill(updatedBill);
      setBills(prevBills => 
        prevBills.map(bill => bill.id === updatedBill.id ? updatedBill : bill)
      );
      toast.success("Factura actualizada exitosamente");
    } catch (error) {
      // Error already handled in updateBill
    }
  };

  const handleDeleteBill = async (billId: number) => {
    try {
      await deleteBill(billId);
      setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
      toast.success("Factura eliminada exitosamente");
    } catch (error) {
      // Error already handled in deleteBill
    }
  };

  const handleToggleBillStatus = async (billId: number) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    try {
      const { newStatus, nextMonthBill } = await toggleBillStatus(bill);
      
      setBills(prevBills => {
        const updatedBills = prevBills.map(b => {
          if (b.id === billId) {
            return { ...b, status: newStatus };
          }
          return b;
        });

        if (nextMonthBill) {
          return [...updatedBills, nextMonthBill];
        }

        return updatedBills;
      });
      
      toast.success(`Factura marcada como ${newStatus === "paid" ? "pagada" : "pendiente"}`);
    } catch (error) {
      // Error already handled in toggleBillStatus
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
        onToggleStatus={handleToggleBillStatus}
      />
    </div>
  );
};