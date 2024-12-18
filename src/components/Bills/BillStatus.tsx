import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BillStatusProps {
  status: "pending" | "paid";
  paymentDueDate: Date;
  lastPaidDate?: Date;
}

export const BillStatus = ({ status, paymentDueDate, lastPaidDate }: BillStatusProps) => {
  const getBillStatus = () => {
    if (status === "paid") return "paid";
    
    const today = new Date();
    const daysUntilDue = differenceInDays(paymentDueDate, today);
    
    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 5) return "pending";
    return "upcoming";
  };

  const getStatusColor = () => {
    const status = getBillStatus();
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "overdue":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = () => {
    const billStatus = getBillStatus();
    const today = new Date();
    
    if (billStatus === "paid") {
      if (lastPaidDate) {
        return `Pagada - Última factura: ${format(lastPaidDate, "MMMM yyyy", { locale: es })}`;
      }
      return "Pagada";
    }
    
    if (billStatus === "overdue") {
      const daysOverdue = Math.abs(differenceInDays(paymentDueDate, today));
      const monthName = format(paymentDueDate, "MMMM yyyy", { locale: es });
      return `Factura de ${monthName} vencida (${daysOverdue} días)`;
    }
    
    if (billStatus === "pending") {
      const daysUntil = differenceInDays(paymentDueDate, today);
      return `Próxima a vencer (en ${daysUntil} días)`;
    }
    
    return "Próxima";
  };

  return (
    <Badge variant="secondary" className={cn("text-white", getStatusColor())}>
      {getStatusText()}
    </Badge>
  );
};