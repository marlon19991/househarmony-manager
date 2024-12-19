import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useTaskPersistence } from "./hooks/useTaskPersistence";
import { resetTasksAndProgress } from "./utils/taskResetOperations";

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
      
      // Only attempt to send email if the profile has an email address
      if (assigneeProfile?.email) {
        try {
          await sendTaskAssignmentEmail(
            assigneeProfile.email,
            newAssignee,
            "Aseo General",
            "cleaning"
          );
          console.log("Email notification sent successfully");
          toast.success(`Se ha notificado a ${newAssignee} por correo electrónico`);
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
          // Don't show error toast for email failure
        }
      }

      // Reset all tasks and their states in the database
      const resetSuccess = await resetTasksAndProgress(tasks, setTasks);
      
      if (!resetSuccess) {
        toast.error("Error al reiniciar las tareas");
        return;
      }

      // Update progress in database to 0%
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
        toast.error("Error al actualizar el progreso");
        return;
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