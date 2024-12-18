import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RecurrenceTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const RecurrenceTypeField = ({ value, onChange }: RecurrenceTypeFieldProps) => {
  return (
    <div className="space-y-3">
      <Label>Tipo de recurrencia</Label>
      <RadioGroup value={value} onValueChange={onChange}>
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
  );
};