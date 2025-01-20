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
  const [hasShownMessage, setHasShownMessage] = useState(false);

  // Reiniciar el estado cuando cambia el responsable
  useEffect(() => {
    setPreviousPercentage(0);
    setLastCompletionMessageTime(0);
    setHasShownMessage(false);
  }, [currentAssignee]);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const percentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Mostrar mensaje de completitud solo cuando se cruza el umbral del 75% hacia arriba,
    // no se ha mostrado el mensaje antes, y ha pasado al menos un minuto desde el último mensaje
    const currentTime = Date.now();
    if (percentage >= 75 && previousPercentage < 75 && !hasShownMessage && (currentTime - lastCompletionMessageTime) > 60000) {
      toast.success("¡Has completado suficientes tareas para finalizar el aseo general!");
      setLastCompletionMessageTime(currentTime);
      setHasShownMessage(true);
    }

    // Si el porcentaje baja de 75%, permitir que se muestre el mensaje nuevamente
    if (percentage < 75) {
      setHasShownMessage(false);
    }
    
    setPreviousPercentage(percentage);
  }, [tasks, lastCompletionMessageTime, previousPercentage, hasShownMessage]);
};