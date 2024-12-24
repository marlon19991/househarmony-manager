import { supabase } from "@/integrations/supabase/client";

export const progressService = {
  async updateProgress(assignee: string, percentage: number) {
    try {
      const { error } = await supabase
        .from('general_cleaning_progress')
        .upsert(
          {
            assignee,
            completion_percentage: percentage,
            last_updated: new Date().toISOString()
          },
          { onConflict: 'assignee' }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  async getCurrentProgress(assignee: string) {
    try {
      const { data, error } = await supabase
        .from('general_cleaning_progress')
        .select('*')
        .eq('assignee', assignee)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }
};