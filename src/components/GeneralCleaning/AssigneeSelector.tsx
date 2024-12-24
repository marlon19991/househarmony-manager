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

    if (completionPercentage < 75) {
      toast.error("Debes completar al menos el 75% de las tareas antes de cambiar el responsable");
      return;
    }

    console.log('Iniciando cambio de responsable:', { 
      anteriorResponsable: currentAssignee, 
      nuevoResponsable: newAssignee 
    });

    try {
      // Primero, reiniciar todos los estados de las tareas
      const { data: tasks, error: tasksQueryError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksQueryError) {
        console.error('Error al obtener las tareas:', tasksQueryError);
        toast.error("Error al obtener las tareas");
        return;
      }

      if (tasks && tasks.length > 0) {
        // Crear nuevos estados para todas las tareas
        const taskStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          updated_at: new Date().toISOString()
        }));

        // Eliminar estados anteriores y crear nuevos
        const { error: deleteError } = await supabase
          .from('cleaning_task_states')
          .delete()
          .in('task_id', tasks.map(t => t.id));

        if (deleteError) {
          console.error('Error al eliminar estados de tareas:', deleteError);
          toast.error("Error al reiniciar las tareas");
          return;
        }

        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert(taskStates);

        if (insertError) {
          console.error('Error al crear nuevos estados de tareas:', insertError);
          toast.error("Error al reiniciar las tareas");
          return;
        }
      }

      // Actualizar el progreso para el nuevo asignado
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (progressError) {
        console.error('Error al actualizar el progreso:', progressError);
        toast.error("Error al actualizar el progreso");
        return;
      }

      // Notificar al nuevo asignado
      const assigneeProfile = profiles.find(p => p.name === newAssignee);
      if (assigneeProfile?.email) {
        try {
          await sendTaskAssignmentEmail(
            assigneeProfile.email,
            newAssignee,
            "Aseo General",
            "cleaning"
          );
          console.log("Notificación por correo enviada exitosamente");
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