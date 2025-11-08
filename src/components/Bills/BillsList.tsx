import { memo, useMemo } from "react";
import { BillItem } from "./BillItem";
import type { Bill } from "./utils/billsLogic";

interface BillsListProps {
  bills: Bill[];
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillsList = memo(({
  bills,
  onUpdate,
  onDelete,
  onToggleStatus
}: BillsListProps) => {
  const pendingBills = useMemo(
    () => bills.filter((bill) => bill.status === "pending"),
    [bills]
  );

  if (!pendingBills.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay facturas pendientes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingBills.map((bill) => (
        <BillItem
          key={bill.id}
          bill={bill}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
});

BillsList.displayName = "BillsList";
