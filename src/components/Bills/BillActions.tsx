import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BillActionsProps {
  status: "pending" | "paid";
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title: string;
}

export const BillActions = ({
  status,
  onToggleStatus,
  onEdit,
  onDelete,
  title,
}: BillActionsProps) => {
  const [showPayConfirmation, setShowPayConfirmation] = useState(false);

  const handleConfirmPay = () => {
    setShowPayConfirmation(false);
    onToggleStatus();
  };

  if (status === "paid") return null;

  return (
    <div className="flex items-center gap-2">
      <AlertDialog open={showPayConfirmation} onOpenChange={setShowPayConfirmation}>
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => setShowPayConfirmation(true)}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Pagar
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar como pagada?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas marcar la factura "{title}" como pagada?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPay}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={onDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
};