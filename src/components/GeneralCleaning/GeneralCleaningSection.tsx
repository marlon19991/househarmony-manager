import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";

const GeneralCleaningSection = () => {
  const [currentAssignee, setCurrentAssignee] = useState("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { profiles } = useProfiles();

  useEffect(() => {
    const loadSavedAssignee = async () => {
      try {
        // Cargar el último asignado y su progreso desde la base de datos
        const { data: progressData, error } = await supabase
          .from('general_cleaning_progress')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading progress:', error);
          toast.error("Error al cargar el progreso");
          return;
        }

        if (progressData) {
          // Verificar si el asignado guardado aún existe en los perfiles
          const assigneeExists = progressData.assignee === "Sin asignar" || 
                               profiles.some(profile => profile.name === progressData.assignee);
          
          if (!assigneeExists) {
            setCurrentAssignee("Sin asignar");
            setCompletionPercentage(0);
            return;
          }

          setCurrentAssignee(progressData.assignee);
          setCompletionPercentage(progressData.completion_percentage || 0);
        }
      } catch (error) {
        console.error('Error in loadSavedAssignee:', error);
        toast.error("Error al cargar el progreso guardado");
      }
    };

    loadSavedAssignee();
  }, [profiles]);

  const handleAssigneeChange = async (newAssignee: string) => {
    setCurrentAssignee(newAssignee);
    
    try {
      // Update progress in database
      const { error } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: newAssignee === "Sin asignar" ? 0 : completionPercentage,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      if (newAssignee === "Sin asignar") {
        setCompletionPercentage(0);
      } else {
        // Load existing progress for the new assignee
        const { data: progressData, error: progressError } = await supabase
          .from('general_cleaning_progress')
          .select('completion_percentage')
          .eq('assignee', newAssignee)
          .maybeSingle();

        if (progressError) throw progressError;

        const percentage = Math.round(progressData?.completion_percentage ?? 0);
        setCompletionPercentage(percentage);
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error("Error al actualizar el responsable");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Aseo General</h2>
        <Progress value={completionPercentage} className="w-full" />
        <p className="text-sm text-gray-500">
          Progreso: {completionPercentage.toFixed(0)}%
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <TaskList
          currentAssignee={currentAssignee}
          onTaskComplete={(percentage) => {
            const roundedPercentage = Math.round(percentage);
            setCompletionPercentage(roundedPercentage);
          }}
          onAssigneeChange={handleAssigneeChange}
          isDisabled={currentAssignee === "Sin asignar"}
        />
        <AssigneeSelector
          currentAssignee={currentAssignee}
          onAssigneeChange={handleAssigneeChange}
          completionPercentage={completionPercentage}
        />
      </div>
    </Card>
  );
};

export default GeneralCleaningSection;