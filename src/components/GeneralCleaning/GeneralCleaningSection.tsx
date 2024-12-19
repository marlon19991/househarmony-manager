import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import TaskList from "./TaskList";
import AssigneeSelector from "./AssigneeSelector";
import { supabase } from "@/integrations/supabase/client";

const GeneralCleaningSection = () => {
  const [currentAssignee, setCurrentAssignee] = useState("Sin asignar");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const loadSavedAssignee = async () => {
      // Load saved assignee from localStorage
      const savedAssignee = localStorage.getItem("currentCleaningAssignee");
      if (savedAssignee) {
        setCurrentAssignee(savedAssignee);
        
        // Load completion percentage from database
        const { data: progressData } = await supabase
          .from('general_cleaning_progress')
          .select('completion_percentage')
          .eq('assignee', savedAssignee)
          .maybeSingle();

        if (progressData?.completion_percentage !== null) {
          setCompletionPercentage(progressData.completion_percentage);
        }
      }
    };

    loadSavedAssignee();
  }, []);

  const handleAssigneeChange = async (newAssignee: string) => {
    setCurrentAssignee(newAssignee);
    localStorage.setItem("currentCleaningAssignee", newAssignee);
    
    if (newAssignee === "Sin asignar") {
      setCompletionPercentage(0);
      // Reset progress in database
      await supabase
        .from('general_cleaning_progress')
        .upsert({
          assignee: newAssignee,
          completion_percentage: 0,
          last_updated: new Date().toISOString()
        });
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
          onTaskComplete={setCompletionPercentage}
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