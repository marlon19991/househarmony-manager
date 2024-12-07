import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import useGroupStore from "@/stores/useGroupStore";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const GroupSelector = () => {
  const { selectedGroup } = useGroupStore();

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Grupo Actual</h2>
          </div>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              Administrar Grupos
            </Button>
          </Link>
        </div>
        
        {selectedGroup ? (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{selectedGroup.name}</p>
            <p className="mt-1">{selectedGroup.description}</p>
            <p className="mt-2">
              {selectedGroup.members.length} miembro
              {selectedGroup.members.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>No hay ningún grupo seleccionado.</p>
            <Link to="/settings" className="text-primary hover:underline">
              Haz clic aquí para crear o seleccionar un grupo
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};