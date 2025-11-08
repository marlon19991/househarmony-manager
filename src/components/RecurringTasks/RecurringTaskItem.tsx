import { memo, useMemo, useState } from "react";
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
import type { RecurringTask, RecurringTaskPayload } from "./hooks/useRecurringTasks";

interface RecurringTaskItemProps {
  task: RecurringTask;
  onDelete: (id: number) => void;
  onUpdate: (id: number, task: RecurringTaskPayload) => void;
}

const RecurringTaskItemComponent = ({ task, onDelete, onUpdate }: RecurringTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedTask: RecurringTaskPayload) => {
    onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };

  const weekdaysText = useMemo(() => {
    if (!task.weekdays) return "";
    if (task.weekdays.every((day) => day)) {
      return "Todos los días";
    }
    if (
      task.weekdays[1] &&
      task.weekdays[2] &&
      task.weekdays[3] &&
      task.weekdays[4] &&
      task.weekdays[5] &&
      !task.weekdays[0] &&
      !task.weekdays[6]
    ) {
      return "De lunes a viernes";
    }

    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const selectedDays = task.weekdays
      .map((selected, index) => (selected ? days[index] : null))
      .filter(Boolean) as string[];

    if (!selectedDays.length) return "";
    if (selectedDays.length === 1) return `Cada ${selectedDays[0]}`;
    const lastDay = selectedDays.pop();
    return `${selectedDays.join(", ")} y ${lastDay}`;
  }, [task.weekdays]);

  const scheduleText = useMemo(() => {
    if (!task.recurrence_type) return "Sin programación";

    switch (task.recurrence_type) {
      case "specific":
        return task.start_date
          ? format(new Date(task.start_date), "PPP", { locale: es })
          : "Fecha no especificada";
      case "workdays":
        return "De lunes a viernes";
      case "weekly":
        return task.weekdays ? weekdaysText : "Sin días seleccionados";
      default:
        return "Sin programación";
    }
  }, [task.recurrence_type, task.start_date, task.weekdays, weekdaysText]);

  const formattedNotificationTime = useMemo(() => {
    if (!task.notification_time) return "";
    return format(new Date(`2000-01-01T${task.notification_time}`), "h:mm a");
  }, [task.notification_time]);

  const assigneesText = useMemo(() => {
    if (!task.assignees || task.assignees.length === 0) return "Sin asignados";
    if (task.assignees.length <= 3) {
      return task.assignees.join(", ");
    }
    return `${task.assignees.length} asignados`;
  }, [task.assignees]);

  if (isEditing) {
    return (
      <Card className="p-4">
        <RecurringTaskForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
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
        />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate mb-2">{task.title}</h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="flex-1 truncate">{scheduleText}</span>
            </div>
            
            {formattedNotificationTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formattedNotificationTime}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="flex-1 truncate">{assigneesText}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                  aria-label="Editar tarea"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar tarea</p>
              </TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea recurrente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="w-full sm:w-auto"
                    onClick={() => onDelete(task.id)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export const RecurringTaskItem = memo(RecurringTaskItemComponent);
RecurringTaskItem.displayName = "RecurringTaskItem";
