import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ProfileForm } from "./ProfileForm";

interface Profile {
  id: number;
  name: string;
  icon: string;
  whatsapp_number?: string;
  email?: string;
}

export const ProfilesSection = () => {
  const { profiles, loading, fetchProfiles, addProfile, updateProfile, deleteProfile } = useProfiles();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState<Omit<Profile, "id">>({ 
    name: "", 
    icon: "/placeholder.svg",
    whatsapp_number: "",
    email: "" 
  });
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
    setNewProfile({ name: "", icon: "/placeholder.svg", whatsapp_number: "", email: "" });
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
            <ProfileForm
              profile={newProfile}
              setProfile={setNewProfile as (profile: Omit<Profile, "id">) => void}
              onSubmit={handleAddProfile}
              iconOptions={[
                { src: "/placeholder.svg", label: "Default" },
                { src: "https://github.com/shadcn.png", label: "Avatar 1" },
                { src: "https://api.dicebear.com/7.x/avataaars/svg", label: "Avatar 2" },
              ]}
            />
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
                <div className="space-y-1">
                  <span className="font-medium">{profile.name}</span>
                  {profile.email && (
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  )}
                  {profile.whatsapp_number && (
                    <p className="text-sm text-muted-foreground">{profile.whatsapp_number}</p>
                  )}
                </div>
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
            <ProfileForm
              profile={editingProfile}
              setProfile={setEditingProfile as unknown as (profile: Profile) => void}
              onSubmit={handleUpdateProfile}
              iconOptions={[
                { src: "/placeholder.svg", label: "Default" },
                { src: "https://github.com/shadcn.png", label: "Avatar 1" },
                { src: "https://api.dicebear.com/7.x/avataaars/svg", label: "Avatar 2" },
              ]}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};