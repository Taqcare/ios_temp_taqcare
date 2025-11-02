
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Bell, Shield, Check, X, Loader2 } from 'lucide-react';
import { PermissionsManager, PermissionStatus } from '@/services/permissions';
import { toast } from '@/components/ui/sonner';

interface PermissionRequestProps {
  onComplete: (status: PermissionStatus) => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ onComplete }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'camera' | 'notifications' | 'complete'>('idle');

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      console.log('User clicked "Permitir Acesso" - starting permission flow');
      
      // Mostrar que está solicitando câmera
      setCurrentStep('camera');
      toast.info("Solicitando permissão da câmera...", {
        description: "Por favor, permita o acesso quando solicitado."
      });
      
      // Pequeno delay para o usuário ver o feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cameraGranted = await PermissionsManager.requestCameraPermissions();
      console.log('Camera permission result:', cameraGranted);
      
      // Mostrar que está solicitando notificações
      setCurrentStep('notifications');
      toast.info("Solicitando permissão de notificações...", {
        description: "Por favor, permita o acesso quando solicitado."
      });
      
      // Pequeno delay para o usuário ver o feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const notificationsGranted = await PermissionsManager.requestNotificationPermissions();
      console.log('Notifications permission result:', notificationsGranted);
      
      // Marcar como solicitado e criar status final
      PermissionsManager.markPermissionsAsRequested();
      
      const finalStatus: PermissionStatus = {
        camera: cameraGranted,
        notifications: notificationsGranted,
        hasChecked: true
      };
      
      setPermissionStatus(finalStatus);
      setCurrentStep('complete');
      
      // Mostrar feedback baseado no resultado
      if (finalStatus.camera && finalStatus.notifications) {
        toast.success("Permissões concedidas!", {
          description: "Todas as permissões foram concedidas com sucesso."
        });
      } else {
        const denied = [];
        if (!finalStatus.camera) denied.push("câmera/galeria");
        if (!finalStatus.notifications) denied.push("notificações");
        
        toast.warning("Algumas permissões foram negadas", {
          description: `Permissões negadas: ${denied.join(", ")}. Você pode alterá-las nas configurações do dispositivo.`
        });
      }
      
      // Continuar independentemente do resultado
      setTimeout(() => {
        onComplete(finalStatus);
      }, 2000);
      
    } catch (error) {
      console.error('Error in permission flow:', error);
      toast.error("Erro ao solicitar permissões", {
        description: "Ocorreu um erro. Continuando sem algumas funcionalidades."
      });
      
      // Continuar mesmo com erro
      setTimeout(() => {
        onComplete({
          camera: false,
          notifications: false,
          hasChecked: true
        });
      }, 2000);
    } finally {
      setIsRequesting(false);
    }
  };

  if (permissionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-light to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mb-6">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuração Concluída!</h2>
            <p className="text-gray-600">Redirecionando para o app...</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Câmera/Galeria</span>
              </div>
              {permissionStatus.camera ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Notificações</span>
              </div>
              {permissionStatus.notifications ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="bg-primary-light rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Permissões do App</h2>
          <p className="text-gray-600">Para uma melhor experiência, precisamos de algumas permissões</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
            currentStep === 'camera' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
          }`}>
            <div className="bg-blue-100 rounded-full p-2 relative">
              <Camera className="w-5 h-5 text-blue-600" />
              {currentStep === 'camera' && (
                <Loader2 className="w-3 h-3 text-blue-600 animate-spin absolute -top-1 -right-1" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Câmera e Galeria</h3>
              <p className="text-sm text-gray-600 mt-1">
                Para capturar e selecionar fotos do seu progresso no tratamento
              </p>
            </div>
          </div>
          
          <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
            currentStep === 'notifications' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'
          }`}>
            <div className="bg-purple-100 rounded-full p-2 relative">
              <Bell className="w-5 h-5 text-purple-600" />
              {currentStep === 'notifications' && (
                <Loader2 className="w-3 h-3 text-purple-600 animate-spin absolute -top-1 -right-1" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Notificações</h3>
              <p className="text-sm text-gray-600 mt-1">
                Para lembrá-lo(a) das suas sessões e acompanhar seu progresso
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRequestPermissions}
            disabled={isRequesting}
            className="w-full bg-primary hover:bg-pink-600"
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Solicitando Permissões...
              </>
            ) : (
              'Permitir Acesso'
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Você pode alterar essas permissões a qualquer momento nas configurações do seu dispositivo.
        </p>
      </Card>
    </div>
  );
};

export default PermissionRequest;
