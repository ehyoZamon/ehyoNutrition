import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.ehyonutridiary.app', //com.ehyonutrition.app
  appName: 'NutriDiary',
  webDir: 'out',
  plugins: {
    // ЕДИНСТВЕННЫЙ механизм обработки системных отступов (Capacitor 8).
    SystemBars: {
      insetsHandling: 'css', // CSS-переменные --safe-area-inset-* + env()
      initialViewportFitValueHint: 'cover',
    },
    // Клавиатура: нативный adjustResize, без JS-обёрток.
    // Если страницы начнут «прыгать» — попробуйте KeyboardResize.None.
    Keyboard: {
      resize: KeyboardResize.Native,
    },
    StatusBar: {
      overlaysWebView: true, // задаётся ТОЛЬКО здесь, в коде не дублируем
      style: 'DARK',
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#fefefe',
    },
  },
};

export default config;