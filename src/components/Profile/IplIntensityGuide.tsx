
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getIplIntensityRecommendation, SkinTone, HairColor } from '@/services/iplIntensityCalculations';

const IplIntensityGuide = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data: userPreferences, error } = await supabase
          .from('user_preferences')
          .select('skin_tone, hair_color')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching user preferences:", error);
          return;
        }
        
        if (userPreferences && userPreferences.length > 0) {
          const skinTone = userPreferences[0].skin_tone as SkinTone;
          const hairColor = userPreferences[0].hair_color as HairColor;
          
          const iplRecommendation = getIplIntensityRecommendation(skinTone, hairColor);
          setRecommendation(iplRecommendation);
        }
      } catch (error) {
        console.error("Error loading IPL recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="w-5 h-5 text-primary" />
            Intensidade IPL Recomendada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="w-5 h-5 text-primary" />
            Intensidade IPL Recomendada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Complete o questionário para receber recomendações personalizadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Zap className="w-5 h-5 text-primary" />
          Intensidade IPL Recomendada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Intensidade Inicial
            </p>
            <Badge 
              variant={recommendation.isRecommended ? "default" : "destructive"}
              className="text-sm px-3 py-1 text-white"
            >
              {recommendation.initialIntensity}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Intensidade Máxima
            </p>
            <Badge 
              variant={recommendation.isRecommended ? "default" : "destructive"}
              className="text-sm px-3 py-1 text-white"
            >
              {recommendation.maxIntensity}
            </Badge>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            {recommendation.isRecommended ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                {recommendation.isRecommended ? "Recomendações de Uso" : "Atenção Importante"}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {recommendation.observations}
              </p>
            </div>
          </div>
        </div>

        {recommendation.isRecommended && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 <strong>Dica:</strong> Sempre faça um teste em pequena área antes de iniciar o tratamento completo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IplIntensityGuide;
