import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import useGroupStore from "@/stores/useGroupStore";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const GroupSelector = () => {
  const { selectedGroup } = useGroupStore();

  return (
    <Card className="p-3 mb-4 bg-gradient-to-br from-background to-muted border-none">
      <div className="flex items-center justify-between">
        {selectedGroup ? (
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <p className="font-medium text-sm">{selectedGroup.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedGroup.members.length} miembro
                {selectedGroup.members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sin grupo seleccionado</p>
          </div>
        )}
        
        <Link to="/settings">
          <Button variant="ghost" size="sm" className="text-xs">
            Administrar
          </Button>
        </Link>
      </div>
    </Card>
  );
};