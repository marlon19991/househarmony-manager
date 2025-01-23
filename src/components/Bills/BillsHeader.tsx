import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BillForm } from "./BillForm";
import type { Bill } from "./utils/billsLogic";

interface BillsHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
}

export const BillsHeader = ({ isOpen, setIsOpen, onAddBill }: BillsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Facturas</h2>
        <p className="text-muted-foreground">Administra y organiza tus facturas</p>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Factura
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva Factura</SheetTitle>
            <SheetDescription>
              Agrega una nueva factura para dividir entre los miembros.
            </SheetDescription>
          </SheetHeader>
          <BillForm onSubmit={onAddBill} />
        </SheetContent>
      </Sheet>
    </div>
  );
};