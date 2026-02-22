import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parasecure.paradox',
  appName: 'ParaSecure Paradox',
  webDir: 'out',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
};


export default config;
