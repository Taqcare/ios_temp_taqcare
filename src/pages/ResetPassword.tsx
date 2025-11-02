
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for session on mount and auto-fill password if provided
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (!error && data.session) {
        setSessionVerified(true);
        
        // Check if password was passed in URL (from our custom flow)
        const urlPassword = searchParams.get('password');
        if (urlPassword) {
          const decodedPassword = decodeURIComponent(urlPassword);
          setPassword(decodedPassword);
          setConfirmPassword(decodedPassword);
          
          // Auto-submit the form
          setTimeout(() => {
            handlePasswordUpdate(decodedPassword);
          }, 500);
        }
      } else {
        toast.error("Sessão inválida", {
          description: "Por favor, solicite um novo token de recuperação"
        });
        setTimeout(() => navigate('/'), 2000);
      }
    };

    checkSession();
  }, [navigate, searchParams]);

  const handlePasswordUpdate = async (newPassword?: string) => {
    const passwordToUse = newPassword || password;
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({ password: passwordToUse });

      if (error) {
        throw error;
      }

      toast.success("Senha atualizada com sucesso", {
        description: "Você será redirecionado para o painel em instantes"
      });

      // Redirect to dashboard after successful password reset
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast.error("Falha ao redefinir senha", {
        description: error.message || "Tente novamente mais tarde"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem", {
        description: "Por favor, verifique se você digitou a mesma senha nos dois campos"
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Senha muito curta", {
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      return;
    }

    setIsLoading(true);
    await handlePasswordUpdate();
    setIsLoading(false);
  };

  if (!sessionVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <img 
              src="/lovable-uploads/e7c972aa-ea59-4302-8c65-f774dc9d8a81.png" 
              alt="Taqcare Logo" 
              className="h-16 w-16"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-foreground">
              Crie sua nova senha
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Digite sua nova senha abaixo
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 text-base font-medium rounded-full" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Definir nova senha'}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              <button 
                onClick={() => navigate('/')} 
                type="button" 
                className="text-primary hover:underline font-medium"
              >
                Voltar para login
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
