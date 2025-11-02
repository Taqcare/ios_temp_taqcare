
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DeleteAccountSection = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      console.log('Iniciando processo de exclusão completa da conta para o usuário:', user.id);
      
      // Chamar a Edge Function para deletar a conta completamente
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message || 'Erro ao excluir conta');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Conta excluída com sucesso via edge function');
      
      // Fazer logout local (o usuário já foi deletado do sistema)
      try {
        await signOut();
      } catch (signOutError) {
        // Se der erro no signOut, apenas limpar estado local
        console.log('Erro no signOut (esperado, pois usuário foi deletado):', signOutError);
      }
      
      toast.success('Conta excluída com sucesso', {
        description: 'Sua conta e todos os dados foram removidos permanentemente.'
      });
      
      // Navegar para a página inicial
      navigate('/');
      
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta', {
        description: error.message || 'Ocorreu um erro ao tentar excluir sua conta. Tente novamente ou entre em contato com o suporte.'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="p-6 border-destructive/30 dark:bg-gray-800 dark:border-destructive/50">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle size={20} />
          {t('editProfile.deleteAccount')}
        </h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('editProfile.deleteAccountDesc')}
          </p>
          
          <div className="flex justify-end">
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? t('editProfile.deleting') : t('editProfile.deleteMyAccount')}
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-200">{t('editProfile.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              {t('editProfile.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              {t('editProfile.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('editProfile.deleting') : t('editProfile.confirmDeleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAccountSection;
