import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import { supabase } from "@/integrations/supabase/client";
import useProfiles from "@/hooks/useProfiles";

const GeneralCleaningSection = () => {
  const [currentAssignee, setCurrentAssignee] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { profiles } = useProfiles();

  // Load saved assignee and progress from database
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        // First get the latest progress record
        const { data: progressData, error: progressError } = await supabase
          .from('general_cleaning_progress')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (progressError) {
          console.error('Error loading progress:', progressError);
          toast.error("Error al cargar el progreso");
          return;
        }

        console.log('Progress data loaded:', progressData);

        if (progressData) {
          // Verify if the assignee exists in profiles or is "Sin asignar"
          const assigneeExists = progressData.assignee === "Sin asignar" || 
                               profiles.some(profile => profile.name === progressData.assignee);
          
          if (!assigneeExists) {
            console.log('Assignee not found in profiles, setting to "Sin asignar"');
            setCurrentAssignee("Sin asignar");
            setCompletionPercentage(0);
            return;
          }

          // Get all task states to verify the completion percentage
          const { data: taskStates, error: taskStatesError } = await supabase
            .from('cleaning_task_states')
            .select('completed');

          if (taskStatesError) {
            console.error('Error loading task states:', taskStatesError);
            toast.error("Error al cargar el estado de las tareas");
            return;
          }

          // Calculate actual completion percentage based on task states
          const completedTasks = taskStates?.filter(state => state.completed)?.length || 0;
          const totalTasks = taskStates?.length || 0;
          const calculatedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          console.log('Setting current assignee to:', progressData.assignee);
          console.log('Setting completion percentage to:', calculatedPercentage);
          
          setCurrentAssignee(progressData.assignee);
          setCompletionPercentage(calculatedPercentage);

          // Update the progress record if it doesn't match the calculated percentage
          if (calculatedPercentage !== progressData.completion_percentage) {
            const { error: updateError } = await supabase
              .from('general_cleaning_progress')
              .upsert({
                assignee: progressData.assignee,
                completion_percentage: calculatedPercentage,
                last_updated: new Date().toISOString()
              }, {
                onConflict: 'assignee'
              });

            if (updateError) {
              console.error('Error updating progress percentage:', updateError);
            }
          }
        } else {
          console.log('No progress data found, using default values');
          setCurrentAssignee("Sin asignar");
          setCompletionPercentage(0);
        }
      } catch (error) {
        console.error('Error in loadSavedProgress:', error);
        toast.error("Error al cargar el progreso guardado");
      }
    };

    // Solo cargar si profiles está disponible y currentAssignee es null
    if (profiles.length > 0 && currentAssignee === null) {
      loadSavedProgress();
    }
  }, [profiles, currentAssignee]);

  const handleAssigneeChange = async (newAssignee: string) => {
    try {
      console.log('Changing assignee to:', newAssignee);
      
      // Now we can use upsert since we have a unique constraint on assignee
      const { error: progressError } = await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'assignee'
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
        toast.error("Error al actualizar el responsable");
        return;
      }

      // Reset all tasks to not completed
      const { data: tasks, error: tasksQueryError } = await supabase
        .from('general_cleaning_tasks')
        .select('id');

      if (tasksQueryError) {
        console.error('Error querying tasks:', tasksQueryError);
        toast.error("Error al obtener las tareas");
        return;
      }

      if (tasks && tasks.length > 0) {
        const taskStates = tasks.map(task => ({
          task_id: task.id,
          completed: false,
          updated_at: new Date().toISOString()
        }));

        const { error: tasksError } = await supabase
          .from('cleaning_task_states')
          .upsert(taskStates, {
            onConflict: 'task_id'
          });

        if (tasksError) {
          console.error('Error resetting tasks:', tasksError);
          toast.error("Error al reiniciar las tareas");
          return;
        }
      }

      setCurrentAssignee(newAssignee);
      setCompletionPercentage(0);
      
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error("Error al actualizar el responsable");
    }
  };

  // Si currentAssignee es null, mostrar un estado de carga
  if (currentAssignee === null) {
    return (
      <Card className="p-6 space-y-6">
        <div>Cargando...</div>
      </Card>
    );
  }

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