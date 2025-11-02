import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, User, Palette, Edit, Target } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from "@/components/ui/sonner";

interface UserPreferences {
  skin_tone: string;
  hair_color: string;
  treatment_goals: string;
}

const SkinInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSkinTone, setEditingSkinTone] = useState('');
  const [editingHairColor, setEditingHairColor] = useState('');
  const [editingTreatmentGoals, setEditingTreatmentGoals] = useState('');

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        console.log('Fetching preferences for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('skin_tone, hair_color, treatment_goals')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error fetching user preferences:', error);
          toast.error('Erro ao carregar informações da pele');
          return;
        }

        console.log('Fetched data:', data);
        
        if (data && data.length > 0) {
          setPreferences(data[0]);
        } else {
          console.log('No preferences found for user');
          setPreferences(null);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar informações da pele');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          skin_tone: editingSkinTone,
          hair_color: editingHairColor,
          treatment_goals: editingTreatmentGoals,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        toast.error('Erro ao salvar preferências');
        return;
      }

      // Update local state
      setPreferences({
        skin_tone: editingSkinTone,
        hair_color: editingHairColor,
        treatment_goals: editingTreatmentGoals
      });

      setIsEditModalOpen(false);
      toast.success('Preferências atualizadas com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao salvar preferências');
    }
  };

  const getSkinToneDisplay = (skinTone: string) => {
    const skinToneMap: { [key: string]: string } = {
      'branco': 'Muito Clara',
      'bege': 'Clara',
      'castanho-claro': 'Média',
      'castanho-medio': 'Oliva',
      'castanho-escuro': 'Bronzeada',
      'castanho-muito-escuro': 'Muito Escura'
    };
    return skinToneMap[skinTone] || skinTone;
  };

  const getHairColorDisplay = (hairColor: string) => {
    const hairColorMap: { [key: string]: string } = {
      'loiro': 'Loiro',
      'castanho-claro': 'Castanho Claro',
      'castanho-medio': 'Castanho Médio', 
      'castanho-escuro': 'Castanho Escuro',
      'preto': 'Preto',
      'ruivo': 'Ruivo'
    };
    return hairColorMap[hairColor] || hairColor;
  };

  const getTreatmentGoalsDisplay = (goals: string) => {
    const goalsMap: { [key: string]: string } = {
      'reduction': 'Redução dos pelos',
      'removal': 'Remoção completa dos pelos', 
      'maintenance': 'Manutenção após tratamentos anteriores'
    };
    return goalsMap[goals] || goals;
  };

  const getSkinToneColor = (skinTone: string) => {
    const colorMap: { [key: string]: string } = {
      'branco': '#FDF2E9',
      'bege': '#FAE5D3', 
      'castanho-claro': '#DDB892',
      'castanho-medio': '#C9A96E',
      'castanho-escuro': '#A67C52',
      'castanho-muito-escuro': '#8B4513'
    };
    return colorMap[skinTone] || '#E5E7EB';
  };

  const getHairColorColor = (hairColor: string) => {
    const colorMap: { [key: string]: string } = {
      'loiro': '#F7E98E',
      'castanho-claro': '#D2B48C',
      'castanho-medio': '#A0522D',
      'castanho-escuro': '#8B4513',
      'preto': '#2C2C2C',
      'ruivo': '#CD853F'
    };
    return colorMap[hairColor] || '#E5E7EB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Informações da Pele
            </h1>
          </div>

          {!preferences ? (
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma informação de pele encontrada. Complete o questionário de onboarding para ver suas informações.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Skin Tone Card */}
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
                      <User className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Tom de Pele
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Seu tom de pele registrado
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                      style={{ backgroundColor: getSkinToneColor(preferences.skin_tone) }}
                    />
                    <div>
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {getSkinToneDisplay(preferences.skin_tone)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Usado para personalizar seu tratamento
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Hair Color Card */}
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
                      <Palette className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Cor do Cabelo
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sua cor de cabelo registrada
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                      style={{ backgroundColor: getHairColorColor(preferences.hair_color) }}
                    />
                    <div>
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {getHairColorDisplay(preferences.hair_color)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Usado para ajustar a intensidade do IPL
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Treatment Goals Card */}
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
                      <Target className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Objetivo do Tratamento
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Seu objetivo registrado
                      </p>
                    </div>
                  </div>
                  
                   <div>
                     <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                       {getTreatmentGoalsDisplay(preferences.treatment_goals) || 'Não informado'}
                     </p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       Define como personalizar seu plano
                     </p>
                   </div>
                </div>
              </Card>

              {/* Edit Button */}
              <Button
                onClick={() => {
                  setEditingSkinTone(preferences.skin_tone);
                  setEditingHairColor(preferences.hair_color);
                  setEditingTreatmentGoals(preferences.treatment_goals);
                  setIsEditModalOpen(true);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 h-12 text-base font-medium"
              >
                <Edit className="w-5 h-5 text-white" />
                Editar preferências
              </Button>

              {/* Info Card */}
              <Card className="overflow-hidden bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm rounded-xl">
                <div className="p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>💡 Dica:</strong> Essas informações foram coletadas durante seu onboarding e são usadas para personalizar seu plano de tratamento IPL e garantir a melhor eficácia e segurança.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Preferências</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Skin Tone Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tom de Pele</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'branco', label: 'Muito Clara', color: '#FDF2E9' },
                      { key: 'bege', label: 'Clara', color: '#FAE5D3' },
                      { key: 'castanho-claro', label: 'Média', color: '#DDB892' },
                      { key: 'castanho-medio', label: 'Oliva', color: '#C9A96E' },
                      { key: 'castanho-escuro', label: 'Bronzeada', color: '#A67C52' },
                      { key: 'castanho-muito-escuro', label: 'Muito Escura', color: '#8B4513' }
                    ].map((tone) => (
                      <button
                        key={tone.key}
                        onClick={() => setEditingSkinTone(tone.key)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          editingSkinTone === tone.key
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-sm font-medium">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cor do Cabelo</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'loiro', label: 'Loiro', color: '#F7E98E' },
                      { key: 'castanho-claro', label: 'Castanho Claro', color: '#D2B48C' },
                      { key: 'castanho-medio', label: 'Castanho Médio', color: '#A0522D' },
                      { key: 'castanho-escuro', label: 'Castanho Escuro', color: '#8B4513' },
                      { key: 'preto', label: 'Preto', color: '#2C2C2C' },
                      { key: 'ruivo', label: 'Ruivo', color: '#CD853F' }
                    ].map((color) => (
                      <button
                        key={color.key}
                        onClick={() => setEditingHairColor(color.key)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          editingHairColor === color.key
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm font-medium">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Treatment Goals Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Objetivo do Tratamento</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'reduction', label: 'Redução dos pelos', description: 'Diminuir quantidade e espessura' },
                      { key: 'removal', label: 'Remoção completa dos pelos', description: 'Eliminação total dos pelos' },
                      { key: 'maintenance', label: 'Manutenção após tratamentos anteriores', description: 'Manter resultados obtidos' }
                    ].map((goal) => (
                      <button
                        key={goal.key}
                        onClick={() => setEditingTreatmentGoals(goal.key)}
                        className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left ${
                          editingTreatmentGoals === goal.key
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium">{goal.label}</span>
                        <span className="text-sm text-gray-500">{goal.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SkinInfo;
