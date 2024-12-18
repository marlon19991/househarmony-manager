import { BillItem } from "./BillItem";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const getBillCategory = (bill: Bill) => {
    if (bill.status === "paid") return "paid";
    
    const today = new Date();
    const dueDate = new Date(bill.paymentDueDate);
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 5) return "upcoming";
    return "future";
  };

  const categorizedBills = bills.reduce((acc: Record<string, Bill[]>, bill) => {
    const category = getBillCategory(bill);
    if (!acc[category]) acc[category] = [];
    acc[category].push(bill);
    return acc;
  }, {});

  const renderBillsSection = (title: string, bills: Bill[], className: string) => {
    if (!bills?.length) return null;

    return (
      <div className="space-y-3">
        <h3 className={`font-medium ${className}`}>{title}</h3>
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

  return (
    <div className="space-y-6">
      {renderBillsSection("Facturas Pagadas", categorizedBills.paid, "text-green-500")}
      <Separator className="my-6" />
      <div className="space-y-6">
        {renderBillsSection("Facturas Vencidas", categorizedBills.overdue, "text-red-500")}
        {renderBillsSection("Próximas a Vencer", categorizedBills.upcoming, "text-orange-500")}
        {renderBillsSection("Facturas Futuras", categorizedBills.future, "text-green-500")}
      </div>
    </div>
  );
};