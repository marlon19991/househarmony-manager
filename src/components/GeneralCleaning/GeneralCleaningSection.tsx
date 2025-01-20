import { Card } from "@/components/ui/card";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import ProgressDisplay from "./components/ProgressDisplay";
import { useGeneralCleaning } from "./hooks/useGeneralCleaning";

const GeneralCleaningSection = () => {
  const {
    tasks,
    currentAssignee,
    completionPercentage,
    isLoading,
    updateTaskState,
    changeAssignee,
    addTask
  } = useGeneralCleaning();

  if (isLoading || currentAssignee === null) {
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
          tasks={tasks}
          currentAssignee={currentAssignee}
          onTaskStateChange={updateTaskState}
          addTask={addTask}
          isDisabled={currentAssignee === "Sin asignar"}
        />
        <AssigneeSelector
          currentAssignee={currentAssignee}
          onAssigneeChange={changeAssignee}
          completionPercentage={completionPercentage}
        />
      </div>
    </Card>
  );
};

export default GeneralCleaningSection;