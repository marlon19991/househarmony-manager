import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: {
    name: string;
    icon: string;
    whatsapp_number?: string;
    email?: string;
  };
  setProfile: (profile: {
    name: string;
    icon: string;
    whatsapp_number?: string;
    email?: string;
  }) => void;
  onSubmit: () => void;
  iconOptions: Array<{ src: string; label: string }>;
}

export const ProfileForm = ({ profile, setProfile, onSubmit, iconOptions }: ProfileFormProps) => {
  const handleSubmit = async () => {
    if (profile.email) {
      try {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: [profile.email],
            subject: "Bienvenido a Roomies",
            html: `
              <h1>¡Hola ${profile.name}!</h1>
              <p>Tu perfil ha sido creado exitosamente en Roomies.</p>
              <p>Recibirás notificaciones importantes en este correo electrónico.</p>
            `,
          },
        });

        if (error) throw error;
        toast.success("Correo de bienvenida enviado");
      } catch (error) {
        console.error("Error sending welcome email:", error);
        toast.error("Error al enviar el correo de bienvenida");
      }
    }
    onSubmit();
  };

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
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          value={profile.email || ''}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          placeholder="correo@ejemplo.com"
        />
      </div>
      <div>
        <Label>Ícono</Label>
        <div className="flex gap-2 mt-2">
          {iconOptions.map((icon) => (
            <button
              key={icon.src}
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
      <Button onClick={handleSubmit} className="w-full">
        Guardar
      </Button>
    </div>
  );
};