import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, UserPlus, UserX, Pencil } from "lucide-react";

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
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Perfiles</h1>
        <UserPlus className="w-6 h-6 text-gray-500" />
      </div>

      {/* Formulario para nuevo perfil */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Crear Nuevo Perfil</h2>
        <div className="space-y-4">
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
      </Card>

      {/* Lista de perfiles */}
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile.icon} alt={profile.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                {editingProfile?.id === profile.id ? (
                  <Input
                    value={editingProfile.name}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, name: e.target.value })
                    }
                  />
                ) : (
                  <span className="font-medium">{profile.name}</span>
                )}
              </div>
              <div className="flex gap-2">
                {editingProfile?.id === profile.id ? (
                  <Button onClick={handleUpdateProfile}>Guardar</Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingProfile(profile)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProfile(profile.id)}
                >
                  <UserX className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Profiles;