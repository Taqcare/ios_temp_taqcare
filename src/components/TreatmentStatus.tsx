
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  getTreatmentCalculation, 
  getCompletedSessionsCount,
  calculateTotalProgress,
  SkinTone,
  HairColor
} from '@/services/treatmentCalculations';
import { calculateNextSessionDate } from '@/services/sessionScheduling';

const TreatmentStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [treatmentData, setTreatmentData] = useState({
    progress: 0, 
    sessions: 0, 
    totalSessions: 8, 
    nextDate: "Carregando...",
    progressPerSession: 12.5,
    skinTone: 'medium' as SkinTone,
    hairColor: 'black' as HairColor
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch user preferences - MUDANÇA: Usando .limit(1) para pegar apenas um registro
        const { data: userPreferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (preferencesError) {
          console.error("Error fetching user preferences:", preferencesError);
          return;
        }

        // Get the skin tone and hair color do primeiro registro se existir
        const skinTone = userPreferences?.[0]?.skin_tone as SkinTone || 'branco';
        const hairColor = userPreferences?.[0]?.hair_color as HairColor || 'preto';
        
        // Calculate treatment parameters
        const treatmentCalculation = getTreatmentCalculation(skinTone, hairColor);
        
        // Get completed sessions count
        const completedSessions = await getCompletedSessionsCount(user.id);
        
        // Calculate total progress
        const totalProgress = calculateTotalProgress(
          completedSessions, 
          treatmentCalculation.progressPerSession
        );

        // Find the next scheduled session
        const { data: sessions, error: sessionsError } = await supabase
          .from('treatment_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'scheduled')
          .gt('session_date', new Date().toISOString())
          .order('session_date', { ascending: true })
          .limit(1);

        if (sessionsError) {
          console.error("Error fetching next session:", sessionsError);
        }

        let nextSessionDate = "Agende sua próxima sessão";
        let recommendedTime = "Horário recomendado: Noite";

        if (sessions && sessions.length > 0) {
          const date = new Date(sessions[0].session_date);
          nextSessionDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
        } else {
          // Get the last completed session to calculate next suggested date
          const { data: lastSession } = await supabase
            .from('treatment_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('session_date', { ascending: false })
            .limit(1);

          const lastSessionDate = lastSession?.[0]?.session_date;
          const suggestedDate = calculateNextSessionDate(lastSessionDate);
          nextSessionDate = `Sugestão: ${format(suggestedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}`;
        }

        setTreatmentData({
          progress: totalProgress,
          sessions: completedSessions,
          totalSessions: treatmentCalculation.sessions,
          nextDate: nextSessionDate,
          progressPerSession: treatmentCalculation.progressPerSession,
          skinTone: skinTone,
          hairColor: hairColor
        });
        
      } catch (error) {
        console.error("Error loading treatment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Progresso do Tratamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Progresso do Tratamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Progresso</span>
              <span className="text-white">{treatmentData.sessions}/{treatmentData.totalSessions} Sessões</span>
            </div>
            <Progress value={treatmentData.progress} className="h-2 bg-primary-light" />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Próxima Sessão</h3>
            <div 
              className="bg-primary-light dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-primary/10 dark:hover:bg-gray-600 transition-colors"
              onClick={() => navigate('/schedule')}
            >
              <p className="text-lg font-semibold text-primary dark:text-primary">{treatmentData.nextDate}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Horário recomendado: Noite</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentStatus;
