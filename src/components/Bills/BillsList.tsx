import { BillItem } from "./BillItem";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface BillsListProps {
  bills: Bill[];
  onUpdate: (bill: Bill) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const BillsList = ({ bills, onUpdate, onDelete, onToggleStatus }: BillsListProps) => {
  const currentMonth = new Date();
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);

  const categorizedBills = bills.reduce((acc: Record<string, Bill[]>, bill) => {
    const isPaid = bill.status === "paid";
    const billMonth = new Date(bill.paymentDueDate).getMonth();
    
    if (isPaid && billMonth === previousMonth.getMonth()) {
      if (!acc.previousPaid) acc.previousPaid = [];
      acc.previousPaid.push(bill);
    } else if (!isPaid && billMonth === currentMonth.getMonth()) {
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
  const currentMonthTitle = `Facturas ${format(currentMonth, 'MMMM yyyy', { locale: es })} - Por Pagar`;

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