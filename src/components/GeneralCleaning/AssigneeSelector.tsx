import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useTaskPersistence } from "./hooks/useTaskPersistence";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
}

const AssigneeSelector = ({ currentAssignee, onAssigneeChange, completionPercentage }: AssigneeSelectorProps) => {
  const { profiles } = useProfiles();
  const { tasks, setTasks } = useTaskPersistence(currentAssignee);

  const handleAssigneeChange = async (newAssignee: string) => {
    // Skip validation if current assignee is "Sin asignar"
    if (currentAssignee !== "Sin asignar" && completionPercentage < 75) {
      toast.error("Debe completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }

    try {
      // Find the new assignee's profile to get their email
      const assigneeProfile = profiles.find(p => p.name === newAssignee);
      
      if (assigneeProfile?.email) {
        console.log("Sending email notification to:", assigneeProfile.email);
        await sendTaskAssignmentEmail(
          assigneeProfile.email,
          newAssignee,
          "Aseo General",
          "cleaning"
        );
        console.log("Email notification sent successfully");
        toast.success(`Se ha notificado a ${newAssignee} por correo electrónico`);
      } else {
        console.log("No email found for assignee:", newAssignee);
      }

      // Reset all tasks when changing assignee
      await resetTasksAndProgress(tasks, setTasks);
      
      onAssigneeChange(newAssignee);
      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast.error("Error al enviar la notificación por correo electrónico");
      // Still update the assignee even if email fails
      onAssigneeChange(newAssignee);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Asignar responsable</h3>
      <Select onValueChange={handleAssigneeChange} value={currentAssignee}>
        <SelectTrigger className="w-full">
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
  );
};

export default AssigneeSelector;