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
  onTaskStateChange: (taskId: number, completed: boolean) => Promise<boolean>;
  addTask: (description: string, comment: string) => Promise<boolean>;
  isDisabled: boolean;
}

const TaskList = ({
  tasks,
  currentAssignee,
  onTaskStateChange,
  addTask,
  isDisabled
}: TaskListProps) => {
  const [newTask, setNewTask] = useState({ title: "", comment: "" });
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const { profiles } = useProfiles();
  const { isLoading } = useTaskData();

  useTaskNotifications({ tasks, currentAssignee });

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    if (isDisabled) return;
    await onTaskStateChange(taskId, !completed);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const success = await addTask(newTask.title, newTask.comment);
    if (success) {
      setNewTask({ title: "", comment: "" });
    }
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
    <div className="space-y-4">
      <TaskListHeader
        currentAssignee={currentAssignee}
        newTask={newTask}
        setNewTask={setNewTask}
        onAddTask={handleAddTask}
        isDisabled={isDisabled}
      />
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isEditing={editingTask === task.id}
            onToggle={() => handleTaskToggle(task.id, task.completed)}
            onStartEditing={() => setEditingTask(task.id)}
            onCancelEditing={() => setEditingTask(null)}
            isDisabled={isDisabled}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;