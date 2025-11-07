import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useProfiles from "@/hooks/useProfiles";

interface AssigneeFieldProps {
  selectedAssignees?: string[];
  selectedProfiles?: string[]; // Alias para compatibilidad con BillForm
  onChange: (assignees: string[]) => void;
}

export const AssigneeField = ({ selectedAssignees, selectedProfiles, onChange }: AssigneeFieldProps) => {
  const { profiles } = useProfiles();

  // Asegurar que selectedAssignees siempre sea un array, usando el alias si está disponible
  const safeSelectedAssignees = selectedAssignees || selectedProfiles || [];

  const handleToggleAll = (checked: boolean) => {
    onChange(checked ? profiles.map(p => p.name) : []);
  };

  const handleToggleAssignee = (assignee: string, checked: boolean) => {
    onChange(
      checked
        ? [...safeSelectedAssignees, assignee]
        : safeSelectedAssignees.filter(a => a !== assignee)
    );
  };

  const allSelected = profiles.length > 0 && safeSelectedAssignees.length === profiles.length;

  return (
    <div className="space-y-4">
      <Label>Asignar a</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all"
            checked={allSelected}
            onCheckedChange={handleToggleAll}
          />
          <Label htmlFor="all" className="text-sm font-normal">
            Todos
          </Label>
        </div>
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center space-x-2">
            <Checkbox
              id={`assignee-${profile.id}`}
              checked={safeSelectedAssignees.includes(profile.name)}
              onCheckedChange={(checked) => handleToggleAssignee(profile.name, checked as boolean)}
            />
            <Label htmlFor={`assignee-${profile.id}`} className="text-sm font-normal">
              {profile.name}
              {profile.email && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({profile.email})
                </span>
              )}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};