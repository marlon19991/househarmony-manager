import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";
import { useTaskNotifications } from "./TaskNotifications";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import TaskListHeader from "./components/TaskListHeader";
import TaskListContent from "./components/TaskListContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskData } from "./hooks/useTaskData";
import { useTaskOperations } from "./hooks/useTaskOperations";
import { Task } from "./types/Task";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

interface TaskListProps {
  tasks: Task[];
  currentAssignee: string;
  onTaskToggle: (taskId: number) => void;
  onAddTask: (e: React.FormEvent) => Promise<void>;
  onUpdateTask: (taskId: number, description: string, comment: string) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  newTask: { title: string; comment: string };
  setNewTask: React.Dispatch<React.SetStateAction<{ title: string; comment: string }>>;
  isDisabled: boolean;
}

const TaskList = ({
  tasks,
  currentAssignee,
  onTaskToggle,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  newTask,
  setNewTask,
  isDisabled
}: TaskListProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const { profiles } = useProfiles();
  const { isLoading } = useTaskData();

  useTaskNotifications({ tasks, currentAssignee });

  const handleStartEditing = (taskId: number) => {
    setEditingTaskId(taskId);
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = async (description: string, comment: string) => {
    if (editingTaskId === null) return;
    await onUpdateTask(editingTaskId, description, comment);
    setEditingTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskListHeader
        currentAssignee={currentAssignee}
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={onAddTask}
        isDisabled={isDisabled}
      />
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isEditing={editingTaskId === task.id}
            onToggle={() => onTaskToggle(task.id)}
            onStartEditing={() => handleStartEditing(task.id)}
            onCancelEditing={handleCancelEditing}
            onDelete={() => onDeleteTask(task.id)}
            onUpdate={handleUpdateTask}
            isDisabled={isDisabled}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;