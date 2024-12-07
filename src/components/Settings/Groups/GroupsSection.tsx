import { useState } from "react";
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

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
}

export const GroupsSection = () => {
  const { groups, addGroup: addGroupToStore, updateGroup: updateGroupInStore, deleteGroup: deleteGroupFromStore } = useGroupStore();
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

    addGroupToStore(group);
    setNewGroup({ name: "", description: "", members: [] });
    toast.success("Grupo creado exitosamente");
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;

    updateGroupInStore(editingGroup);
    setEditingGroup(null);
    toast.success("Grupo actualizado exitosamente");
  };

  const handleDeleteGroup = (id: number) => {
    deleteGroupFromStore(id);
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
      </div>
    </div>
  );
};