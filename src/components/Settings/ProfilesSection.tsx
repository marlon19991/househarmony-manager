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
import { ProfileForm, ProfileFormData } from "./ProfileForm";

const iconOptions = [
  { src: "/placeholder.svg", label: "Predeterminado" },
  { src: "https://github.com/shadcn.png", label: "Avatar 1" },
  { src: "https://api.dicebear.com/7.x/avataaars/svg", label: "Avatar 2" },
];

export const ProfilesSection = () => {
  const { profiles, loading, fetchProfiles, addProfile, updateProfile, deleteProfile } = useProfiles();
  const [editingProfile, setEditingProfile] = useState<ProfileFormData | null>(null);
  const [newProfile, setNewProfile] = useState<Omit<ProfileFormData, "id">>({ 
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
    if (!editingProfile?.id) return;
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
    <div className="space-y-6">
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
              setProfile={setNewProfile}
              onSubmit={handleAddProfile}
              iconOptions={iconOptions}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.icon} alt={profile.name} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1.5">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                {profile.email && (
                  <p className="text-sm text-muted-foreground break-all">
                    {profile.email}
                  </p>
                )}
                {profile.whatsapp_number && (
                  <p className="text-sm text-muted-foreground">
                    {profile.whatsapp_number}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingProfile(profile);
                    setShowEditDialog(true);
                  }}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el perfil permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
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
              Modifica los datos del perfil.
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <ProfileForm
              profile={editingProfile}
              setProfile={setEditingProfile}
              onSubmit={handleUpdateProfile}
              iconOptions={iconOptions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};