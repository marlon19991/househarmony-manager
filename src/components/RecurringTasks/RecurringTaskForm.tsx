import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendTaskAssignmentEmail } from "@/utils/emailUtils";
import { AssigneeField } from "./FormFields/AssigneeField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RecurringTaskFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    selectedAssignees: string[];
    recurrence_type: string;
    selected_days?: string[];
    specific_day?: string;
    time?: string;
    icon?: string;
  };
}

export const RecurringTaskForm = ({ onSubmit, onCancel, initialData }: RecurringTaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [selectedAssignees, setSelectedAssignees] = useState(initialData?.selectedAssignees || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.from('recurring_tasks').upsert({
        title,
        assignees: selectedAssignees,
        recurrence_type: initialData?.recurrence_type || 'weekly',
        selected_days: initialData?.selected_days || [],
        specific_day: initialData?.specific_day,
        time: initialData?.time,
        icon: initialData?.icon || '📋'
      });

      if (error) throw error;

      // Send email to each assignee
      for (const assigneeName of selectedAssignees) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .eq('name', assigneeName)
          .single();

        if (profiles?.email) {
          await sendTaskAssignmentEmail(
            profiles.email,
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
        <Label htmlFor="taskTitle">Título de la tarea</Label>
        <Input
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea"
        />
      </div>
      
      <AssigneeField
        selectedAssignees={selectedAssignees}
        onChange={setSelectedAssignees}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};