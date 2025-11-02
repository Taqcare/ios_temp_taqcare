
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordFormProps {
  onCancel: () => void;
}

const ForgotPasswordForm = ({ onCancel }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email obrigatório", {
        description: "Digite seu email para continuar"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email inválido", {
        description: "Digite um email válido"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call Supabase function to send reset email
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { 
          email: email.trim()
        }
      });

      if (error) {
        console.error('Error sending reset email:', error);
        throw new Error(error.message || 'Failed to send reset email');
      }

      console.log('Reset email sent successfully:', data);
      
      toast.success("Email enviado!", {
        description: "Verifique seu email e clique no link para redefinir sua senha"
      });

      setEmailSent(true);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error("Erro ao enviar email", {
        description: error.message || "Tente novamente em alguns instantes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full text-center space-y-4"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Email enviado!</h2>
          <p className="text-sm text-muted-foreground">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="w-full"
          >
            Enviar novamente
          </Button>
          
          <button 
            type="button" 
            onClick={onCancel}
            className="text-sm text-primary hover:underline"
          >
            Voltar para login
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Esqueceu sua senha?</h2>
          <p className="text-sm text-muted-foreground">
            Digite seu email para receber um link de redefinição
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Mail size={18} />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="pl-10"
          />
        </div>
        
        <Button 
          className="w-full h-12 text-base font-medium rounded-full text-white" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar link'}
        </Button>
        
        <div className="text-center">
          <button 
            type="button" 
            onClick={onCancel}
            className="text-sm text-primary hover:underline"
          >
            Voltar para login
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
