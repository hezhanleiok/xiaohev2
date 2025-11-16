import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xiaohev2.app',
  appName: 'xiaohev2',
  webDir: '.',
  // The server block is removed as this is a static web app
  // without a local dev server.
};

export default config;
