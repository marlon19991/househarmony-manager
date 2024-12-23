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