import { BillItem } from "./BillItem";
import { Separator } from "@/components/ui/separator";
import { format, isSameMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { Bill } from "./utils/billsLogic";

interface BillsListProps {
  bills: Bill[];
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillsList = ({ bills, onUpdate, onDelete, onToggleStatus }: BillsListProps) => {
  const currentDate = new Date();
  const previousMonth = addMonths(currentDate, -1);

  const categorizedBills = bills.reduce((acc: Record<string, Bill[]>, bill) => {
    const isPaid = bill.status === "paid";
    const billDate = new Date(bill.paymentDueDate);
    
    // Para facturas pagadas del mes anterior
    if (isPaid && isSameMonth(billDate, previousMonth)) {
      if (!acc.previousPaid) acc.previousPaid = [];
      acc.previousPaid.push(bill);
    } 
    // Para facturas pendientes (mostrar todas las pendientes)
    else if (!isPaid) {
      if (!acc.currentPending) acc.currentPending = [];
      acc.currentPending.push(bill);
    }
    
    return acc;
  }, {});

  const renderMonthlySection = (title: string, bills: Bill[] | undefined, className: string) => {
    if (!bills?.length) return null;

    return (
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${className}`}>{title}</h3>
        <div className="space-y-3">
          {bills.map((bill) => (
            <BillItem
              key={bill.id}
              bill={bill}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </div>
    );
  };

  const previousMonthTitle = `Facturas ${format(previousMonth, 'MMMM yyyy', { locale: es })} - Pagadas`;
  const currentMonthTitle = `Facturas Pendientes`;

  return (
    <div className="space-y-8">
      {renderMonthlySection(
        previousMonthTitle,
        categorizedBills.previousPaid,
        "text-green-600"
      )}
      <Separator className="my-8" />
      {renderMonthlySection(
        currentMonthTitle,
        categorizedBills.currentPending,
        "text-blue-600"
      )}
    </div>
  );
};