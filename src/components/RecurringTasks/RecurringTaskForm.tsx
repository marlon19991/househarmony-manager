import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AssigneeField } from "./FormFields/AssigneeField";
import { WeekdaySelector } from "./FormFields/WeekdaySelector";
import { RecurrenceTypeField } from "./FormFields/RecurrenceTypeField";
import { TimeField } from "./FormFields/TimeField";
import { SpecificDateField } from "./FormFields/SpecificDateField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import type { RecurringTaskPayload } from "./hooks/useRecurringTasks";

interface RecurringTaskFormProps {
  onSubmit: (task: RecurringTaskPayload) => void;
  onCancel: () => void;
  initialData?: {
    id?: number;
    title: string;
    description?: string;
    selectedAssignees: string[];
    weekdays?: boolean[];
    start_date?: Date;
    end_date?: Date;
    icon?: string;
    recurrence_type?: string;
    notification_time?: string;
  };
}

const recurrenceTypeEnum = z.enum(["specific", "weekly", "workdays"]);
const workdaysPreset = [false, true, true, true, true, true, false];
const emptyWeekdays = new Array(7).fill(false) as boolean[];

const recurringTaskSchema = z
  .object({
    title: z.string().trim().min(1, "El título es requerido"),
    description: z.string().optional(),
    selectedAssignees: z.array(z.string()).min(1, "Selecciona al menos una persona"),
    recurrence_type: recurrenceTypeEnum,
    weekdays: z.array(z.boolean()).length(7),
    specificDate: z.date().optional().nullable(),
    notification_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ingresa una hora válida"),
  })
  .superRefine((data, ctx) => {
    if (data.recurrence_type === "specific" && !data.specificDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specificDate"],
        message: "Selecciona una fecha específica",
      });
    }

    if (data.recurrence_type === "weekly" && !data.weekdays.some(Boolean)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weekdays"],
        message: "Selecciona al menos un día de la semana",
      });
    }
  });

type RecurringTaskFormValues = z.infer<typeof recurringTaskSchema>;

export const RecurringTaskForm = ({ onSubmit, onCancel, initialData }: RecurringTaskFormProps) => {
  const defaultValues: RecurringTaskFormValues = {
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    selectedAssignees: initialData?.selectedAssignees ?? [],
    recurrence_type: (initialData?.recurrence_type as RecurringTaskFormValues["recurrence_type"]) ?? "weekly",
    weekdays: initialData?.weekdays ?? [...emptyWeekdays],
    specificDate: initialData?.start_date ? new Date(initialData.start_date) : undefined,
    notification_time: initialData?.notification_time ?? "09:00",
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecurringTaskFormValues>({
    resolver: zodResolver(recurringTaskSchema),
    defaultValues,
  });

  const recurrenceType = watch("recurrence_type");
  const weekdaysValue = watch("weekdays");

  useEffect(() => {
    if (recurrenceType === "workdays") {
      const matchesPreset = weekdaysValue.every((value, index) => value === workdaysPreset[index]);
      if (!matchesPreset) {
        setValue("weekdays", [...workdaysPreset], { shouldValidate: true });
      }
    }
  }, [recurrenceType, weekdaysValue, setValue]);

  useEffect(() => {
    if (recurrenceType !== "specific") {
      setValue("specificDate", undefined, { shouldValidate: true });
    }
  }, [recurrenceType, setValue]);

  const processSubmit = (data: RecurringTaskFormValues) => {
    try {
      const payload: RecurringTaskPayload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        notification_time: data.notification_time,
        recurrence_type: data.recurrence_type,
        start_date:
          data.recurrence_type === "specific" && data.specificDate
            ? format(data.specificDate, "yyyy-MM-dd")
            : null,
        weekdays: data.recurrence_type === "weekly" ? data.weekdays : null,
        assignees: data.selectedAssignees,
        icon: initialData?.icon || "📋",
      };

      onSubmit(payload);
      onCancel();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      toast.error("Error al guardar la tarea");
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="taskTitle">Título de la tarea</Label>
        <Input
          id="taskTitle"
          placeholder="Escribe el título de la tarea"
          {...register("title")}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskDescription">Descripción</Label>
        <Textarea
          id="taskDescription"
          placeholder="Describe los detalles de la tarea"
          className="h-24"
          {...register("description")}
        />
      </div>
      
      <div>
        <Controller
          control={control}
          name="selectedAssignees"
          render={({ field }) => (
            <AssigneeField
              selectedAssignees={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.selectedAssignees && (
          <p className="text-sm text-destructive mt-2">
            {errors.selectedAssignees.message}
          </p>
        )}
      </div>

      <Controller
        control={control}
        name="recurrence_type"
        render={({ field }) => (
          <RecurrenceTypeField
            value={field.value}
            onChange={(value) => field.onChange(value as RecurringTaskFormValues["recurrence_type"])}
          />
        )}
      />

      {recurrenceType === "specific" && (
        <div>
          <Controller
            control={control}
            name="specificDate"
            render={({ field }) => (
              <SpecificDateField
                value={field.value ?? undefined}
                onChange={field.onChange}
              />
            )}
          />
          {errors.specificDate && (
            <p className="text-sm text-destructive mt-2">
              {errors.specificDate.message}
            </p>
          )}
        </div>
      )}

      {recurrenceType === "weekly" && (
        <div>
          <Controller
            control={control}
            name="weekdays"
            render={({ field }) => (
              <WeekdaySelector
                weekdays={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.weekdays && (
            <p className="text-sm text-destructive mt-2">
              {errors.weekdays.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Controller
          control={control}
          name="notification_time"
          render={({ field }) => (
            <TimeField
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.notification_time && (
          <p className="text-sm text-destructive mt-2">
            {errors.notification_time.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};
