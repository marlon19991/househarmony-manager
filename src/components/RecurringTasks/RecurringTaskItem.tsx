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
    weekdays?: boolean[];
    start_date?: string;
    end_date?: string;
    assignees?: string[];
    icon?: string;
  };
  onDelete: (id: number) => void;
  onUpdate: (id: number, task: any) => void;
}

export const RecurringTaskItem = ({ task, onDelete, onUpdate }: RecurringTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = () => {
    setIsEditing(false);
  };

  const getScheduleText = () => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const selectedDays = task.weekdays?.map((selected, index) => selected ? days[index] : null).filter(Boolean);
    
    let scheduleText = "";
    
    if (task.start_date) {
      const startDate = new Date(task.start_date);
      scheduleText += `Desde ${format(startDate, "PPP", { locale: es })}`;
      
      if (task.end_date) {
        const endDate = new Date(task.end_date);
        scheduleText += ` hasta ${format(endDate, "PPP", { locale: es })}`;
      }
    }

    if (selectedDays && selectedDays.length > 0) {
      if (scheduleText) scheduleText += " - ";
      
      if (selectedDays.length === 7) {
        scheduleText += "Todos los días";
      } else {
        scheduleText += selectedDays.join(", ");
      }
    }

    return scheduleText || "Sin programación";
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
            selectedAssignees: task.assignees || [],
            weekdays: task.weekdays,
            start_date: task.start_date ? new Date(task.start_date) : undefined,
            end_date: task.end_date ? new Date(task.end_date) : undefined,
            icon: task.icon
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <span>{getScheduleText()}</span>
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