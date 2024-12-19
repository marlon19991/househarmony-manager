import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { AssigneeField } from "./FormFields/AssigneeField";
import { WeekdaySelector } from "./FormFields/WeekdaySelector";
import { RecurrenceTypeField } from "./FormFields/RecurrenceTypeField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RecurringTaskFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    selectedAssignees: string[];
    weekdays?: boolean[];
    start_date?: Date;
    end_date?: Date;
    icon?: string;
    recurrence_type?: string;
  };
}

export const RecurringTaskForm = ({ onSubmit, onCancel, initialData }: RecurringTaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [selectedAssignees, setSelectedAssignees] = useState(initialData?.selectedAssignees || []);
  const [weekdays, setWeekdays] = useState<boolean[]>(
    initialData?.weekdays || new Array(7).fill(false)
  );
  const [specificDate, setSpecificDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [recurrenceType, setRecurrenceType] = useState<string>(
    initialData?.recurrence_type || "weekly"
  );

  const handleRecurrenceTypeChange = (type: string) => {
    setRecurrenceType(type);
    if (type === "workdays") {
      // Set Monday to Friday to true, weekends to false
      setWeekdays([false, true, true, true, true, true, false]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (recurrenceType === "specific" && !specificDate) {
      toast.error("Debes seleccionar una fecha específica");
      return;
    }

    if (recurrenceType === "weekly" && !weekdays.some(day => day)) {
      toast.error("Debes seleccionar al menos un día de la semana");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .upsert({
          title,
          assignees: selectedAssignees,
          weekdays: recurrenceType === "weekly" || recurrenceType === "workdays" ? weekdays : new Array(7).fill(false),
          start_date: recurrenceType === "specific" ? specificDate?.toISOString() : null,
          icon: initialData?.icon || '📋',
          recurrence_type: recurrenceType
        })
        .select()
        .single();

      if (error) throw error;

      // Send email to each assignee
      for (const assigneeName of selectedAssignees) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('name', assigneeName)
          .maybeSingle();

        if (profile?.email) {
          await sendTaskAssignmentEmail(
            profile.email,
            assigneeName,
            title,
            "recurring"
          );
        }
      }

      onSubmit();
      toast.success(initialData ? "Tarea actualizada" : "Tarea creada");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al guardar la tarea");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="taskTitle">Título de la tarea</Label>
        <Input
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea"
        />
      </div>
      
      <AssigneeField
        selectedAssignees={selectedAssignees}
        onChange={setSelectedAssignees}
      />

      <RecurrenceTypeField
        value={recurrenceType}
        onChange={handleRecurrenceTypeChange}
      />

      {recurrenceType === "specific" && (
        <div className="space-y-2">
          <Label>Fecha específica</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !specificDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {specificDate ? format(specificDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={specificDate}
                onSelect={setSpecificDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {recurrenceType === "weekly" && (
        <WeekdaySelector weekdays={weekdays} onChange={setWeekdays} />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};