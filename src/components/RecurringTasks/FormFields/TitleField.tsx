import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const TitleField = ({ value, onChange }: TitleFieldProps) => {
  return (
    <div>
      <Label htmlFor="title">Título de la tarea</Label>
      <Input
        id="title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Sacar el reciclaje"
        required
      />
    </div>
  );
};