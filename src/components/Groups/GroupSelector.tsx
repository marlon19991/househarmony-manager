import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import useGroupStore from "@/stores/useGroupStore";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GroupSelector = () => {
  const { selectedGroup, groups, setSelectedGroup } = useGroupStore();

  const handleGroupChange = (groupId: string) => {
    const group = groups.find((g) => g.id === parseInt(groupId));
    setSelectedGroup(group || null);
  };

  return (
    <Card className="p-3 mb-4 bg-gradient-to-br from-background to-muted border-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-primary" />
          <Select
            value={selectedGroup?.id?.toString()}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger className="w-[180px] h-8 text-sm border-none bg-transparent hover:bg-accent/50 transition-colors">
              <SelectValue
                placeholder="Seleccionar grupo"
                className="text-sm"
              />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem
                  key={group.id}
                  value={group.id.toString()}
                  className="text-sm"
                >
                  <div className="flex flex-col">
                    <span>{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.members.length} miembro
                      {group.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {groups.length === 0 && (
                <SelectItem value="empty" disabled>
                  No hay grupos disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Link to="/settings">
          <Button variant="ghost" size="sm" className="text-xs">
            Administrar
          </Button>
        </Link>
      </div>
    </Card>
  );
};