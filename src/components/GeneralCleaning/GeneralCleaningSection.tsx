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
      const savedAssignee = localStorage.getItem("currentCleaningAssignee");
      
      if (savedAssignee) {
        // Verificar si el asignado guardado aún existe en los perfiles
        const assigneeExists = profiles.some(profile => profile.name === savedAssignee);
        
        if (!assigneeExists) {
          setCurrentAssignee("Sin asignar");
          localStorage.setItem("currentCleaningAssignee", "Sin asignar");
          setCompletionPercentage(0);
          return;
        }

        setCurrentAssignee(savedAssignee);
        
        // Cargar el progreso desde la base de datos
        const { data: progressData, error } = await supabase
          .from('general_cleaning_progress')
          .select('completion_percentage')
          .eq('assignee', savedAssignee)
          .maybeSingle();

        if (error) {
          console.error('Error loading progress:', error);
          toast.error("Error al cargar el progreso");
          return;
        }

        setCompletionPercentage(progressData?.completion_percentage ?? 0);
      }
    };

    loadSavedAssignee();
  }, [profiles]);

  const handleAssigneeChange = async (newAssignee: string) => {
    setCurrentAssignee(newAssignee);
    localStorage.setItem("currentCleaningAssignee", newAssignee);
    
    if (newAssignee === "Sin asignar") {
      setCompletionPercentage(0);
      // Reset progress in database
      const { error } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error resetting progress:', error);
        toast.error("Error al reiniciar el progreso");
        return;
      }
    } else {
      // Load existing progress for the new assignee
      const { data: progressData, error } = await supabase
        .from('general_cleaning_progress')
        .select('completion_percentage')
        .eq('assignee', newAssignee)
        .maybeSingle();

      if (error) {
        console.error('Error loading progress:', error);
        toast.error("Error al cargar el progreso");
        return;
      }

      const roundedPercentage = Math.round(progressData?.completion_percentage ?? 0);
      setCompletionPercentage(roundedPercentage);
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