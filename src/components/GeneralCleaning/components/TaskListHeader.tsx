import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TaskForm from "../TaskForm";

interface TaskListHeaderProps {
  currentAssignee: string;
  newTask: { title: string; comment: string };
  setNewTask: React.Dispatch<React.SetStateAction<{ title: string; comment: string }>>;
  onAddTask: (e: React.FormEvent) => Promise<void>;
  isDisabled: boolean;
}

const TaskListHeader = ({ 
  currentAssignee, 
  newTask, 
  setNewTask,
  onAddTask,
  isDisabled
}: TaskListHeaderProps) => {
  const hasNoAssignee = currentAssignee === "Sin asignar";
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
      <div className="text-base sm:text-lg font-semibold">
        <span className="text-muted-foreground">Responsable actual:</span>{" "}
        <span className="font-medium">{currentAssignee}</span>
        {hasNoAssignee && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            ⚠️ Asigna un responsable antes de agregar tareas para un mejor seguimiento
          </div>
        )}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Tarea
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva Tarea</SheetTitle>
            <SheetDescription>
              {hasNoAssignee 
                ? "Agrega una nueva tarea. Recuerda asignar un responsable arriba para un mejor seguimiento."
                : "Agrega una nueva tarea a la lista de limpieza general"
              }
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {hasNoAssignee && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ℹ️ No hay responsable asignado. Puedes agregar la tarea ahora y asignar un responsable después.
                </p>
              </div>
            )}
            <TaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              onSubmit={onAddTask}
              isDisabled={isDisabled}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskListHeader;