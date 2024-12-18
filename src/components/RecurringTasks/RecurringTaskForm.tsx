import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TitleField } from "./FormFields/TitleField";
import { RecurrenceTypeField } from "./FormFields/RecurrenceTypeField";
import { AssigneeField } from "./FormFields/AssigneeField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecurringTaskFormProps {
  onSubmit: (task: any) => void;
  initialTask?: any;
  onCancel?: () => void;
}

export const RecurringTaskForm = ({ onSubmit, initialTask, onCancel }: RecurringTaskFormProps) => {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    initialTask?.specific_day ? new Date(initialTask.specific_day) : undefined
  );
  const [time, setTime] = useState(initialTask?.time || "");
  const [assignees, setAssignees] = useState<string[]>(initialTask?.assignees || []);
  const [icon, setIcon] = useState(initialTask?.icon || "calendar");
  const [recurrenceType, setRecurrenceType] = useState(initialTask?.recurrence_type || "specific");
  const [selectedDays, setSelectedDays] = useState<string[]>(initialTask?.selected_days || []);

  const weekdays = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  const icons = [
    { value: "calendar", label: "Calendario" },
    { value: "trash", label: "Basura" },
    { value: "recycle", label: "Reciclaje" },
    { value: "broom", label: "Limpieza" },
  ];

  const handleDayToggle = (day: string) => {
    setSelectedDays(current =>
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      recurrence_type: recurrenceType,
      specific_day: selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null,
      selected_days: selectedDays,
      time,
      assignees,
      icon,
    };

    try {
      if (initialTask?.id) {
        const { error } = await supabase
          .from('recurring_tasks')
          .update(taskData)
          .eq('id', initialTask.id);
        
        if (error) throw error;
        toast.success("Tarea actualizada exitosamente");
      } else {
        const { error } = await supabase
          .from('recurring_tasks')
          .insert([taskData]);
        
        if (error) throw error;
        toast.success("Tarea creada exitosamente");
      }

      onSubmit(taskData);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error("Error al guardar la tarea");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TitleField value={title} onChange={setTitle} />
      <RecurrenceTypeField value={recurrenceType} onChange={setRecurrenceType} />

      {recurrenceType === "specific" && (
        <div>
          <Label>Día de la semana</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDay && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDay ? format(selectedDay, "EEEE", { locale: es }) : "Seleccionar día"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                required
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {recurrenceType === "weekly" && (
        <div className="space-y-4">
          <Label>Días de la semana</Label>
          <div className="grid grid-cols-2 gap-4">
            {weekdays.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={selectedDays.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label htmlFor={day.value}>{day.label}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="time">Hora (opcional)</Label>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <AssigneeField selectedAssignees={assignees} onChange={setAssignees} />

      <div>
        <Label>Icono</Label>
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar icono" />
          </SelectTrigger>
          <SelectContent>
            {icons.map((icon) => (
              <SelectItem key={icon.value} value={icon.value}>
                {icon.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initialTask ? "Actualizar" : "Crear"} Tarea
        </Button>
      </div>
    </form>
  );
};