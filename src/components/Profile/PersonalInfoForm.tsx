
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { UserRound, Phone, Mail, IdCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PersonalInfoForm = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      setEmail(user.email || '');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      });

      if (authError) throw authError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      if (refreshUser) await refreshUser();
      
      toast.success('Perfil atualizado', {
        description: 'Suas informações foram atualizadas com sucesso.'
      });
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil', {
        description: error.message || 'Ocorreu um erro ao atualizar suas informações.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2 dark:text-gray-200">
        <UserRound size={20} className="text-primary" />
        {t('editProfile.personalInfo')}
      </h2>
      
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="userId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Seu User ID
          </label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <Input
              id="userId"
              value={user?.id || ''}
              readOnly
              className="pl-10 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Este é seu identificador único no sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('editProfile.firstName')}
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('editProfile.firstNamePlaceholder')}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('editProfile.lastName')}
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('editProfile.lastNamePlaceholder')}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('editProfile.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <Input
              id="email"
              value={email}
              readOnly
              className="pl-10 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('editProfile.emailReadonly')}</p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('editProfile.phone')}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('editProfile.phonePlaceholder')}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="text-white">
            {isLoading ? t('editProfile.saving') : t('editProfile.saveChanges')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PersonalInfoForm;
