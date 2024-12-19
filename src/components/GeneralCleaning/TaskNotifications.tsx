import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Task } from "./types/Task";

interface TaskNotificationsProps {
  tasks: Task[];
  currentAssignee: string;
}

export const useTaskNotifications = ({ tasks, currentAssignee }: TaskNotificationsProps) => {
  const [previousPercentage, setPreviousPercentage] = useState(0);
  const [lastCompletionMessageTime, setLastCompletionMessageTime] = useState(0);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const percentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Only show completion message when crossing 75% threshold upwards and if it hasn't been shown in the last minute
    const currentTime = Date.now();
    if (percentage >= 75 && previousPercentage < 75 && (currentTime - lastCompletionMessageTime) > 60000) {
      toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
      setLastCompletionMessageTime(currentTime);
    }
    
    setPreviousPercentage(percentage);
  }, [tasks, lastCompletionMessageTime, previousPercentage]);
};