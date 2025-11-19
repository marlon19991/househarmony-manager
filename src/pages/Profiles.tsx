import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, UserPlus, UserX, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface Profile {
  id: number;
  name: string;
  icon: string;
}

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: 1, name: "Juan", icon: "/placeholder.svg" },
    { id: 2, name: "María", icon: "/placeholder.svg" },
  ]);

  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState({ name: "", icon: "/placeholder.svg" });

  const handleAddProfile = () => {
    if (!newProfile.name) {
      toast.error("Por favor ingresa un nombre para el perfil");
      return;
    }

    const profile = {
      id: profiles.length + 1,
      name: newProfile.name,
      icon: newProfile.icon,
    };

    setProfiles([...profiles, profile]);
    setNewProfile({ name: "", icon: "/placeholder.svg" });
    toast.success("Perfil creado exitosamente");
  };

  const handleUpdateProfile = () => {
    if (!editingProfile) return;

    setProfiles(
      profiles.map((p) =>
        p.id === editingProfile.id ? editingProfile : p
      )
    );
    setEditingProfile(null);
    toast.success("Perfil actualizado exitosamente");
  };

  const handleDeleteProfile = (id: number) => {
    setProfiles(profiles.filter((p) => p.id !== id));
    toast.success("Perfil eliminado exitosamente");
  };

  const iconOptions = [
    { src: "/placeholder.svg", label: "Default" },
    { src: "https://github.com/shadcn.png", label: "Avatar 1" },
    { src: "https://api.dicebear.com/7.x/avataaars/svg", label: "Avatar 2" },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Perfiles</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="glass-button">
              <UserPlus className="h-5 w-5 mr-2" />
              Nuevo Perfil
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-panel border-l border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Crear Nuevo Perfil</SheetTitle>
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
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Ícono</Label>
                <div className="flex gap-2 mt-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.src}
                      onClick={() => setNewProfile({ ...newProfile, icon: icon.src })}
                      className={cn(
                        "p-1 rounded-full transition-all",
                        newProfile.icon === icon.src ? "ring-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={icon.src} alt={icon.label} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddProfile} className="w-full glass-button">
                Crear Perfil
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <div key={profile.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-primary/20">
                <AvatarImage src={profile.icon} alt={profile.name} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              {editingProfile?.id === profile.id ? (
                <Input
                  value={editingProfile.name}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, name: e.target.value })
                  }
                  className="bg-white/5 border-white/10"
                />
              ) : (
                <span className="font-medium text-white">{profile.name}</span>
              )}
            </div>
            <div className="flex gap-2">
              {editingProfile?.id === profile.id ? (
                <Button onClick={handleUpdateProfile} size="sm">Guardar</Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingProfile(profile)}
                  className="hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-destructive/10 text-destructive hover:text-destructive">
                    <UserX className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-panel border border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente este perfil.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)} className="bg-destructive hover:bg-destructive/90">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profiles;