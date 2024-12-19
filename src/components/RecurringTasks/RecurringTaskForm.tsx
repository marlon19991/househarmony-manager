import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import useProfiles from "@/hooks/useProfiles";

interface RecurringTaskFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    selectedAssignees: string[];
  };
}

export const RecurringTaskForm = ({ onSubmit, onCancel, initialData }: RecurringTaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [selectedAssignees, setSelectedAssignees] = useState(initialData?.selectedAssignees || []);
  const { profiles } = useProfiles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Logic to create or update the recurring task in the database
      const { data, error } = await supabase.from('recurring_tasks').upsert({
        title,
        assignees: selectedAssignees,
      });

      if (error) throw error;

      // Send email to each assignee
      for (const assigneeName of selectedAssignees) {
        const assignee = profiles.find(p => p.name === assigneeName);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(
            assignee.email,
            assigneeName,
            title,
            "recurring"
          );
        }
      }

      onSubmit();
      toast.success(initialData ? "Tarea actualizada" : "Tarea creada");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al guardar la tarea");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="taskTitle" className="block text-sm font-medium">Título de la tarea</label>
        <input
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Asignar a</label>
        <select
          multiple
          value={selectedAssignees}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedAssignees(options);
          }}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          {profiles.map(profile => (
            <option key={profile.id} value={profile.name}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onCancel} className="mr-2 bg-gray-300 text-white rounded-md px-4 py-2">Cancelar</button>
        <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2">Guardar</button>
      </div>
    </form>
  );
};
