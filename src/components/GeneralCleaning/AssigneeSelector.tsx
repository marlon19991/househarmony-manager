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
  
    try {
      // Primero actualizamos el responsable
      onAssigneeChange(newAssignee);

      // Delete all existing task states for the tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');
  
      if (tasksError) throw tasksError;
  
      if (tasks && tasks.length > 0) {
        // Delete all existing states
        const { error: deleteError } = await supabase
          .from('cleaning_task_states')
          .delete()
          .in('task_id', tasks.map(task => task.id));
  
        if (deleteError) throw deleteError;
  
        // Create new uncompleted states for all tasks
        const newStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
  
        const { error: insertError } = await supabase
          .from('cleaning_task_states')
          .insert(newStates);
  
        if (insertError) throw insertError;
      }
  
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