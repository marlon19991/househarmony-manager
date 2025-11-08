import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AssigneeField } from "@/components/RecurringTasks/FormFields/AssigneeField";
import { toast } from "sonner";
import type { BillFormInput } from "./utils/billsLogic";

interface BillFormProps {
  onSubmit: (bill: BillFormInput) => void;
  onCancel?: () => void;
  initialData?: {
    title: string;
    amount: number;
    payment_due_date: string;
    status?: string;
    selected_profiles: string[];
  };
}

const billFormSchema = z.object({
  title: z.string().trim().min(1, "El título es requerido"),
  amount: z
    .number({ invalid_type_error: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
  due_date: z
    .string()
    .refine((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, "Selecciona una fecha válida"),
  selectedProfiles: z.array(z.string()).min(1, "Selecciona al menos un perfil"),
});

type BillFormValues = z.infer<typeof billFormSchema>;

export const BillForm = ({ onSubmit, onCancel, initialData }: BillFormProps) => {
  const formatDateForInput = (date: string | undefined) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.error("Fecha inválida:", date);
        return "";
      }
      const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return localDate.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "";
    }
  };

  const defaultValues: BillFormValues = {
    title: initialData?.title ?? "",
    amount: initialData?.amount ?? 0,
    due_date:
      formatDateForInput(initialData?.payment_due_date) ||
      formatDateForInput(new Date().toISOString()),
    selectedProfiles: initialData?.selected_profiles ?? [],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues,
  });

  const processSubmit = (data: BillFormValues) => {
    try {
      const [year, month, day] = data.due_date.split("-").map(Number);
      const dueDate = new Date(year, month - 1, day, 23, 59, 59);

      if (isNaN(dueDate.getTime())) {
        toast.error("La fecha de vencimiento no es válida");
        return;
      }

      const localDueDate = new Date(
        dueDate.getTime() - dueDate.getTimezoneOffset() * 60000
      );

      onSubmit({
        title: data.title.trim(),
        amount: data.amount,
        due_date: localDueDate.toISOString(),
        selectedProfiles: data.selectedProfiles,
      });

      onCancel?.();
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      toast.error("Error al procesar el formulario");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(processSubmit)}
      className="space-y-4 mt-4 w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Título
        </Label>
        <Input
          id="title"
          placeholder="Ingresa el título de la factura"
          className="w-full"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium">
          Monto
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="Ingresa el monto"
          className="w-full"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date" className="text-sm font-medium">
          Fecha de vencimiento
        </Label>
        <Input
          id="due_date"
          type="date"
          className="w-full"
          {...register("due_date")}
        />
        {errors.due_date && (
          <p className="text-sm text-destructive">{errors.due_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Asignar a</Label>
        <Controller
          control={control}
          name="selectedProfiles"
          render={({ field }) => (
            <AssigneeField
              selectedProfiles={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.selectedProfiles && (
          <p className="text-sm text-destructive">
            {errors.selectedProfiles.message}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
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
