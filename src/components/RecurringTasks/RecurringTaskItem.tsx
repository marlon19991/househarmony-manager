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
import { Calendar, Trash2, Pencil, Clock } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { RecurringTaskForm } from "./RecurringTaskForm";

interface RecurringTaskItemProps {
  task: any;
  onDelete: (id: number) => void;
  onUpdate: (id: number, task: any) => void;
}

export const RecurringTaskItem = ({ task, onDelete, onUpdate }: RecurringTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedTask: any) => {
    onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };

  const getRecurrenceText = () => {
    switch (task.recurrenceType) {
      case "specific": {
        const date = task.day ? new Date(task.day) : null;
        if (!date || !isValid(date)) return "Fecha inválida";
        return format(date, "EEEE", { locale: es });
      }
      case "weekly":
        if (!task.selectedDays || task.selectedDays.length === 0) return "";
        
        const weekdays = {
          monday: "Lunes",
          tuesday: "Martes",
          wednesday: "Miércoles",
          thursday: "Jueves",
          friday: "Viernes",
          saturday: "Sábado",
          sunday: "Domingo",
        };

        const selectedDayNames = task.selectedDays
          .map((day: string) => weekdays[day as keyof typeof weekdays])
          .sort((a: string, b: string) => {
            const order = Object.values(weekdays);
            return order.indexOf(a) - order.indexOf(b);
          });

        if (selectedDayNames.length === 1) {
          return `Cada ${selectedDayNames[0]}`;
        } else if (selectedDayNames.length === 2) {
          return `Cada ${selectedDayNames[0]} y ${selectedDayNames[1]}`;
        } else {
          const lastDay = selectedDayNames.pop();
          return `Cada ${selectedDayNames.join(", ")} y ${lastDay}`;
        }
      case "workdays":
        return "Lunes a viernes";
      default:
        return "";
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4">
        <RecurringTaskForm
          initialTask={task}
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
            <p className="text-sm text-muted-foreground">
              {getRecurrenceText()}
              {task.time && (
                <span className="flex items-center ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.time}
                </span>
              )}
            </p>
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