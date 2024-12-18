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
  onUndoPay: (id: number) => void;
}

export const BillsList = ({ 
  bills, 
  onUpdate, 
  onDelete, 
  onToggleStatus,
  onUndoPay 
}: BillsListProps) => {
  const currentDate = new Date();
  const previousMonth = addMonths(currentDate, -1);

  const categorizedBills = bills.reduce((acc: Record<string, Bill[]>, bill) => {
    const isPaid = bill.status === "paid";
    const billDate = new Date(bill.paymentDueDate);
    
    // Para facturas pagadas (mostrar todas las pagadas)
    if (isPaid) {
      const monthKey = format(billDate, 'MMMM yyyy', { locale: es });
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(bill);
    } 
    // Para facturas pendientes (mostrar todas las pendientes)
    else {
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
              onUndoPay={onUndoPay}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderMonthlySection(
        "Facturas Pendientes",
        categorizedBills.currentPending,
        "text-blue-600"
      )}
      <Separator className="my-8" />
      {Object.entries(categorizedBills)
        .filter(([key]) => key !== 'currentPending')
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([month, bills]) => (
          <div key={month}>
            {renderMonthlySection(
              `Facturas ${month} - Pagadas`,
              bills,
              "text-green-600"
            )}
            <Separator className="my-8" />
          </div>
        ))}
    </div>
  );
};