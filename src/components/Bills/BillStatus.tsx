import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface BillStatusProps {
  dueDate: string;
  status: string;
}

export const BillStatus = ({ dueDate, status }: BillStatusProps) => {
  try {
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      console.error('Fecha inválida:', dueDate);
      return (
        <span className="text-red-600 font-semibold text-lg">
          Error en fecha
        </span>
      );
    }

    const today = new Date();
    const daysUntilDue = differenceInDays(dueDateObj, today);

    if (status === 'paid') {
      return (
        <span className="text-green-600 font-semibold text-lg">
          Pagada
        </span>
      );
    }

    if (daysUntilDue < 0) {
      return (
        <span className="text-red-600 font-semibold text-lg">
          Vencida
        </span>
      );
    }

    if (daysUntilDue <= 3) {
      return (
        <span className="text-yellow-600 font-semibold text-lg">
          Próxima a vencer
        </span>
      );
    }

    return (
      <span className="text-emerald-600 font-semibold text-lg">
        A tiempo
      </span>
    );
  } catch (error) {
    console.error('Error al procesar el estado de la factura:', error);
    return (
      <span className="text-red-600 font-semibold text-lg">
        Error
      </span>
    );
  }
};