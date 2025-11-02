
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Shield, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface OtpVerificationFormProps {
  email: string;
  onVerified: () => void;
  onResendCode: () => void;
  onCancel: () => void;
}

const OtpVerificationForm = ({ email, onVerified, onResendCode, onCancel }: OtpVerificationFormProps) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error("Digite o código", {
        description: "O código é obrigatório para continuar"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call server-side OTP verification
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          email: email.trim(),
          otp: otp.trim()
        }
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        throw new Error(error.message || 'Failed to verify OTP');
      }

      if (data?.success) {
        toast.success("Código verificado", {
          description: "Agora você pode definir sua nova senha"
        });
        onVerified();
      } else {
        throw new Error("Código inválido");
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error("Código inválido", {
        description: "Verifique o código e tente novamente"
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Digite o código</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enviamos um código de verificação para <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Shield size={18} />
          </div>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Digite o código de 6 dígitos"
            required
            maxLength={6}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center font-mono text-lg"
          />
        </div>
        
        <Button 
          className="w-full h-12 text-base font-medium rounded-full" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Verificar código'}
        </Button>
        
        <div className="flex items-center justify-between text-sm">
          <button 
            type="button" 
            onClick={onCancel}
            className="text-primary hover:underline"
          >
            Voltar
          </button>
          
          <button 
            type="button" 
            onClick={onResendCode}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <RotateCcw size={14} />
            Reenviar código
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default OtpVerificationForm;
