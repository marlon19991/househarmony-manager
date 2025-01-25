import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Trash2, Pencil, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RecurringTaskForm } from "./RecurringTaskForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecurringTaskItemProps {
  task: {
    id: number;
    title: string;
    description?: string;
    weekdays?: boolean[];
    start_date?: string;
    end_date?: string;
    assignees?: string[];
    icon?: string;
    recurrence_type?: string;
    notification_time?: string;
  };
  onDelete: (id: number) => void;
  onUpdate: (id: number, task: any) => void;
}

export const RecurringTaskItem = ({ task, onDelete, onUpdate }: RecurringTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = () => {
    setIsEditing(false);
  };

  const getWeekdaysText = (weekdays: boolean[]) => {
    // Si todos los días están seleccionados
    if (weekdays.every(day => day)) {
      return "Todos los días";
    }

    // Si son los días de lunes a viernes
    if (weekdays[1] && weekdays[2] && weekdays[3] && weekdays[4] && weekdays[5] && !weekdays[0] && !weekdays[6]) {
      return "De lunes a viernes";
    }

    // Para otros casos, mostrar los días seleccionados
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const selectedDays = weekdays
      .map((selected, index) => selected ? days[index] : null)
      .filter(Boolean);
    
    if (selectedDays.length === 0) return "";
    if (selectedDays.length === 1) return `Cada ${selectedDays[0]}`;
    
    const lastDay = selectedDays.pop();
    return `${selectedDays.join(", ")} y ${lastDay}`;
  };

  const getScheduleText = () => {
    if (!task.recurrence_type) return "Sin programación";

    switch (task.recurrence_type) {
      case "specific":
        return task.start_date ? format(new Date(task.start_date), "PPP", { locale: es }) : "Fecha no especificada";
      case "workdays":
        return "De lunes a viernes";
      case "weekly":
        return task.weekdays ? getWeekdaysText(task.weekdays) : "Sin días seleccionados";
      default:
        return "Sin programación";
    }
  };

  const getAssigneesText = () => {
    if (!task.assignees || task.assignees.length === 0) return "Sin asignados";
    
    if (task.assignees.length <= 3) {
      return task.assignees.join(", ");
    }
    return `${task.assignees.length} asignados`;
  };

  if (isEditing) {
    return (
      <Card className="p-4">
        <RecurringTaskForm
          initialData={{
            id: task.id,
            title: task.title,
            description: task.description,
            selectedAssignees: task.assignees || [],
            weekdays: task.weekdays,
            start_date: task.start_date ? new Date(task.start_date) : undefined,
            end_date: task.end_date ? new Date(task.end_date) : undefined,
            icon: task.icon,
            recurrence_type: task.recurrence_type,
            notification_time: task.notification_time
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary-foreground hover:bg-primary"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la tarea periódica permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{getScheduleText()}</span>
          </div>
          <div className="flex items-center gap-4">
            {task.notification_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.notification_time}</span>
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <Users className="h-3.5 w-3.5" />
                    <span>{getAssigneesText()}</span>
                  </div>
                </TooltipTrigger>
                {task.assignees && task.assignees.length > 3 && (
                  <TooltipContent>
                    <p>{task.assignees.join(", ")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
};