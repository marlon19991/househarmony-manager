import { BillItem } from "./BillItem";
import type { Bill } from "./utils/billsLogic";

interface BillsListProps {
  bills: Bill[];
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillsList = ({ 
  bills, 
  onUpdate, 
  onDelete, 
  onToggleStatus
}: BillsListProps) => {
  // Filtrar para mostrar solo las facturas pendientes
  const pendingBills = bills.filter(bill => bill.status === 'pending');

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
};