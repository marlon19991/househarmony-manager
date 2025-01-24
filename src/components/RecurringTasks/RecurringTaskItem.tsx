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
import { cn } from "@/lib/utils";

interface RecurringTaskItemProps {
  task: {
    id: number;
    title: string;
    description?: string;
    weekdays?: boolean[];
    start_date?: string;
    end_date?: string;
    assignees?: string[];
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
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const selectedDays = weekdays
      .map((selected, index) => selected ? days[index] : null)
      .filter(Boolean);
    
    if (selectedDays.length === 0) return "";
    if (selectedDays.length === 1) return `Cada ${selectedDays[0]}`;
    
    const lastDay = selectedDays.pop();
    return `Cada ${selectedDays.join(", ")} y ${lastDay}`;
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
    if (!task.assignees || task.assignees.length === 0) return null;
    
    if (task.assignees.length <= 4) {
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
    <Card className="p-3 hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground/70">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">{getScheduleText()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground/70">
            {task.notification_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{task.notification_time}</span>
              </div>
            )}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[150px]">{getAssigneesText()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};