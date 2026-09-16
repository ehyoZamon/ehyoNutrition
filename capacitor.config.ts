import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ehyonutrition.app',
  appName: 'NutritionLib',
  webDir: 'out',
  android: {
    adjustMarginsForEdgeToEdge: 'disable',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true, // edge-to-edge с самого запуска, ещё до JS
      style: 'DARK',         // тёмные иконки — подходят под светлый #fefefe
    },
  },
};

export default config;
