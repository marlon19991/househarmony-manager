import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { supabase } from "@/integrations/supabase/client";
import { taskService } from "./services/taskService";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
  onTasksReset: () => Promise<void>;
}

const AssigneeSelector = ({ 
  currentAssignee, 
  onAssigneeChange, 
  completionPercentage,
  onTasksReset 
}: AssigneeSelectorProps) => {
  const { profiles } = useProfiles();

  const handleAssigneeChange = async (newAssignee: string) => {
    if (newAssignee === currentAssignee) return;

    if (completionPercentage < 75) {
      toast.error("Debes completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }

    console.log('Iniciando cambio de responsable:', { 
      anteriorResponsable: currentAssignee, 
      nuevoResponsable: newAssignee 
    });

    try {
      // Reiniciar estados de tareas
      await taskService.resetTaskStates();
      await onTasksReset();

      // Actualizar progreso para nuevo responsable
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (progressError) throw progressError;

      // Notificar al nuevo responsable
      const assigneeProfile = profiles.find(p => p.name === newAssignee);
      if (assigneeProfile?.email) {
        try {
          await sendTaskAssignmentEmail(
            assigneeProfile.email,
            newAssignee,
            "Se te ha asignado el Aseo General",
            "cleaning"
          );
        } catch (emailError) {
          console.error("Error al enviar notificación por correo:", emailError);
        }
      }

      onAssigneeChange(newAssignee);
      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
      
    } catch (error) {
      console.error("Error al actualizar el responsable:", error);
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