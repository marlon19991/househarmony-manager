import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BillDatesProps {
  paymentDueDate: Date;
  status: "pending" | "paid";
}

export const BillDates = ({ paymentDueDate, status }: BillDatesProps) => {
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM, yyyy", { locale: es });
  };

  if (status === "paid") {
    return (
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Pagada el {formatDate(paymentDueDate)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        Fecha límite: {formatDate(paymentDueDate)}
      </p>
    </div>
  );
};