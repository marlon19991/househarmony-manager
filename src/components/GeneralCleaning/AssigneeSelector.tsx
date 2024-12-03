import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
}

const AssigneeSelector = ({ currentAssignee, onAssigneeChange, completionPercentage }: AssigneeSelectorProps) => {
  const residents = ["Juan", "Sara", "Miguel", "Ana"];

  const handleAssigneeChange = (newAssignee: string) => {
    if (completionPercentage < 75) {
      toast.error("Debe completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }
    onAssigneeChange(newAssignee);
    toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Asignar responsable</h3>
      <Select onValueChange={handleAssigneeChange} value={currentAssignee}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar responsable" />
        </SelectTrigger>
        <SelectContent>
          {residents.map((resident) => (
            <SelectItem key={resident} value={resident}>
              {resident}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssigneeSelector;