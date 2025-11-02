import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export interface DeepLinkHandler {
  pattern: RegExp;
  handler: (path: string, fullUrl: string) => void;
}

class DeepLinkingService {
  private handlers: DeepLinkHandler[] = [];
  private router: any = null;

  constructor() {
    this.initializeListener();
  }

  setRouter(router: any) {
    this.router = router;
  }

  addHandler(pattern: RegExp, handler: (path: string, fullUrl: string) => void) {
    this.handlers.push({ pattern, handler });
  }

  private async initializeListener() {
    console.log('Initializing deep linking service...');
    console.log('Platform:', Capacitor.getPlatform());
    console.log('Is native platform:', Capacitor.isNativePlatform());
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Deep linking only works on native platforms, skipping setup');
      return;
    }

    // Listen for app URL open events
    App.addListener('appUrlOpen', (event) => {
      console.log('🔗 Deep link opened:', event.url);
      this.handleDeepLink(event.url);
    });

    // Check if app was opened with a URL
    try {
      const urlOpen = await App.getLaunchUrl();
      if (urlOpen?.url) {
        console.log('🚀 App launched with URL:', urlOpen.url);
        // Delay handling to ensure app is fully loaded
        setTimeout(() => {
          this.handleDeepLink(urlOpen.url);
        }, 1000);
      } else {
        console.log('App launched without URL');
      }
    } catch (error) {
      console.error('Error getting launch URL:', error);
    }
  }

  private handleDeepLink(url: string) {
    try {
      console.log('🔗 Processing deep link:', url);
      
      // Extract path from the URL
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search + urlObj.hash;
      
      console.log('📍 Extracted path:', path);
      console.log('🎯 Available handlers:', this.handlers.length);

      // Try to match with registered handlers
      for (const handler of this.handlers) {
        console.log('Testing pattern:', handler.pattern);
        if (handler.pattern.test(path)) {
          console.log('✅ Pattern matched, executing handler');
          handler.handler(path, url);
          return;
        }
      }

      console.log('⚡ No specific handler matched, using default routing');
      // Default routing if no specific handler matches
      this.handleDefaultRouting(path);
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  private handleDefaultRouting(path: string) {
    if (!this.router) {
      console.warn('Router not set for deep linking');
      return;
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Define route mappings
    const routeMap: { [key: string]: string } = {
      'perfil': '/profile',
      'profile': '/profile',
      'agendamento': '/schedule',
      'schedule': '/schedule',
      'educacao': '/educational-hub',
      'educational-hub': '/educational-hub',
      'informacoes-pele': '/skin-info',
      'skin-info': '/skin-info',
      'dashboard': '/dashboard',
      '': '/dashboard', // Default to dashboard for empty path
    };

    // Find matching route
    let targetRoute = '/dashboard'; // Default fallback
    
    for (const [key, route] of Object.entries(routeMap)) {
      if (cleanPath.startsWith(key)) {
        targetRoute = route;
        break;
      }
    }

    console.log(`Navigating to: ${targetRoute}`);
    
    // Navigate using the router
    if (this.router.navigate) {
      this.router.navigate(targetRoute);
    } else if (this.router.push) {
      this.router.push(targetRoute);
    } else {
      // Fallback to window.location if router methods not available
      window.location.href = targetRoute;
    }
  }

  // Method to manually trigger a deep link (useful for testing)
  testDeepLink(url: string) {
    this.handleDeepLink(url);
  }
}

// Export singleton instance
export const deepLinkingService = new DeepLinkingService();

// Helper function to register common handlers
export const registerCommonHandlers = () => {
  // Reset password handler
  deepLinkingService.addHandler(
    /^\/reset-password/,
    (path) => {
      console.log('Handling reset password deep link');
      window.location.href = `/reset-password${path.includes('?') ? path.substring(path.indexOf('?')) : ''}`;
    }
  );

  // Profile handler with specific sections
  deepLinkingService.addHandler(
    /^\/perfil|^\/profile/,
    (path) => {
      console.log('Handling profile deep link');
      if (deepLinkingService['router']) {
        deepLinkingService['router'].navigate('/profile');
      }
    }
  );

  // Product/treatment specific handlers can be added here
  deepLinkingService.addHandler(
    /^\/tratamento|^\/treatment/,
    (path) => {
      console.log('Handling treatment deep link');
      // Could extract treatment ID from path and navigate to specific treatment
      if (deepLinkingService['router']) {
        deepLinkingService['router'].navigate('/dashboard');
      }
    }
  );
};