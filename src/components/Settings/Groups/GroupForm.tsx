import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GroupFormProps {
  group: {
    name: string;
    description: string;
  };
  setGroup: (group: { name: string; description: string }) => void;
  onSubmit: () => void;
  buttonText?: string;
}

export const GroupForm = ({ group, setGroup, onSubmit, buttonText = "Crear Grupo" }: GroupFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={group.name}
          onChange={(e) => setGroup({ ...group, name: e.target.value })}
          placeholder="Nombre del grupo"
        />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={group.description}
          onChange={(e) => setGroup({ ...group, description: e.target.value })}
          placeholder="Descripción del grupo"
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {buttonText}
      </Button>
    </div>
  );
};