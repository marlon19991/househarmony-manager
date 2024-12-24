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

interface BillsHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddBill: (bill: any) => void;
}

export const BillsHeader = ({ isOpen, setIsOpen, onAddBill }: BillsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Bills</h2>
        <p className="text-muted-foreground">Manage and organize your bills</p>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Bill
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Bill</SheetTitle>
            <SheetDescription>
              Add a new bill to split between members.
            </SheetDescription>
          </SheetHeader>
          <BillForm onSubmit={onAddBill} />
        </SheetContent>
      </Sheet>
    </div>
  );
};