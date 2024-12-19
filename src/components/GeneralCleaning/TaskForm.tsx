import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import useProfiles from "@/hooks/useProfiles";
import { toast } from "sonner";

interface TaskFormProps {
  newTask: { title: string; comment: string };
  setNewTask: (task: { title: string; comment: string }) => void;
  onAddTask: (e: React.FormEvent) => void;
}

const TaskForm = ({ newTask, setNewTask, onAddTask }: TaskFormProps) => {
  const { profiles } = useProfiles();
  const [currentAssignee, setCurrentAssignee] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Notify assignee if one is selected
      if (currentAssignee) {
        const assignee = profiles.find(p => p.name === currentAssignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            currentAssignee,
            newTask.title,
            "cleaning"
          );
        }
      }

      onAddTask(e);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al crear la tarea");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="taskTitle">Nueva Tarea</Label>
        <Input
          id="taskTitle"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Título de la tarea"
        />
      </div>
      <div>
        <Label htmlFor="taskComment">Comentario</Label>
        <Textarea
          id="taskComment"
          value={newTask.comment}
          onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
          placeholder="Comentario sobre la tarea"
        />
      </div>
      <div>
        <Label htmlFor="taskAssignee">Asignar a</Label>
        <select
          id="taskAssignee"
          value={currentAssignee}
          onChange={(e) => setCurrentAssignee(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Seleccionar responsable</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.name}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full">
        Agregar Tarea
      </Button>
    </form>
  );
};

export default TaskForm;