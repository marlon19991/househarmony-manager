import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface BillStatusProps {
  status: "pending" | "paid";
  paymentDueDate: Date;
}

export const BillStatus = ({ status, paymentDueDate }: BillStatusProps) => {
  const getStatusInfo = () => {
    if (status === "paid") {
      return {
        text: "Paid",
        className: "bg-green-500"
      };
    }

    const today = new Date();
    const daysUntilDue = differenceInDays(paymentDueDate, today);

    if (daysUntilDue < 0) {
      return {
        text: "Overdue",
        className: "bg-red-500"
      };
    }

    if (daysUntilDue <= 5) {
      return {
        text: "Due soon",
        className: "bg-yellow-500"
      };
    }

    return {
      text: "On time",
      className: "bg-green-500"
    };
  };

  const { text, className } = getStatusInfo();

  return (
    <Badge variant="secondary" className={cn("text-white", className)}>
      {text}
    </Badge>
  );
};