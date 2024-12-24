import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface IconOption {
  src: string;
  label: string;
}

export interface ProfileFormData {
  id?: number;
  name: string;
  icon: string;
  whatsapp_number?: string;
  email?: string;
}

interface ProfileFormProps {
  profile: ProfileFormData;
  setProfile: (profile: ProfileFormData) => void;
  onSubmit: () => void;
  iconOptions: IconOption[];
}

export const ProfileForm = ({ profile, setProfile, onSubmit, iconOptions }: ProfileFormProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Nombre del perfil"
        />
      </div>
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={profile.email || ""}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          placeholder="Correo electrónico (opcional)"
        />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          value={profile.whatsapp_number || ""}
          onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
          placeholder="Número de WhatsApp (opcional)"
        />
      </div>
      <div>
        <Label>Ícono</Label>
        <div className="flex gap-2 mt-2">
          {iconOptions.map((icon) => (
            <button
              key={icon.src}
              type="button"
              onClick={() => setProfile({ ...profile, icon: icon.src })}
              className={`p-1 rounded-full ${
                profile.icon === icon.src ? "ring-2 ring-primary" : ""
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
      <Button onClick={onSubmit} className="w-full">
        Guardar
      </Button>
    </div>
  );
};