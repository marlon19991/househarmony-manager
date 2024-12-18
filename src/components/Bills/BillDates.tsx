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
            Factura {format(paymentDueDate, "MMMM yyyy", { locale: es })} pagada
          </p>
        </div>
      );
    } else {
      return (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Factura {format(paymentDueDate, "MMMM yyyy", { locale: es })} por pagar
          </p>
          <p className="text-sm text-muted-foreground">
            Fecha límite: {format(paymentDueDate, "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      );
    }
  };

  return getNextPaymentInfo();
};