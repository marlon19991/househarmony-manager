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
    console.log('Iniciando cambio de responsable:', { 
      anteriorResponsable: currentAssignee, 
      nuevoResponsable: newAssignee 
    });

    try {
      // 1. Verificar estado actual antes del reseteo
      const { data: currentTasks, error: checkError } = await supabase
        .from('cleaning_task_states')
        .select('*');

      if (checkError) {
        console.error('Error checking current tasks:', checkError);
      } else {
        console.log('Estado actual de las tareas:', currentTasks);
      }

      // 2. Resetear el progreso a 0%
      const { data: progressData, error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        })
        .select();

      if (progressError) {
        console.error('Error resetting progress:', progressError);
        toast.error("Error al actualizar el progreso");
        return;
      }
      console.log('Progreso reseteado:', progressData);

      // 3. Obtener IDs de todas las tareas completadas
      const { data: completedTasks, error: completedError } = await supabase
        .from('cleaning_task_states')
        .select('task_id')
        .eq('completed', true);

      if (completedError) {
        console.error('Error getting completed tasks:', completedError);
        return;
      }

      if (completedTasks && completedTasks.length > 0) {
        // 4. Resetear solo las tareas que estaban completadas
        const taskIds = completedTasks.map(task => task.task_id);
        const { error: tasksError } = await supabase
          .from('cleaning_task_states')
          .update({ 
            completed: false,
            updated_at: new Date().toISOString()
          })
          .in('task_id', taskIds);

        if (tasksError) {
          console.error('Error resetting tasks:', tasksError);
          toast.error("Error al reiniciar las tareas");
          return;
        }
      }

      // 5. Verificar estado después del reseteo
      const { data: finalTasks, error: finalCheckError } = await supabase
        .from('cleaning_task_states')
        .select('*');

      if (finalCheckError) {
        console.error('Error checking final state:', finalCheckError);
      } else {
        console.log('Estado final de las tareas:', finalTasks);
      }

      // 6. Notificar al nuevo responsable por correo
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

      // 7. Actualizar el estado en la UI
      onAssigneeChange(newAssignee);
      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
      
      // 8. Forzar recarga de la página para asegurar actualización de UI
      window.location.reload();
      
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