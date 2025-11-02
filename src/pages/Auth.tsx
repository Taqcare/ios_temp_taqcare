
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import SignupForm from '@/components/Auth/SignupForm';
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    // Check for password recovery token in URL
    const handlePasswordRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        // Redirect to the password reset page
        navigate('/reset-password');
      }
    };
    
    handlePasswordRecovery();
  }, [navigate]);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };
  
  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <img 
              src="/lovable-uploads/logo-preto.png" 
              alt="Taqcare Logo" 
              className="h-24 w-24 dark:hidden"
            />
            <img 
              src="/lovable-uploads/logo-branca.png" 
              alt="Taqcare Logo" 
              className="h-24 w-24 hidden dark:block"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {showLogin ? 
                (language === 'pt' ? 'Bem-vindo(a) ao app!' : 'Welcome to the app!') : 
                (language === 'pt' ? 'Crie sua conta' : 'Create your account')
              }
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {showLogin 
                ? (language === 'pt' ? 'Entre com sua conta para continuar' : 'Sign in to your account to continue')
                : (language === 'pt' ? 'Preencha os dados abaixo para começar' : 'Fill in the details below to get started')
              }
            </p>
          </motion.div>
        </div>
        
        <motion.div
          key={showLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, x: showLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-full"
        >
          {showLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <SignupForm onToggleForm={toggleForm} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
