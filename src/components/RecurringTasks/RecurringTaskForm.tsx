import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { AssigneeField } from "./FormFields/AssigneeField";
import { WeekdaySelector } from "./FormFields/WeekdaySelector";
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
  };
}

export const RecurringTaskForm = ({ onSubmit, onCancel, initialData }: RecurringTaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [selectedAssignees, setSelectedAssignees] = useState(initialData?.selectedAssignees || []);
  const [weekdays, setWeekdays] = useState<boolean[]>(
    initialData?.weekdays || new Array(7).fill(false)
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? new Date(initialData.end_date) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (!weekdays.some(day => day) && !startDate) {
      toast.error("Debes seleccionar al menos un día de la semana o una fecha específica");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .upsert({
          title,
          assignees: selectedAssignees,
          weekdays,
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          icon: initialData?.icon || '📋'
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha de inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Fecha de fin (opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => startDate ? date < startDate : false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <WeekdaySelector weekdays={weekdays} onChange={setWeekdays} />

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