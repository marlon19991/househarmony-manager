import React from "react";
import TaskItem from "../TaskItem";
import { Task } from "../types/Task";

interface TaskListContentProps {
  tasks: Task[];
  editingTask: number | null;
  onTaskToggle: (taskId: number) => Promise<void>;
  onUpdateTask: (taskId: number, newDescription: string, newComment: string) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  setEditingTask: React.Dispatch<React.SetStateAction<number | null>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  isDisabled: boolean;
}

const TaskListContent = ({
  tasks,
  editingTask,
  onTaskToggle,
  onUpdateTask,
  onDeleteTask,
  setEditingTask,
  setTasks,
  isDisabled,
}: TaskListContentProps) => {
  // Calcular el porcentaje de tareas completadas
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Mostrar mensaje cuando se alcanza el 75%
  if (completionPercentage >= 75 && completionPercentage < 100) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-md text-green-700">
          ¡Has completado suficientes tareas! Puedes cambiar el responsable si lo deseas.
        </div>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              editingTask={editingTask}
              onTaskToggle={onTaskToggle}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              setEditingTask={setEditingTask}
              setTasks={setTasks}
              tasks={tasks}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          editingTask={editingTask}
          onTaskToggle={onTaskToggle}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          setEditingTask={setEditingTask}
          setTasks={setTasks}
          tasks={tasks}
          isDisabled={isDisabled}
        />
      ))}
    </div>
  );
};

export default TaskListContent;