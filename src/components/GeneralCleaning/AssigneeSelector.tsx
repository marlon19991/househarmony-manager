import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import useProfiles from "@/hooks/useProfiles";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { supabase } from "@/integrations/supabase/client";

interface AssigneeSelectorProps {
  currentAssignee: string;
  onAssigneeChange: (newAssignee: string) => void;
  completionPercentage: number;
}

const AssigneeSelector = ({ currentAssignee, onAssigneeChange, completionPercentage }: AssigneeSelectorProps) => {
  const { profiles } = useProfiles();

  const handleAssigneeChange = async (newAssignee: string) => {
    if (newAssignee === currentAssignee) return;

    // Validar que el porcentaje de completitud sea al menos 75%
    if (completionPercentage < 75) {
      toast.error("Debes completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }

    console.log('Iniciando cambio de responsable:', { 
      anteriorResponsable: currentAssignee, 
      nuevoResponsable: newAssignee 
    });

    try {
      // 1. Delete existing progress for the new assignee
      const { error: deleteError } = await supabase
        .from('general_cleaning_progress')
        .delete()
        .eq('assignee', newAssignee);

      if (deleteError) {
        console.error('Error deleting existing progress:', deleteError);
        toast.error("Error al actualizar el progreso");
        return;
      }

      // 2. Insert new progress
      const { error: insertError } = await supabase
        .from('general_cleaning_progress')
        .insert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting new progress:', insertError);
        toast.error("Error al actualizar el progreso");
        return;
      }

      // 3. Obtener todas las tareas existentes
      const { data: tasks, error: tasksQueryError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksQueryError) {
        console.error('Error querying tasks:', tasksQueryError);
        toast.error("Error al obtener las tareas");
        return;
      }

      // 4. Resetear todas las tareas a no completadas
      if (tasks && tasks.length > 0) {
        const taskStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          updated_at: new Date().toISOString()
        }));

        const { error: tasksError } = await supabase
          .from('cleaning_task_states')
          .upsert(taskStates, {
            onConflict: 'task_id'
          });

        if (tasksError) {
          console.error('Error resetting tasks:', tasksError);
          toast.error("Error al reiniciar las tareas");
          return;
        }
      }

      // 5. Notificar al nuevo responsable por correo
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

      // 6. Actualizar el estado en la UI y mostrar notificación
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