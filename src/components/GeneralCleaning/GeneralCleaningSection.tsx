import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";

const GeneralCleaningSection = () => {
  const [currentAssignee, setCurrentAssignee] = useState("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const handleAssigneeChange = (newAssignee: string) => {
    setCurrentAssignee(newAssignee);
    setCompletionPercentage(0); // Reset completion when assignee changes
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Aseo General</h2>
        <Progress value={completionPercentage} className="w-full" />
        <p className="text-sm text-gray-500">
          Progreso: {completionPercentage.toFixed(0)}%
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <TaskList
          currentAssignee={currentAssignee}
          onTaskComplete={setCompletionPercentage}
          onAssigneeChange={handleAssigneeChange}
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