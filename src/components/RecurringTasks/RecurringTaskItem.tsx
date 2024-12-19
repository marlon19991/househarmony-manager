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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <span>{getScheduleText()}</span>
              {task.notification_time && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.notification_time}
                </span>
              )}
              {task.assignees && task.assignees.length > 0 && (
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {getAssigneesText()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
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
                <AlertDialogAction onClick={() => onDelete(task.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};