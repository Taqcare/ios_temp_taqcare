
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface NewPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewPasswordForm = ({ email, onSuccess, onCancel }: NewPasswordFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Send password reset email with the new password in metadata
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?password=${encodeURIComponent(password)}`
      });

      if (error) {
        throw error;
      }

      toast.success("Email de redefinição enviado", {
        description: "Verifique seu email e clique no link para confirmar a nova senha"
      });

      onSuccess();
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Falha ao solicitar redefinição", {
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Nova senha</h2>
          <p className="text-sm text-gray-500">
            Digite sua nova senha para <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              required
              className="pl-10 pr-10 bg-gray-50 border-gray-200"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              required
              className="pl-10 pr-10 bg-gray-50 border-gray-200"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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
          {isLoading ? 'Processando...' : 'Definir nova senha'}
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

export default NewPasswordForm;
