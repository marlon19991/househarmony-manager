import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface GroupFormProps {
  group: {
    name: string;
    description: string;
    members: string[];
  };
  setGroup: (group: { name: string; description: string; members: string[] }) => void;
  onSubmit: () => void;
}

export const GroupForm = ({ group, setGroup, onSubmit }: GroupFormProps) => {
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
        <Textarea
          id="description"
          value={group.description}
          onChange={(e) => setGroup({ ...group, description: e.target.value })}
          placeholder="Descripción del grupo"
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        Guardar
      </Button>
    </div>
  );
};