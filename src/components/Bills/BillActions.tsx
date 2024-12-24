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
} from "@/components/ui/alert-dialog";

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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (status === "paid") return null;

  return (
    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 mt-4 sm:mt-0">
      <AlertDialog open={showPayConfirmation} onOpenChange={setShowPayConfirmation}>
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto"
          onClick={() => setShowPayConfirmation(true)}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Pay
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the bill "{title}" as paid?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPayConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onToggleStatus();
                setShowPayConfirmation(false);
              }}
            >
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="w-full sm:w-auto"
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the bill "{title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteConfirmation(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};