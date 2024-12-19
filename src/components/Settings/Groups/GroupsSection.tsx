import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GroupForm } from "./GroupForm";
import { GroupCard } from "./GroupCard";
import useGroupStore from "@/stores/useGroupStore";
import { useState } from "react";

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
}

export const GroupsSection = () => {
  const { groups, addGroup, updateGroup: updateGroupInStore, deleteGroup: deleteGroupFromStore } = useGroupStore();
  const [newGroup, setNewGroup] = useState({ name: "", description: "", members: [] });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleAddGroup = async () => {
    if (!newGroup.name) {
      toast.error("Por favor ingresa un nombre para el grupo");
      return;
    }

    try {
      await addGroup({
        name: newGroup.name,
        description: newGroup.description,
        members: newGroup.members,
      });
      setNewGroup({ name: "", description: "", members: [] });
      toast.success("Grupo creado exitosamente");
    } catch (error) {
      console.error('Error al crear grupo:', error);
      toast.error("Error al crear el grupo");
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    try {
      await updateGroupInStore(editingGroup);
      setEditingGroup(null);
      toast.success("Grupo actualizado exitosamente");
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      toast.error("Error al actualizar el grupo");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await deleteGroupFromStore(id);
      toast.success("Grupo eliminado exitosamente");
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      toast.error("Error al eliminar el grupo");
    }
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
            <div className="mt-6">
              <GroupForm
                group={newGroup}
                setGroup={setNewGroup}
                onSubmit={handleAddGroup}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            editingGroup={editingGroup}
            setEditingGroup={setEditingGroup}
            handleUpdateGroup={handleUpdateGroup}
            handleDeleteGroup={handleDeleteGroup}
          />
        ))}
        {groups.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay grupos creados. Crea un grupo para empezar.
          </p>
        )}
      </div>
    </div>
  );
};