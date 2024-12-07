import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import useProfiles from "@/hooks/useProfiles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface RecurringTaskFormProps {
  onSubmit: (task: any) => void;
  initialTask?: any;
  onCancel?: () => void;
}

export const RecurringTaskForm = ({ onSubmit, initialTask, onCancel }: RecurringTaskFormProps) => {
  const { profiles } = useProfiles();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(initialTask?.day ? new Date(initialTask.day) : undefined);
  const [time, setTime] = useState(initialTask?.time || "");
  const [assignee, setAssignee] = useState(initialTask?.assignee || "all");
  const [icon, setIcon] = useState(initialTask?.icon || "calendar");
  const [recurrenceType, setRecurrenceType] = useState(initialTask?.recurrenceType || "specific");
  const [selectedDays, setSelectedDays] = useState<string[]>(initialTask?.selectedDays || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      day: selectedDay,
      time,
      assignee,
      icon,
      recurrenceType,
      selectedDays,
    });
  };

  const icons = [
    { value: "calendar", label: "Calendario" },
    { value: "trash", label: "Basura" },
    { value: "recycle", label: "Reciclaje" },
    { value: "broom", label: "Limpieza" },
  ];

  const weekdays = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  const handleDayToggle = (day: string) => {
    setSelectedDays(current =>
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título de la tarea</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Sacar el reciclaje"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Tipo de recurrencia</Label>
        <RadioGroup value={recurrenceType} onValueChange={setRecurrenceType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific" />
            <Label htmlFor="specific">Día específico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly">Semanal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="workdays" id="workdays" />
            <Label htmlFor="workdays">Lunes a viernes</Label>
          </div>
        </RadioGroup>
      </div>

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

      <div>
        <Label>Asignar a</Label>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id.toString()}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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