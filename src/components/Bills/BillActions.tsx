import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Pencil, Trash2 } from "lucide-react";
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

interface BillActionsProps {
  status: "pending" | "paid";
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title: string;
}

export const BillActions = ({ status, onToggleStatus, onEdit, onDelete, title }: BillActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleStatus}
        className={status === "paid" ? "text-green-500" : "text-amber-500"}
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el gasto "{title}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};