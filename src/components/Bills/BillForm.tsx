import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AssigneeField } from "@/components/RecurringTasks/FormFields/AssigneeField";
import { toast } from "sonner";

interface BillFormProps {
  onSubmit: (bill: any) => void;
  initialData?: any;
}

export const BillForm = ({ onSubmit, initialData }: BillFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    amount: initialData?.amount || "",
    paymentDueDate: initialData?.paymentDueDate || new Date().toISOString().split('T')[0],
    selectedProfiles: initialData?.selectedProfiles || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      toast.error("Please complete all required fields");
      return;
    }

    if (formData.selectedProfiles.length === 0) {
      toast.error("Please select at least one profile");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <Label htmlFor="billTitle">Title</Label>
        <Input
          id="billTitle"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Bill title"
        />
      </div>
      <div>
        <Label htmlFor="billAmount">Amount</Label>
        <Input
          id="billAmount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Bill amount"
        />
      </div>
      <div>
        <Label htmlFor="paymentDueDate">Payment due date</Label>
        <Input
          id="paymentDueDate"
          type="date"
          value={formData.paymentDueDate}
          onChange={(e) => setFormData({ ...formData, paymentDueDate: e.target.value })}
        />
      </div>
      <div>
        <Label>Assign to profiles</Label>
        <AssigneeField
          selectedAssignees={formData.selectedProfiles}
          onChange={(profiles) => setFormData({ ...formData, selectedProfiles: profiles })}
        />
        <p className="text-sm text-gray-500 mt-1">
          Selected profiles will receive notifications about this bill
        </p>
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Update" : "Add"} Bill
      </Button>
    </form>
  );
};