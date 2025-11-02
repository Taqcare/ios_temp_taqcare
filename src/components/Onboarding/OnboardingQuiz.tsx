
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type QuizOption = {
  id: string;
  label: string;
  value: string;
  image?: string;
};

type QuizQuestion = {
  id: number;
  question: string;
  options: QuizOption[];
  multiSelect?: boolean;
};

const OnboardingQuiz = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: "Qual é o seu tom de pele?",
      options: [
        { id: "branco", label: "Branco", value: "branco", image: "/lovable-uploads/1d85514d-59d3-480d-8e33-5efc7ff5d528.png" },
        { id: "bege", label: "Bege", value: "bege", image: "/lovable-uploads/d2f93cce-2908-43aa-8126-10906488bece.png" },
        { id: "castanho-claro", label: "Castanho claro", value: "castanho-claro", image: "/lovable-uploads/64f527d0-70f6-4a4e-a979-01f3e4c4d241.png" },
        { id: "castanho-medio", label: "Castanho médio", value: "castanho-medio", image: "/lovable-uploads/dcbe3d52-5ac3-41b0-9e70-be28707efc63.png" },
        { id: "castanho-escuro", label: "Castanho escuro", value: "castanho-escuro", image: "/lovable-uploads/e720b868-c4b1-411a-9479-a25c045db0dd.png" },
        { id: "castanho-muito-escuro", label: "Castanho muito escuro/preto", value: "castanho-muito-escuro", image: "/lovable-uploads/8161b664-73d6-4ac0-b3f1-7402eb240874.png" },
      ],
    },
    {
      id: 2,
      question: "Qual é o seu gênero?",
      options: [
        { id: "feminino", label: "Feminino", value: "feminino" },
        { id: "masculino", label: "Masculino", value: "masculino" },
        { id: "outro", label: "Outro", value: "outro" },
      ],
    },
    {
      id: 3,
      question: "Qual é a cor do seu cabelo?",
      options: [
        { id: "preto", label: "Preto", value: "preto", image: "/lovable-uploads/07c5c7db-4179-4b5c-8f9f-06792ebae9c6.png" },
        { id: "castanho-escuro", label: "Castanho escuro", value: "castanho-escuro", image: "/lovable-uploads/4f6324f2-2940-40c2-8a96-5c10a3f953ed.png" },
        { id: "castanho-medio", label: "Castanho médio", value: "castanho-medio", image: "/lovable-uploads/6049291e-0c77-4421-a1b7-c3e472ca5277.png" },
        { id: "castanho-claro", label: "Castanho claro", value: "castanho-claro", image: "/lovable-uploads/15cf4e88-72c9-4360-9d81-cb7119bf0b7d.png" },
        { id: "loiro", label: "Loiro", value: "loiro", image: "/lovable-uploads/ee404206-0c58-40f3-ae97-dd638b5c62c2.png" },
        { id: "ruivo", label: "Ruivo", value: "ruivo", image: "/lovable-uploads/55fefea3-9c93-433b-ae34-ca23ce4f7c8e.png" },
      ],
    },
    {
      id: 4,
      question: "Quais áreas você gostaria de tratar?",
      multiSelect: true,
      options: [
        { id: "face", label: "Rosto", value: "face" },
        { id: "arms", label: "Braços", value: "arms" },
        { id: "legs", label: "Pernas", value: "legs" },
        { id: "underarms", label: "Axilas", value: "underarms" },
        { id: "bikini", label: "Linha do Biquíni", value: "bikini" },
        { id: "other", label: "Outros", value: "other" },
      ],
    },
    {
      id: 5,
      question: "Quais são seus objetivos de tratamento?",
      options: [
        { id: "reduction", label: "Redução dos pelos", value: "reduction" },
        { id: "removal", label: "Remoção completa dos pelos", value: "removal" },
        { id: "maintenance", label: "Manutenção após tratamentos anteriores", value: "maintenance" },
      ],
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    if (currentQ.multiSelect) {
      setSelectedOptions((prev) => {
        if (prev.includes(optionId)) {
          return prev.filter((id) => id !== optionId);
        } else {
          return [...prev, optionId];
        }
      });
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const saveToSupabase = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar suas preferências.");
      return false;
    }
    
    try {
      const skinTone = answers[1] as string;
      const gender = answers[2] as string;
      const hairColor = answers[3] as string;
      const treatmentAreas = answers[4] as string[];
      const treatmentGoals = answers[5] as string;
      
      // Validate that all required fields are present before saving
      if (!skinTone || !gender || !hairColor || !treatmentAreas || !treatmentGoals) {
        console.error('Missing required preferences:', {
          skinTone,
          gender,
          hairColor,
          treatmentAreas,
          treatmentGoals
        });
        toast.error("Dados incompletos. Por favor, responda todas as perguntas.");
        return false;
      }
      
      console.log("Saving preferences:", {
        user_id: user.id,
        skin_tone: skinTone,
        gender: gender,
        hair_color: hairColor,
        treatment_areas: treatmentAreas,
        treatment_goals: treatmentGoals
      });
      
      // Store data in Supabase
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          skin_tone: skinTone,
          gender: gender,
          hair_color: hairColor,
          treatment_areas: treatmentAreas,
          treatment_goals: treatmentGoals,
          treatment_frequency: null
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error("Erro ao salvar suas preferências.");
        return false;
      }

      // Also store some values in localStorage for client-side access
      localStorage.setItem('skinTone', skinTone);
      localStorage.setItem('hairColor', hairColor);
      localStorage.setItem('currentSession', '1');
      
      return true;
    } catch (error) {
      console.error('Error in saveToSupabase:', error);
      toast.error("Erro ao salvar suas preferências.");
      return false;
    }
  };

  const handleNextQuestion = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Por favor, selecione uma opção");
      return;
    }

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: currentQ.multiSelect ? selectedOptions : selectedOptions[0],
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions([]);
    } else {
      // Before submitting, make sure we have all answers
      const updatedAnswers = {
        ...answers,
        [currentQ.id]: currentQ.multiSelect ? selectedOptions : selectedOptions[0],
      };
      
      // Quiz completed - save to Supabase
      setIsSubmitting(true);
      try {
        // First set the answers with the current question's answer
        setAnswers(updatedAnswers);
        
        // Validate that all questions have been answered
        const requiredQuestionIds = [1, 2, 3, 4, 5];
        const missingAnswers = requiredQuestionIds.filter(id => !updatedAnswers[id]);
        
        if (missingAnswers.length > 0) {
          toast.error(`Por favor, responda todas as perguntas (faltam ${missingAnswers.length})`);
          // Go back to the first unanswered question
          setCurrentQuestion(missingAnswers[0] - 1);
          setIsSubmitting(false);
          return;
        }
        
        console.log('All questions answered, saving to Supabase...');
        const success = await saveToSupabase();
        if (success) {
          console.log('Preferences saved successfully, calling onComplete...');
          toast.success("Questionário concluído!", {
            description: "Seu plano personalizado está pronto.",
          });
          
          // Add a small delay to ensure the toast is shown
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } catch (error) {
        console.error('Error completing quiz:', error);
        toast.error("Erro ao concluir o questionário.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto px-2">
      <CardHeader>
        <CardTitle className="text-2xl">Personalize seu Plano</CardTitle>
        <CardDescription>
          Responda algumas perguntas para obter seu plano de tratamento Ivi Air personalizado
        </CardDescription>
        <Progress value={progress} className="h-2 mt-4 bg-primary-light" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{currentQ.question}</h3>
          <div className="space-y-2">
            {currentQ.options.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-md border cursor-pointer transition-all ${
                  selectedOptions.includes(option.id)
                    ? "border-primary bg-primary/10 dark:bg-primary/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800"
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border border-primary flex items-center justify-center flex-shrink-0 ${
                      selectedOptions.includes(option.id) ? "bg-primary" : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    {selectedOptions.includes(option.id) && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  {option.image && (
                    <img 
                      src={option.image} 
                      alt={option.label}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
              setSelectedOptions(
                Array.isArray(answers[questions[currentQuestion - 1].id])
                  ? (answers[questions[currentQuestion - 1].id] as string[])
                  : [answers[questions[currentQuestion - 1].id] as string]
              );
            }
          }}
          disabled={currentQuestion === 0}
        >
          Anterior
        </Button>
        <Button onClick={handleNextQuestion} disabled={isSubmitting}>
          {currentQuestion < questions.length - 1 ? "Próximo" : "Concluir"} 
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingQuiz;
