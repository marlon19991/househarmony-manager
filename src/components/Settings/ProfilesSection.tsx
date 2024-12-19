import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, UserPlus, UserX, Settings } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useProfiles from "@/hooks/useProfiles";

interface Profile {
  id: number;
  name: string;
  icon: string;
}

export const ProfilesSection = () => {
  const { profiles, loading, fetchProfiles, addProfile, updateProfile, deleteProfile } = useProfiles();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState({ name: "", icon: "/placeholder.svg" });
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleAddProfile = async () => {
    if (!newProfile.name) {
      toast.error("Por favor ingresa un nombre para el perfil");
      return;
    }

    await addProfile(newProfile);
    setNewProfile({ name: "", icon: "/placeholder.svg" });
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;
    await updateProfile(editingProfile);
    setEditingProfile(null);
    setShowEditDialog(false);
    toast.success("Perfil actualizado exitosamente");
  };

  const handleDeleteProfile = async (id: number) => {
    await deleteProfile(id);
  };

  const iconOptions = [
    { src: "/placeholder.svg", label: "Default" },
    { src: "https://github.com/shadcn.png", label: "Avatar 1" },
    { src: "https://api.dicebear.com/7.x/avataaars/svg", label: "Avatar 2" },
  ];

  if (loading) {
    return <div>Cargando perfiles...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Perfiles</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <UserPlus className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Crear Nuevo Perfil</SheetTitle>
              <SheetDescription>
                Agrega un nuevo perfil para gestionar tareas y responsabilidades.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="Nombre del perfil"
                />
              </div>
              <div>
                <Label>Ícono</Label>
                <div className="flex gap-2 mt-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.src}
                      onClick={() => setNewProfile({ ...newProfile, icon: icon.src })}
                      className={`p-1 rounded-full ${
                        newProfile.icon === icon.src ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={icon.src} alt={icon.label} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddProfile} className="w-full">
                Crear Perfil
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile.icon} alt={profile.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingProfile(profile);
                    setShowEditDialog(true);
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserX className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente este perfil.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Modifica los detalles del perfil
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingProfile.name}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Ícono</Label>
                <div className="flex gap-2 mt-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.src}
                      onClick={() => setEditingProfile({ ...editingProfile, icon: icon.src })}
                      className={`p-1 rounded-full ${
                        editingProfile.icon === icon.src ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={icon.src} alt={icon.label} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProfile}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};