import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.absensi.hrd',
  appName: 'Absensi',
  webDir: 'out',
  server: {
    url: 'https://absenin.online',
    cleartext: true
  }
};

export default config;
