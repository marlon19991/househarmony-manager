import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Users, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export const GroupsSection = () => {
  const [groups, setGroups] = useState<Group[]>([
    { 
      id: 1, 
      name: "Casa", 
      description: "Grupo para gestionar tareas y gastos del hogar",
      members: ["Juan", "María"]
    }
  ]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", members: [] });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleAddGroup = () => {
    if (!newGroup.name) {
      toast.error("Por favor ingresa un nombre para el grupo");
      return;
    }

    const group = {
      id: Date.now(),
      name: newGroup.name,
      description: newGroup.description,
      members: newGroup.members,
    };

    setGroups([...groups, group]);
    setNewGroup({ name: "", description: "", members: [] });
    toast.success("Grupo creado exitosamente");
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;

    setGroups(
      groups.map((g) =>
        g.id === editingGroup.id ? editingGroup : g
      )
    );
    setEditingGroup(null);
    toast.success("Grupo actualizado exitosamente");
  };

  const handleDeleteGroup = (id: number) => {
    setGroups(groups.filter((g) => g.id !== id));
    toast.success("Grupo eliminado exitosamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Grupos</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Nuevo Grupo
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Crear Nuevo Grupo</SheetTitle>
              <SheetDescription>
                Crea un nuevo grupo para gestionar tareas y gastos compartidos.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Nombre del grupo"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Descripción del grupo"
                />
              </div>
              <Button onClick={handleAddGroup} className="w-full">
                Crear Grupo
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
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
        ))}
      </div>
    </div>
  );
};