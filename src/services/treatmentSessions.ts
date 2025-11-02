
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SessionStatus = 'scheduled' | 'completed' | 'missed';

export interface TreatmentSession {
  id?: string;
  user_id: string;
  session_date: Date | string;
  status: SessionStatus;
  created_at?: string;
  updated_at?: string;
}

// Save session status to Supabase
export const saveTreatmentSession = async (
  session: Omit<TreatmentSession, 'id'>
): Promise<TreatmentSession | null> => {
  try {
    // Ensure we're working with a date object
    const sessionDate = new Date(session.session_date);
    
    // Format the date to match PostgreSQL's format by using ISO format and taking just the date part
    // This prevents timezone issues by explicitly using the date components
    const year = sessionDate.getFullYear();
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const day = String(sessionDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Check if there's already a session for this date and user
    const { data: existingSession } = await supabase
      .from('treatment_sessions')
      .select('id')
      .eq('user_id', session.user_id)
      .eq('session_date', formattedDate)
      .maybeSingle();

    let result;
    
    if (existingSession) {
      // Update existing session
      result = await supabase
        .from('treatment_sessions')
        .update({ 
          status: session.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSession.id)
        .select()
        .single();
    } else {
      // Insert new session
      result = await supabase
        .from('treatment_sessions')
        .insert({ 
          user_id: session.user_id,
          session_date: formattedDate,
          status: session.status
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return result.data as TreatmentSession;
  } catch (error) {
    console.error('Error saving treatment session:', error);
    return null;
  }
};

// Delete a treatment session for a specific date
export const deleteTreatmentSession = async (
  userId: string,
  sessionDate: Date
): Promise<boolean> => {
  try {
    // Format the date correctly to prevent timezone issues
    const year = sessionDate.getFullYear();
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const day = String(sessionDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Delete the session for this date and user
    const { error } = await supabase
      .from('treatment_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('session_date', formattedDate);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting treatment session:', error);
    return false;
  }
};

// Get all sessions for current user
export const getUserTreatmentSessions = async (
  userId: string
): Promise<TreatmentSession[]> => {
  try {
    const { data, error } = await supabase
      .from('treatment_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false });

    if (error) throw error;
    // Add type assertion to convert the string status to SessionStatus
    return (data || []) as TreatmentSession[];
  } catch (error) {
    console.error('Error fetching treatment sessions:', error);
    return [];
  }
};
