
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingQuiz from '@/components/Onboarding/OnboardingQuiz';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (user) {
      // Pular direto para o quiz
      setShowQuiz(true);
    }
  }, [user]);

  const handleQuizComplete = () => {
    if (user) {
      console.log('Quiz completed, marking onboarding as completed and redirecting...');
      
      // Mark onboarding as completed
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      
      toast.success("Plano personalizado criado com sucesso!", {
        description: "Agora você pode começar seu tratamento."
      });
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
        
        // Force page reload if navigation doesn't work
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }, 500);
    }
  };

  // Safety check - if user already completed onboarding, redirect to dashboard
  useEffect(() => {
    if (user && localStorage.getItem(`onboarding_completed_${user.id}`) === 'true') {
      console.log('User already completed onboarding, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Show quiz directly
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light to-white dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-ipl-black dark:text-white mb-2">Bem Vindo a Taqcare</h1>
            <p className="text-gray-600 dark:text-gray-300">Vamos criar seu plano de tratamento personalizado</p>
          </div>
          
          <OnboardingQuiz onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Onboarding;
