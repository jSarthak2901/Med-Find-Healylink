import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f74e5957d5bb46308f9fa2f40f4f1a59',
  appName: 'healylink-app',
  webDir: 'dist',
  server: {
    url: 'https://f74e5957-d5bb-4630-8f9f-a2f40f4f1a59.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#2dd4bf',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;