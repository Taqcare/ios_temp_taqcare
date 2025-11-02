import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core';

// Function to initialize native capabilities
const initializeNativeCapabilities = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log('Running on native platform:', Capacitor.getPlatform());
    
    // Log device info for debugging
    try {
      const platform = Capacitor.getPlatform();
      console.log('Platform detected:', platform);
    } catch (error) {
      console.error('Error getting platform info:', error);
    }
  } else {
    console.log('Running on web platform');
  }
};

// Store the last app usage time in localStorage
const now = new Date().toISOString();
const lastUsage = localStorage.getItem('last_app_usage');
localStorage.setItem('last_app_usage', now);

// If app hasn't been used in the last hour, we'll show the splash screen
// Otherwise we'll set a flag to skip it
if (lastUsage) {
  const lastDate = new Date(lastUsage);
  const currentDate = new Date();
  const diffInMinutes = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60);
  
  // If used within the last 60 minutes, skip the intro
  if (diffInMinutes < 60) {
    window.sessionStorage.setItem('skip_intro', 'true');
  }
}

// Initialize the app
const initializeApp = async () => {
  try {
    await initializeNativeCapabilities();
    
    // Create and render the React app
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    
    // Fallback: render the app anyway
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
  }
};

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
