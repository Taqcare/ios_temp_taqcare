
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taqcare.app',
  appName: 'Taqcare',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  // Deep linking configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Deep linking intent filters
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        category: ['DEFAULT', 'BROWSABLE'],
        data: [
          {
            scheme: 'https',
            host: 'app.taqcare.com'
          },
          {
            scheme: 'https', 
            host: 'jqqnscbbbrrzohnxhscg.lovable.dev'
          }
        ]
      }
    ]
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    // Associated domains for universal links
    associatedDomains: [
      'applinks:app.taqcare.com',
      'applinks:jqqnscbbbrrzohnxhscg.lovable.dev'
    ]
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    Camera: {
      web: {
        showFilePicker: true
      }
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
