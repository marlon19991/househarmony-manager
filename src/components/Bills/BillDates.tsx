import { format } from "date-fns";
import { es } from "date-fns/locale";
import { logger } from "@/utils/logger";

interface BillDatesProps {
  dueDate: string;
  status: string;
}

export const BillDates = ({ dueDate, status }: BillDatesProps) => {
  try {
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      logger.error('Fecha inválida', { dueDate });
      return <span>Fecha no válida</span>;
    }

    const formattedDueDate = format(dueDateObj, "PPP", { locale: es });

    if (status === 'paid') {
      return <span>Pagada el {formattedDueDate}</span>;
    }

    return <span>Vence el {formattedDueDate}</span>;
  } catch (error) {
    logger.error('Error al formatear las fechas', { error, dueDate });
    return <span>Error al procesar las fechas</span>;
  }
};
