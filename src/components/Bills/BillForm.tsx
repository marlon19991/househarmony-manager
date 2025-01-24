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
      // Ajustar la fecha a la zona horaria local
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() + offset * 60000);
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
      const dueDate = new Date(year, month - 1, day, 12, 0, 0);

      if (isNaN(dueDate.getTime())) {
        toast.error("La fecha de vencimiento no es válida");
        return;
      }

      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount.toString()),
        due_date: dueDate.toISOString()
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
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ingresa el título de la factura"
        />
      </div>

      <div>
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Ingresa el monto"
        />
      </div>

      <div>
        <Label htmlFor="due_date">Fecha de vencimiento</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>

      <div>
        <Label>Asignar a</Label>
        <AssigneeField
          selectedAssignees={formData.selectedProfiles}
          onChange={(assignees) => setFormData({ ...formData, selectedProfiles: assignees })}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initialData ? 'Actualizar' : 'Crear'} Factura
        </Button>
      </div>
    </form>
  );
};