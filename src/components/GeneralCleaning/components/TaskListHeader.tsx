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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
      <div className="text-base sm:text-lg font-semibold">
        <span className="text-muted-foreground">Responsable actual:</span>{" "}
        <span className="font-medium">{currentAssignee}</span>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" disabled={isDisabled} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Tarea
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva Tarea</SheetTitle>
            <SheetDescription>
              Agrega una nueva tarea a la lista de limpieza general
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
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