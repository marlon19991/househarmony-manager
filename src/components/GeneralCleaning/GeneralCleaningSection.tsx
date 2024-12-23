import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import ProgressDisplay from "./components/ProgressDisplay";
import { useTaskState } from "./hooks/useTaskState";
import { useProgressState } from "./hooks/useProgressState";

const GeneralCleaningSection = () => {
  const { resetTaskStates } = useTaskState();
  const { 
    currentAssignee,
    completionPercentage,
    updateProgress
  } = useProgressState();

  const handleAssigneeChange = async (newAssignee: string) => {
    try {
      console.log('Changing assignee to:', newAssignee);
      
      // Primero actualizamos el progreso
      await updateProgress(newAssignee, 0);
      
      // Luego reiniciamos todas las tareas
      await resetTaskStates();
      
      console.log('Assignee change completed successfully');
      toast.success(`Se ha asignado el aseo general a ${newAssignee}`);
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error("Error al cambiar el responsable");
    }
  };

  if (currentAssignee === null) {
    return (
      <Card className="p-6 space-y-6">
        <div>Cargando...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <ProgressDisplay completionPercentage={completionPercentage} />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <TaskList
          currentAssignee={currentAssignee}
          onTaskComplete={(percentage) => {
            const roundedPercentage = Math.round(percentage);
            updateProgress(currentAssignee, roundedPercentage);
          }}
          isDisabled={currentAssignee === "Sin asignar"}
        />
        <AssigneeSelector
          currentAssignee={currentAssignee}
          onAssigneeChange={handleAssigneeChange}
          completionPercentage={completionPercentage}
        />
      </div>
    </Card>
  );
};

export default GeneralCleaningSection;