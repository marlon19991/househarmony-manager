import { differenceInDays, startOfDay } from "date-fns";
import { getBillColorScheme } from "./utils/billsLogic";

interface BillStatusProps {
  dueDate: string;
  status: string;
}

export const BillStatus = ({ dueDate, status }: BillStatusProps) => {
  try {
    const dueDateObj = startOfDay(new Date(dueDate));
    if (isNaN(dueDateObj.getTime())) {
      console.error('Fecha inválida:', dueDate);
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
    console.error('Error al procesar el estado de la factura:', error);
    return (
      <span className="text-red-600 font-semibold text-lg">
        Error
      </span>
    );
  }
};