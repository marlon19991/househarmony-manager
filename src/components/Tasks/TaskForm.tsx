import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import useProfiles from "@/hooks/useProfiles";

interface TaskFormProps {
  newTask: { title: string; assignee: string };
  setNewTask: (task: { title: string; assignee: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TaskForm = ({ newTask, setNewTask, onSubmit }: TaskFormProps) => {
  const { profiles } = useProfiles();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="taskTitle">Título de la tarea</Label>
        <Input
          id="taskTitle"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Escribe el título de la tarea"
        />
      </div>
      <div>
        <Label htmlFor="taskAssignee">Responsable</Label>
        <Select 
          onValueChange={(value) => setNewTask({ ...newTask, assignee: value })} 
          value={newTask.assignee}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar responsable" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.name}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile.icon} alt={profile.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  {profile.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Crear Tarea
      </Button>
    </form>
  );
};