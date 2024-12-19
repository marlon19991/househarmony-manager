import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface WeekdaySelectorProps {
  weekdays: boolean[];
  onChange: (weekdays: boolean[]) => void;
}

export const WeekdaySelector = ({ weekdays, onChange }: WeekdaySelectorProps) => {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const handleToggleAll = (checked: boolean) => {
    onChange(new Array(7).fill(checked));
  };

  const handleToggleDay = (index: number, checked: boolean) => {
    const newWeekdays = [...weekdays];
    newWeekdays[index] = checked;
    onChange(newWeekdays);
  };

  const allSelected = weekdays.every(day => day);

  return (
    <div className="space-y-4">
      <Label>Días de la semana</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-days"
            checked={allSelected}
            onCheckedChange={handleToggleAll}
          />
          <Label htmlFor="all-days" className="text-sm font-normal">
            Todos los días
          </Label>
        </div>
        {days.map((day, index) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${index}`}
              checked={weekdays[index]}
              onCheckedChange={(checked) => handleToggleDay(index, checked as boolean)}
            />
            <Label htmlFor={`day-${index}`} className="text-sm font-normal">
              {day}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};