
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const UserInfo = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatar nome do usuário para exibição
  const displayName = () => {
    if (isLoading) return t('profile.loading');
    
    if (profile?.first_name) {
      return profile.first_name + (profile.last_name ? ' ' + profile.last_name : '');
    }
    
    return user?.email ? user.email.split('@')[0] : t('profile.user');
  };

  const handleLogout = async () => {
    if (isSigningOut) return; // Prevent double clicks
    
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success(t('toast.logoutSuccess'), {
        description: t('toast.logoutDesc')
      });
      // Redirecionar para a página de login imediatamente para evitar problemas de estado
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Don't show error for session missing errors since we handle them gracefully
      if (!error.message?.includes('Auth session missing') && error.name !== 'AuthSessionMissingError') {
        toast.error(t('toast.logoutError'), {
          description: t('toast.logoutErrorDesc')
        });
      } else {
        // Even if there was a session error, we still succeeded in clearing the state
        toast.success(t('toast.logoutSuccess'), {
          description: t('toast.logoutDesc')
        });
        navigate('/');
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center gap-4 border-b dark:border-gray-600">
        <div className="bg-primary-light dark:bg-primary-dark rounded-full p-2">
          <User className="w-5 h-5 text-primary dark:text-[#F8FAFB]" />
        </div>
        <div className="flex-grow">
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">{displayName()}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || t('profile.emailLoading')}</p>
        </div>
        <Button 
          variant="ghost" 
          className="h-8 text-sm text-primary px-0 dark:text-primary"
          onClick={handleEditProfile}
        >
          {t('profile.edit')} &gt;
        </Button>
      </div>
      
      <div>
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          disabled={isSigningOut}
          className="w-full py-4 px-4 flex items-center justify-start gap-4 text-sm font-normal hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none border-0 h-auto disabled:opacity-50"
        >
          <div className="rounded-full p-2 bg-red-50 dark:bg-red-900">
            <LogOut className="w-5 h-5 text-red-500 dark:text-[#F8FAFB]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-red-500 dark:text-red-400 font-medium">
              {isSigningOut ? 'Saindo...' : t('profile.logout')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.endSession')}</span>
          </div>
        </Button>
      </div>
    </Card>
  );
};

export default UserInfo;
