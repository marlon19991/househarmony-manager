import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Pencil, Trash2, Check, X } from "lucide-react";
import useProfiles from "@/hooks/useProfiles";

interface Task {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "completed";
  isEditing?: boolean;
}

interface TaskItemProps {
  task: Task;
  onSave: (taskId: number, newTitle: string, newAssignee: string) => void;
  onDelete: (taskId: number) => void;
  onToggleStatus: (taskId: number) => void;
  onStartEditing: (taskId: number) => void;
  onCancelEditing: (taskId: number) => void;
}

export const TaskItem = ({
  task,
  onSave,
  onDelete,
  onToggleStatus,
  onStartEditing,
  onCancelEditing,
}: TaskItemProps) => {
  const { profiles } = useProfiles();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        {task.isEditing ? (
          <div className="flex-1 mr-4">
            <Input
              defaultValue={task.title}
              className="mb-2"
              onChange={(e) => {
                const newTitle = e.target.value;
                task.title = newTitle;
              }}
            />
            <Select
              defaultValue={task.assignee}
              onValueChange={(value) => {
                task.assignee = value;
              }}
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
        ) : (
          <div>
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-500">Asignado a {task.assignee}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          {task.isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSave(task.id, task.title, task.assignee)}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCancelEditing(task.id)}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => onToggleStatus(task.id)}
                className={task.status === "completed" ? "text-green-500" : "text-amber-500"}
              >
                {task.status === "completed" ? "Completada" : "Pendiente"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStartEditing(task.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};