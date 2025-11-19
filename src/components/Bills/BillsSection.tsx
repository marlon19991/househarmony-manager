import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BillsHeader } from "./BillsHeader";
import { BillsList } from "./BillsList";
import { useBills } from "./hooks/useBills";
import type { Bill, BillFormInput } from "./utils/billsLogic";
import { toast } from "sonner";

export const BillsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    billsQuery,
    createBillMutation,
    updateBillMutation,
    deleteBillMutation,
    toggleBillStatusMutation,
    refetchBills,
  } = useBills();

  const bills = billsQuery.data ?? [];

  const handleAddBill = (newBill: BillFormInput) => {
    createBillMutation.mutate(newBill, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    updateBillMutation.mutate(updatedBill);
  };

  const handleDeleteBill = (billId: number) => {
    deleteBillMutation.mutate(billId);
  };

  const handleToggleBillStatus = (billId: number) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    toggleBillStatusMutation.mutate(bill, {
      onSuccess: (updatedBill) => {
        const formattedDate = new Date(updatedBill.payment_due_date).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        toast.success(`Factura actualizada. Nuevo vencimiento: ${formattedDate}`);
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BillsHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onAddBill={handleAddBill}
      />
      {billsQuery.isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      )}

      {billsQuery.isError && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm backdrop-blur-sm">
          <p className="font-medium text-destructive">
            No pudimos cargar las facturas.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchBills()}
            disabled={billsQuery.isFetching}
            className="border-destructive/30 hover:bg-destructive/20"
          >
            Reintentar
          </Button>
        </div>
      )}

      {!billsQuery.isLoading && !billsQuery.isError && (
        <BillsList
          bills={bills}
          onUpdate={handleUpdateBill}
          onDelete={handleDeleteBill}
          onToggleStatus={handleToggleBillStatus}
        />
      )}
    </div>
  );
};
