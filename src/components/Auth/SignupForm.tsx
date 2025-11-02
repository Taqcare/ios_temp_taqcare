
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

const SignupForm = ({ onToggleForm }: { onToggleForm: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error("É necessário aceitar os termos", {
        description: "Por favor, aceite os termos de uso para continuar"
      });
      return;
    }

    if (!name || !email || !password) {
      toast.error("Preencha todos os campos obrigatórios", {
        description: "Nome, email e senha são obrigatórios"
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
            is_new_user: true
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) {
        // Verifica se o erro é de usuário já existente
        if (error.message?.includes('already') || error.message?.includes('registered') || error.status === 422) {
          toast.error("Este email já está cadastrado", {
            description: "Use outro email ou faça login na sua conta existente"
          });
        } else {
          toast.error("Falha ao criar conta", {
            description: error.message || "Tente novamente mais tarde"
          });
        }
        setIsLoading(false);
        return;
      }

      // Verifica se o usuário já existe mas não confirmou o email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("Este email já está cadastrado", {
          description: "Use outro email ou faça login na sua conta existente"
        });
        setIsLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!", {
        description: "Agora você pode fazer login com suas credenciais"
      });
      
      onToggleForm();
    } catch (error: any) {
      toast.error("Falha ao criar conta", {
        description: error.message || "Tente novamente mais tarde"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <User size={18} />
            </div>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome Completo"
              required
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Phone size={18} />
            </div>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefone (opcional)"
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="border-gray-300 dark:border-[#C8C1B2] data-[state=checked]:bg-primary dark:data-[state=checked]:bg-[#C8C1B2] dark:data-[state=checked]:text-gray-900"
            />
            <label 
              htmlFor="terms" 
              className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              Li e aceito a{" "}
              <button
                type="button"
                className="text-primary dark:text-[#C8C1B2] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyDialogOpen(true);
                }}
              >
                Política de Privacidade
              </button>
            </label>
          </div>
        </div>
        
        <Button 
          className="w-full h-12 text-base font-medium rounded-full text-white" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Criando Conta...' : 'Criar Conta'}
        </Button>
        
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          Já tem uma conta?{" "}
          <button onClick={onToggleForm} className="text-primary dark:text-[#C8C1B2] hover:underline font-medium">
            Entrar
          </button>
        </div>
      </form>

      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Política de Privacidade</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Última atualização: Abril 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">1. Informações Coletadas</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coletamos informações pessoais como nome, email, telefone, dados de saúde relacionados ao seu tratamento e 
              dados de uso do aplicativo para melhorar sua experiência.
            </p>
            
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">2. Uso das Informações</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Utilizamos suas informações para fornecer e personalizar nossos serviços, 
              enviar notificações importantes sobre seu tratamento e melhorar nosso aplicativo.
            </p>
            
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">3. Compartilhamento</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nunca compartilhamos suas informações pessoais com terceiros sem sua autorização explícita, 
              exceto quando exigido por lei.
            </p>
            
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">4. Segurança</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, 
              alteração, divulgação ou destruição.
            </p>
            
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">5. Seus Direitos</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento 
              através das configurações do aplicativo ou entrando em contato com nosso suporte.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setPrivacyDialogOpen(false)} className="bg-primary hover:bg-pink-600">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupForm;
