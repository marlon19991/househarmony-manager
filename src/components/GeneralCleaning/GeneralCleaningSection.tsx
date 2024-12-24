import { Card } from "@/components/ui/card";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import ProgressDisplay from "./components/ProgressDisplay";
import { useCleaningProgress } from "./hooks/useCleaningProgress";

const GeneralCleaningSection = () => {
  const {
    currentAssignee,
    completionPercentage,
    setCurrentAssignee,
    setCompletionPercentage,
    updateProgress
  } = useCleaningProgress();

  const handleAssigneeChange = async (newAssignee: string) => {
    try {
      console.log('Cambiando responsable a:', newAssignee);
      await updateProgress(newAssignee, 0);
      setCurrentAssignee(newAssignee);
      setCompletionPercentage(0);
    } catch (error) {
      console.error('Error al actualizar responsable:', error);
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
            setCompletionPercentage(roundedPercentage);
          }}
          onAssigneeChange={handleAssigneeChange}
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