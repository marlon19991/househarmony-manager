import { Card } from "@/components/ui/card";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import ProgressDisplay from "./components/ProgressDisplay";
import { useCleaningProgress } from "./hooks/useCleaningProgress";
import { useTaskData } from "./hooks/useTaskData";

const GeneralCleaningSection = () => {
  const {
    currentAssignee,
    completionPercentage,
    setCurrentAssignee,
    setCompletionPercentage,
    updateProgress,
    loadProgress
  } = useCleaningProgress();

  const { resetAllTasks, loadTasks } = useTaskData();

  const handleAssigneeChange = async (newAssignee: string) => {
    try {
      console.log('Changing assignee to:', newAssignee);
      
      // First update the progress
      await updateProgress(newAssignee, 0);
      
      // Then reset all tasks
      await resetAllTasks();
      
      // Update local state
      setCurrentAssignee(newAssignee);
      setCompletionPercentage(0);
      
      // Reload data
      await loadProgress();
      await loadTasks();
      
      console.log('Assignee change completed successfully');
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error("Error al cambiar el responsable");
    }
  };

  // Si currentAssignee es null, mostrar un estado de carga
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