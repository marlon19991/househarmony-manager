import { format, addMonths, isBefore } from "date-fns";
import { es } from "date-fns/locale";

interface BillDatesProps {
  paymentDueDate: Date;
  status: "pending" | "paid";
}

export const BillDates = ({ paymentDueDate, status }: BillDatesProps) => {
  const getNextPaymentInfo = () => {
    const today = new Date();
    let nextPaymentDate;

    if (status === "paid") {
      nextPaymentDate = addMonths(paymentDueDate, 1);
      return (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Próximo pago: {format(nextPaymentDate, "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
          <p className="text-sm text-muted-foreground">
            Última factura pagada: {format(paymentDueDate, "MMMM yyyy", { locale: es })}
          </p>
        </div>
      );
    } else if (isBefore(paymentDueDate, today)) {
      return (
        <p className="text-sm text-muted-foreground">
          Fecha de vencimiento: {format(paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es })}
        </p>
      );
    } else {
      return (
        <p className="text-sm text-muted-foreground">
          Fecha límite de pago: {format(paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es })}
        </p>
      );
    }
  };

  return getNextPaymentInfo();
};