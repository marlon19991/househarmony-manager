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
    <div className="flex items-center justify-between">
      <div className="text-lg font-semibold">
        Responsable actual: {currentAssignee}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" disabled={isDisabled}>
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