import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
}

interface GroupCardProps {
  group: Group;
  editingGroup: Group | null;
  setEditingGroup: (group: Group | null) => void;
  handleUpdateGroup: () => void;
  handleDeleteGroup: (id: number) => void;
}

export const GroupCard = ({
  group,
  editingGroup,
  setEditingGroup,
  handleUpdateGroup,
  handleDeleteGroup,
}: GroupCardProps) => {
  return (
    <Card key={group.id} className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {editingGroup?.id === group.id ? (
            <div className="space-y-2">
              <Input
                value={editingGroup.name}
                onChange={(e) =>
                  setEditingGroup({ ...editingGroup, name: e.target.value })
                }
              />
              <Input
                value={editingGroup.description}
                onChange={(e) =>
                  setEditingGroup({ ...editingGroup, description: e.target.value })
                }
              />
              <Button onClick={handleUpdateGroup}>Guardar</Button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {group.members.length} miembros
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {editingGroup?.id !== group.id && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingGroup(group)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente este grupo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};