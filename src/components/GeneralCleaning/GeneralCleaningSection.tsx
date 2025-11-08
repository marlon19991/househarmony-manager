import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import ProgressDisplay from "./components/ProgressDisplay";
import { useGeneralCleaning } from "./hooks/useGeneralCleaning";
import { useCleaningProgress } from "./hooks/useCleaningProgress";

export const GeneralCleaningSection = () => {
  const {
    tasks,
    currentAssignee,
    completionPercentage,
    isLoading,
    updateTaskState,
    changeAssignee,
    addTask,
    updateTask,
    deleteTask
  } = useGeneralCleaning();

  const [newTask, setNewTask] = useState({ title: "", comment: "" });

  const handleTaskToggle = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTaskState(taskId, !task.completed);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const success = await addTask(newTask.title, newTask.comment);
    if (success) {
      setNewTask({ title: "", comment: "" });
    }
  };

  const handleUpdateTask = async (taskId: number, description: string, comment: string) => {
    await updateTask(taskId, description, comment);
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
  };

  if (isLoading || currentAssignee === null) {
    return (
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <ProgressDisplay completionPercentage={completionPercentage} />
          <div className="w-full max-w-sm">
            <AssigneeSelector
              currentAssignee={currentAssignee}
              onAssigneeChange={changeAssignee}
              completionPercentage={completionPercentage}
            />
          </div>
        </div>
        <TaskList
          tasks={tasks}
          currentAssignee={currentAssignee}
          onTaskToggle={handleTaskToggle}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          newTask={newTask}
          setNewTask={setNewTask}
          isDisabled={false}
        />
      </div>
    </Card>
  );
};

export default GeneralCleaningSection;
