import { differenceInDays, startOfDay } from "date-fns";
import { logger } from "@/utils/logger";

interface BillStatusProps {
  dueDate: string;
  status: string;
}

export const BillStatus = ({ dueDate, status }: BillStatusProps) => {
  try {
    const dueDateObj = startOfDay(new Date(dueDate));
    if (isNaN(dueDateObj.getTime())) {
      logger.error('Fecha inválida', { dueDate });
      return (
        <span className="text-red-600 font-semibold text-lg">
          Error en fecha
        </span>
      );
    }

    if (status === 'paid') {
      return (
        <span className="text-green-600 font-semibold text-lg">
          Pagada
        </span>
      );
    }

    const today = startOfDay(new Date());
    const daysUntilDue = differenceInDays(dueDateObj, today);

    if (today > dueDateObj) {
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
    logger.error('Error al procesar el estado de la factura', { error, dueDate, status });
    return (
      <span className="text-red-600 font-semibold text-lg">
        Error
      </span>
    );
  }
};
