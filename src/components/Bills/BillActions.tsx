import { Button } from "@/components/ui/button";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BillActionsProps {
  status: "pending" | "paid";
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUndoPay: (targetMonth: string) => void;
  availableMonths: string[];
  title: string;
}

export const BillActions = ({ 
  status, 
  onToggleStatus, 
  onEdit, 
  onDelete,
  onUndoPay,
  availableMonths,
  title
}: BillActionsProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const getStatusDialogContent = () => {
    if (status === "paid") {
      return {
        title: "¿Deseas marcar esta factura como pendiente?",
        description: "Esto revertirá el estado de la factura a pendiente.",
        actionText: "Marcar como pendiente",
        variant: "outline" as const
      };
    }
    return {
      title: "¿Deseas marcar esta factura como pagada?",
      description: "Esto creará automáticamente una nueva factura para el próximo mes.",
      actionText: "Marcar como pagada",
      variant: "default" as const
    };
  };

  const handleUndoPay = () => {
    if (selectedMonth) {
      onUndoPay(selectedMonth);
    }
  };

  const dialogContent = getStatusDialogContent();

  return (
    <div className="flex flex-col gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={dialogContent.variant}
            size="sm"
          >
            {dialogContent.actionText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onToggleStatus}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {status === "paid" && availableMonths.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Deshacer pago
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deshacer pago de {title}</AlertDialogTitle>
              <AlertDialogDescription>
                Selecciona el mes al cual deseas devolver el pago:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedMonth("")}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUndoPay}
                disabled={!selectedMonth}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la factura permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};