import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useTaskData } from "./hooks/useTaskData";
import { progressService } from "./services/progressService";
import { taskStateService } from "./services/taskStateService";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
}

const AssigneeSelector = ({ currentAssignee, onAssigneeChange, completionPercentage }: AssigneeSelectorProps) => {
  const { profiles } = useProfiles();
  const { resetAllTasks } = useTaskData();

  const handleAssigneeChange = async (newAssignee: string) => {
    if (newAssignee === currentAssignee) return;

    if (completionPercentage < 75) {
      toast.error("Debes completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }

    try {
      // First reset all task states in the database
      await taskStateService.resetTaskStates();
      
      // Then update the progress for the new assignee
      await progressService.updateProgress(newAssignee, 0);

      // Reset tasks in the UI
      await resetAllTasks();

      // Notify the new assignee
      const assigneeProfile = profiles.find(p => p.name === newAssignee);
      if (assigneeProfile?.email) {
        try {
          await sendTaskAssignmentEmail(
            assigneeProfile.email,
            newAssignee,
            "Aseo General",
            "cleaning"
          );
          console.log("Email notification sent successfully");
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
        }
      }

      onAssigneeChange(newAssignee);
      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
      
    } catch (error) {
      console.error("Error updating assignee:", error);
      toast.error("Error al actualizar el responsable");
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
          {profiles.filter(profile => profile.name !== "Sin asignar").map((profile) => (
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