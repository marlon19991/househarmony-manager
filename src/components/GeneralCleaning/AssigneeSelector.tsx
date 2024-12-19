import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { useTaskPersistence } from "./hooks/useTaskPersistence";
import { useAssigneeReset } from "./hooks/useAssigneeReset";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
}

const AssigneeSelector = ({ currentAssignee, onAssigneeChange, completionPercentage }: AssigneeSelectorProps) => {
  const { profiles } = useProfiles();
  const { tasks, setTasks } = useTaskPersistence(currentAssignee);
  const { resetTaskStates, resetProgress } = useAssigneeReset();

  const handleAssigneeChange = async (newAssignee: string) => {
    try {
      // Notificar al nuevo responsable por correo electrónico
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
          toast.success(`Se ha notificado a ${newAssignee} por correo electrónico`);
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
        }
      }

      // Resetear estados de las tareas
      const taskResetSuccess = await resetTaskStates(tasks);
      if (!taskResetSuccess) {
        toast.error("Error al reiniciar las tareas");
        return;
      }

      // Resetear el progreso
      const progressResetSuccess = await resetProgress(newAssignee);
      if (!progressResetSuccess) {
        toast.error("Error al actualizar el progreso");
        return;
      }

      // Actualizar el estado local de las tareas
      setTasks(tasks.map(task => ({ ...task, completed: false })));
      
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