import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AssigneeField } from "@/components/RecurringTasks/FormFields/AssigneeField";
import { toast } from "sonner";

interface BillFormProps {
  onSubmit: (bill: any) => void;
  onCancel?: () => void;
  initialData?: {
    title: string;
    amount: number;
    payment_due_date: string;
    status?: string;
    selected_profiles: string[];
  };
}

export const BillForm = ({ onSubmit, onCancel, initialData }: BillFormProps) => {
  const formatDateForInput = (date: string | undefined) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.error('Fecha inválida:', date);
        return '';
      }
      // Ajustar la fecha para que coincida con la zona horaria local
      const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    amount: initialData?.amount || "",
    due_date: formatDateForInput(initialData?.payment_due_date) || formatDateForInput(new Date().toISOString()),
    selectedProfiles: initialData?.selected_profiles || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.due_date) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (formData.selectedProfiles.length === 0) {
      toast.error("Por favor selecciona al menos un perfil");
      return;
    }

    try {
      // Crear fecha asegurando que sea la fecha exacta seleccionada
      const [year, month, day] = formData.due_date.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day, 23, 59, 59);

      if (isNaN(dueDate.getTime())) {
        toast.error("La fecha de vencimiento no es válida");
        return;
      }

      // Ajustar la fecha para que coincida con la zona horaria local
      const localDueDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);

      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount.toString()),
        due_date: localDueDate.toISOString()
      });

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      toast.error('Error al procesar el formulario');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 w-full max-w-lg mx-auto px-4 sm:px-0">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ingresa el título de la factura"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium">Monto</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Ingresa el monto"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date" className="text-sm font-medium">Fecha de vencimiento</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Asignar a</Label>
        <AssigneeField
          selectedProfiles={formData.selectedProfiles}
          onChange={(profiles) => setFormData({ ...formData, selectedProfiles: profiles })}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button type="submit" className="w-full sm:w-auto">
          Guardar
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};