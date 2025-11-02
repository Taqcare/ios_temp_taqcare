import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleArrowDown, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  getTreatmentCalculation, 
  getCompletedSessionsCount,
  calculateTotalProgress,
  SkinTone,
  HairColor
} from '@/services/treatmentCalculations';

type SkinHairData = {
  skinTone: SkinTone;
  hairColor: HairColor;
};

const PersonalizedPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<SkinHairData>({
    skinTone: 'branco',
    hairColor: 'preto',
  });
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user preferences from Supabase - MUDANÇA: usando .limit(1) para pegar apenas um registro
        const { data: userPreferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('skin_tone, hair_color')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (preferencesError) {
          console.error("Error fetching user preferences:", preferencesError);
          return;
        }
        
        // Get skin tone and hair color do primeiro registro se existir
        const skinTone = (userPreferences?.[0]?.skin_tone || 'branco') as SkinTone;
        const hairColor = (userPreferences?.[0]?.hair_color || 'preto') as HairColor;
        
        setUserProfile({
          skinTone,
          hairColor
        });

        // Get number of completed sessions
        const completedSessionsCount = await getCompletedSessionsCount(user.id);
        setCompletedSessions(completedSessionsCount);
        
        // Calculate treatment parameters
        const treatmentCalculation = getTreatmentCalculation(skinTone, hairColor);
        
        // Calculate total progress
        const progress = calculateTotalProgress(
          completedSessionsCount,
          treatmentCalculation.progressPerSession
        );
        
        setTotalProgress(progress);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const treatmentCalculation = getTreatmentCalculation(userProfile.skinTone, userProfile.hairColor);
  const recommendedSessions = treatmentCalculation.sessions;
  const progressPerSession = treatmentCalculation.progressPerSession;

  const pieData = [
    { name: "Progresso", value: totalProgress },
    { name: "Restante", value: 100 - totalProgress }
  ];

  const COLORS = ['#C8C1B2', '#E5DEFF'];

  // Active sector rendering for animation effect
  const [activeIndex, setActiveIndex] = React.useState(0);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center gap-4">
            <CircleArrowDown className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-gray-900 dark:text-white">Seu Plano Personalizado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-56 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto w-56"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center gap-4">
          <CircleArrowDown className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Seu Plano Personalizado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-56 h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    strokeWidth={2}
                    stroke="#FFFFFF"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index]}
                        style={{
                          filter: index === 0 ? 'drop-shadow(0px 2px 5px rgba(200, 193, 178, 0.5))' : 'none'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Valor']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                      border: 'none',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-primary">
                  {Math.round(totalProgress)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progresso</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Geral do Tratamento</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CircleArrowDown className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Sessões Recomendadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendedSessions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Baseado no seu tipo de pele e pelo</p>
            </div>

            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Progresso Por Sessão</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressPerSession.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Redução esperada por tratamento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedPlan;
