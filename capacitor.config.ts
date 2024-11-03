import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'AttendWorkID',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    cleartext: true, // Permitir conexiones no seguras para desarrollo local
  },
  android: {
    webContentsDebuggingEnabled: true, // Depuración de contenido web en Android
  }
};

export default config;
