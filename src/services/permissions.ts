
import { Capacitor } from '@capacitor/core';
import { Camera, CameraPermissionState } from '@capacitor/camera';
import { PushNotifications, PermissionStatus as PushPermissionStatus } from '@capacitor/push-notifications';

export interface PermissionStatus {
  camera: boolean;
  notifications: boolean;
  hasChecked: boolean;
}

export class PermissionsManager {
  private static STORAGE_KEY = 'app_permissions_requested';

  static async hasRequestedPermissions(): Promise<boolean> {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  static markPermissionsAsRequested(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  static async requestCameraPermissions(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Para plataformas nativas (iOS/Android) - usar o plugin real
        console.log('Requesting native camera permissions...');
        const permissions = await Camera.requestPermissions({
          permissions: ['camera', 'photos']
        });
        
        console.log('Camera permissions result:', permissions);
        return permissions.camera === 'granted' && permissions.photos === 'granted';
      } else {
        // Para web - tentar getUserMedia para disparar o popup do navegador
        console.log('Requesting web camera permissions...');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('Web camera permission granted');
            return true;
          } catch (error) {
            console.error('Web camera permission denied:', error);
            return false;
          }
        }
        // Fallback para web se não conseguir verificar
        return true;
      }
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Para plataformas nativas - usar o plugin real
        console.log('Requesting native push notification permissions...');
        const result = await PushNotifications.requestPermissions();
        
        console.log('Push notification permissions result:', result);
        return result.receive === 'granted';
      } else {
        // Para web - usar a API nativa do navegador
        console.log('Requesting web notification permissions...');
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('Web notification permission:', permission);
          return permission === 'granted';
        }
        // Fallback para web se não suportado
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async checkCurrentPermissions(): Promise<PermissionStatus> {
    try {
      let cameraGranted = false;
      let notificationsGranted = false;

      if (Capacitor.isNativePlatform()) {
        try {
          // Verificar permissões da câmera
          const cameraStatus = await Camera.checkPermissions();
          console.log('Current camera permissions:', cameraStatus);
          cameraGranted = cameraStatus.camera === 'granted' && cameraStatus.photos === 'granted';
        } catch (error) {
          console.error('Error checking camera permissions:', error);
        }

        try {
          // Verificar permissões de notificações
          const notificationStatus = await PushNotifications.checkPermissions();
          console.log('Current push notification permissions:', notificationStatus);
          notificationsGranted = notificationStatus.receive === 'granted';
        } catch (error) {
          console.error('Error checking notification permissions:', error);
        }
      } else {
        // Para web
        cameraGranted = true; // Assumir disponível para web
        
        if ('Notification' in window) {
          notificationsGranted = Notification.permission === 'granted';
        } else {
          notificationsGranted = true;
        }
      }

      return {
        camera: cameraGranted,
        notifications: notificationsGranted,
        hasChecked: true
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        notifications: false,
        hasChecked: true
      };
    }
  }

  static async requestAllPermissions(): Promise<PermissionStatus> {
    console.log('Starting permission request flow...');
    
    // Solicitar permissões uma por vez para garantir que os popups apareçam
    console.log('Requesting camera permissions...');
    const cameraGranted = await this.requestCameraPermissions();
    
    console.log('Requesting notification permissions...');
    const notificationsGranted = await this.requestNotificationPermissions();
    
    // Marcar como solicitado
    this.markPermissionsAsRequested();
    
    const status: PermissionStatus = {
      camera: cameraGranted,
      notifications: notificationsGranted,
      hasChecked: true
    };
    
    console.log('Final permission status:', status);
    return status;
  }
}
