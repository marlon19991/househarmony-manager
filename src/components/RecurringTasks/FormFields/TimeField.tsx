import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface TimeFieldProps {
  value: string;
  onChange: (time: string) => void;
}

export const TimeField = ({ value, onChange }: TimeFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notificationTime">Hora de notificación</Label>
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          id="notificationTime"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};