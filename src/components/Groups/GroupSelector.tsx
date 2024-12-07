import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import useGroupStore from "@/stores/useGroupStore";

export const GroupSelector = () => {
  const { groups, selectedGroup, setSelectedGroup } = useGroupStore();

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Grupo Actual</h2>
        </div>
        
        <Select
          value={selectedGroup?.id?.toString() || ""}
          onValueChange={(value) => {
            const group = groups.find((g) => g.id.toString() === value);
            setSelectedGroup(group || null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{group.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGroup && (
          <div className="text-sm text-muted-foreground">
            <p>{selectedGroup.description}</p>
            <p className="mt-2">
              {selectedGroup.members.length} miembro
              {selectedGroup.members.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};