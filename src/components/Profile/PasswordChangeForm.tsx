
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { KeyRound, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PasswordChangeForm = () => {
  const { t } = useLanguage();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem', {
        description: 'A nova senha e a confirmação devem ser iguais.'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Senha muito curta', {
        description: 'A senha deve ter pelo menos 6 caracteres.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Senha atualizada', {
        description: 'Sua senha foi alterada com sucesso.'
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Erro ao atualizar senha', {
        description: error.message || 'Ocorreu um erro ao atualizar sua senha.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2 dark:text-gray-200">
        <Shield size={20} className="text-primary" />
        {t('editProfile.changePassword')}
      </h2>
      
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('editProfile.newPassword')}
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('editProfile.newPasswordPlaceholder')}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('editProfile.confirmPassword')}
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('editProfile.confirmPasswordPlaceholder')}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="text-white">
            {isLoading ? t('editProfile.updating') : t('editProfile.updatePassword')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PasswordChangeForm;
